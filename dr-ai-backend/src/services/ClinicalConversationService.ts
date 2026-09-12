import OpenAI from 'openai';
import { config } from '../config/env';
import { ValidationError } from '../errors/AppError';

export interface StructuredClinicalAssessment {
  summary: string;
  possibleConditions: Array<{
    name: string;
    description: string;
    urgency: 'Low' | 'Moderate' | 'High' | 'Emergency';
  }>;
  redFlags: string[];
  recommendedNextStep: string;
  urgency: 'Low' | 'Moderate' | 'High' | 'Emergency';
  isEmergency: boolean;
  disclaimer: string;
  confidence: null; // Explicitly null: no fabricated numerical percentage
  model: string;
  provenance: 'llm_triage' | 'emergency_escalation' | 'simulated_fallback';
  generatedAt: string;
}

export interface ConversationTurn {
  sender: 'user' | 'assistant';
  content: string;
}

export interface ClinicalRequest {
  message: string;
  persona?: string;
  history?: ConversationTurn[];
  userId?: string;
}

const EMERGENCY_PATTERNS = [
  { pattern: /chest\s*pain|heart\s*attack|crushing\s*chest/i, reason: 'Suspected acute coronary syndrome / chest pain emergency' },
  { pattern: /shortness\s*of\s*breath|cannot\s*breathe|severe\s*dyspnea|gasping\s*for\s*air/i, reason: 'Acute respiratory distress' },
  { pattern: /facial\s*droop|slurred\s*speech|arm\s*weakness|stroke/i, reason: 'Suspected acute neurovascular event / stroke' },
  { pattern: /loss\s*of\s*consciousness|passed\s*out|blackout|syncope/i, reason: 'Unexplained loss of consciousness' },
  { pattern: /severe\s*bleeding|coughing\s*up\s*blood|vomiting\s*blood|hemoptysis/i, reason: 'Acute hemorrhage' },
  { pattern: /suicid|kill\s*myself|end\s*my\s*life|self\s*harm/i, reason: 'Immediate psychiatric / self-harm emergency' },
  { pattern: /anaphylaxis|throat\s*closing|swelling\s*of\s*lips|severe\s*allergic/i, reason: 'Severe systemic allergic reaction / anaphylaxis' },
  { pattern: /worst\s*headache\s*of\s*my\s*life|thunderclap\s*headache/i, reason: 'Suspected subarachnoid hemorrhage' },
];

const STANDARD_DISCLAIMER =
  'Notice: This AI-generated assessment is for educational and triage guidance only. It is not a medical diagnosis or a substitute for professional clinical judgment from a licensed healthcare professional.';

export class ClinicalConversationService {
  private openai: OpenAI | null = null;

  constructor() {
    if (config.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });
    }
  }

  /**
   * Evaluates input against safety critical patterns for acute escalation.
   */
  public evaluateSafety(text: string): { isEmergency: boolean; reason?: string } {
    for (const trigger of EMERGENCY_PATTERNS) {
      if (trigger.pattern.test(text)) {
        return { isEmergency: true, reason: trigger.reason };
      }
    }
    return { isEmergency: false };
  }

  /**
   * Processes a clinical user inquiry through safety evaluation, optional LLM provider, or explicit fallback.
   */
  public async processMessage(req: ClinicalRequest): Promise<StructuredClinicalAssessment> {
    const text = req.message?.trim();
    if (!text) {
      throw new ValidationError('Message content is required');
    }

    // 1. Critical Safety Evaluation (Emergency escalation takes absolute priority)
    const safety = this.evaluateSafety(text);
    if (safety.isEmergency) {
      return {
        summary: `EMERGENCY ALERT: Your reported symptoms indicate a potential high-acuity medical emergency (${safety.reason}). Immediate in-person professional intervention is required.`,
        possibleConditions: [
          {
            name: safety.reason || 'High-Risk Acute Emergency',
            description: 'Immediate clinical evaluation required to rule out life-threatening illness.',
            urgency: 'Emergency',
          },
        ],
        redFlags: [
          'Immediate medical dispatch required',
          'Do not drive yourself to the emergency department',
          'Have someone remain with you while awaiting emergency services',
        ],
        recommendedNextStep: 'Call 911 (US), 112 (Europe), 999 (UK) or proceed immediately to the nearest Emergency Department.',
        urgency: 'Emergency',
        isEmergency: true,
        disclaimer: STANDARD_DISCLAIMER,
        confidence: null,
        model: 'emergency-safety-rule-layer',
        provenance: 'emergency_escalation',
        generatedAt: new Date().toISOString(),
      };
    }

    // 2. If OpenAI is configured, invoke model with structured output requirement
    if (this.openai) {
      try {
        const systemPrompt = `You are an AI Clinical Assistant assisting with medical triage.
Your role is educational only.
You MUST output ONLY a valid JSON object strictly matching this schema:
{
  "summary": "Brief neutral clinical summary of patient complaints",
  "possibleConditions": [
    {
      "name": "Condition name (AI-generated possibility)",
      "description": "Short explanation",
      "urgency": "Low" | "Moderate" | "High" | "Emergency"
    }
  ],
  "redFlags": ["Red flag 1", "Red flag 2"],
  "recommendedNextStep": "Specific safe action e.g. schedule non-emergency consult",
  "urgency": "Low" | "Moderate" | "High" | "Emergency"
}
Rules:
- NEVER invent numerical diagnostic confidence percentages.
- NEVER declare a confirmed diagnosis. Use 'possible considerations'.
- If symptoms are potentially serious, set urgency to 'High' or 'Emergency'.
- Return RAW JSON ONLY. No markdown wrappers.`;

        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
          { role: 'system', content: systemPrompt },
        ];

        if (req.history && Array.isArray(req.history)) {
          for (const turn of req.history.slice(-6)) {
            messages.push({
              role: turn.sender === 'user' ? 'user' : 'assistant',
              content: turn.content,
            });
          }
        }

        messages.push({ role: 'user', content: text });

        const completion = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages,
          temperature: 0.2,
          max_tokens: 600,
        });

        const rawContent = completion.choices[0]?.message?.content || '{}';
        let parsed: any;
        try {
          // Strip optional markdown fences if present
          const cleanJson = rawContent.replace(/^```json\s*/, '').replace(/```$/, '').trim();
          parsed = JSON.parse(cleanJson);
        } catch {
          parsed = {
            summary: rawContent,
            possibleConditions: [{ name: 'Clinical review recommended', description: rawContent, urgency: 'Moderate' }],
            redFlags: [],
            recommendedNextStep: 'Consult a healthcare professional for in-depth evaluation',
            urgency: 'Moderate',
          };
        }

        return {
          summary: parsed.summary || 'Clinical inquiry processed.',
          possibleConditions: Array.isArray(parsed.possibleConditions) ? parsed.possibleConditions : [],
          redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : [],
          recommendedNextStep: parsed.recommendedNextStep || 'Consult a healthcare provider.',
          urgency: ['Low', 'Moderate', 'High', 'Emergency'].includes(parsed.urgency) ? parsed.urgency : 'Low',
          isEmergency: parsed.urgency === 'Emergency',
          disclaimer: STANDARD_DISCLAIMER,
          confidence: null,
          model: 'gpt-3.5-turbo',
          provenance: 'llm_triage',
          generatedAt: new Date().toISOString(),
        };
      } catch (err) {
        console.warn('OpenAI provider call failed; using explicit demo fallback mode:', err);
      }
    }

    // 3. Explicit Demo Workflow (Honest fallback with zero false confidence claims)
    return this.generateExplicitDemoResponse(text, req.persona);
  }

  private generateExplicitDemoResponse(text: string, persona: string = 'general'): StructuredClinicalAssessment {
    const lower = text.toLowerCase();
    let conditionName = 'Symptom Consideration for Physician Review';
    let urgency: 'Low' | 'Moderate' | 'High' = 'Low';
    let desc = 'Non-specific symptom cluster noted. Professional clinical interview advised.';
    let redFlags = ['Unexplained worsening over 48 hours', 'Development of high fever or shortness of breath'];

    if (lower.includes('head') || lower.includes('migraine')) {
      conditionName = 'Possible Tension Cephalea or Migraine-type Symptom Pattern';
      urgency = 'Moderate';
      desc = 'Reported symptoms resemble recurring or acute cephalalgia patterns.';
      redFlags = ['Sudden onset severe intensity', 'Accompanying visual aura or stiff neck'];
    } else if (lower.includes('fever') || lower.includes('cough') || lower.includes('throat')) {
      conditionName = 'Possible Upper Respiratory Tract Symptom Pattern';
      urgency = 'Low';
      desc = 'Symptoms consistent with acute viral respiratory irritation.';
      redFlags = ['Difficulty swallowing liquids', 'Audible wheezing or breathing discomfort', 'Fever lasting > 3 days'];
    } else if (lower.includes('stomach') || lower.includes('belly') || lower.includes('nausea')) {
      conditionName = 'Possible Gastrointestinal Irritation Pattern';
      urgency = 'Moderate';
      desc = 'Symptoms consistent with acute gastric upset or dietary sensitivity.';
      redFlags = ['Inability to retain fluids for 24 hours', 'Severe localized abdominal tenderness'];
    } else if (lower.includes('rash') || lower.includes('skin') || lower.includes('itch')) {
      conditionName = 'Possible Cutaneous / Dermatological Irritation';
      urgency = 'Low';
      desc = 'Surface dermatological reaction or mild contact hypersensitivity.';
      redFlags = ['Rapid spreading across large body surface', 'Facial swelling or mucosal involvement'];
    }

    return {
      summary: `[Demo Clinical Workflow] Evaluated chief complaint: "${text}". Primary AI persona: ${persona}.`,
      possibleConditions: [
        {
          name: conditionName,
          description: desc,
          urgency,
        },
      ],
      redFlags,
      recommendedNextStep: 'Schedule a consultation with a licensed doctor for examination and definitive diagnostic care.',
      urgency,
      isEmergency: false,
      disclaimer: STANDARD_DISCLAIMER + ' [Operating in Demo Mode: No live AI provider key configured].',
      confidence: null,
      model: 'demo-clinical-ruleset-v1',
      provenance: 'simulated_fallback',
      generatedAt: new Date().toISOString(),
    };
  }
}

export const clinicalService = new ClinicalConversationService();
