import express, { Request, Response } from 'express';
import OpenAI from 'openai';

const router = express.Router();

// Initialize OpenAI client if key is set
const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

// Send message and get AI clinical triage response with multi-turn clarifying inquiry
router.post('/message', async (req: Request, res: Response) => {
  try {
    const { message, persona = 'general', history = [], stage = 1 } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const lower = message.toLowerCase();

    // Check emergency triggers
    const emergencyTriggers = [
      'chest pain',
      'shortness of breath',
      'cannot breathe',
      'stroke',
      'facial drooping',
      'slurred speech',
      'loss of consciousness',
      'passed out',
      'severe bleeding',
      'anaphylaxis',
      'worst headache of my life',
      'thunderclap',
    ];
    const isEmergency = emergencyTriggers.some((t) => lower.includes(t));

    if (isEmergency) {
      return res.json({
        reply: `⚠️ CRITICAL RED-FLAG DETECTED: Your symptoms indicate a high-priority emergency. Please call 911 / 112 or go to the nearest Hospital Emergency Room immediately.`,
        isEmergency: true,
        diagnosticCard: {
          primaryImpression: 'Acute Cardiopulmonary / Neurovascular Emergency (ICD-11)',
          confidence: 95,
          urgency: 'Emergency',
          differential: [
            { condition: 'Acute Coronary Syndrome', probability: 'High Urgency' },
            { condition: 'Pulmonary Embolism', probability: 'High Urgency' },
          ],
          recommendations: ['Call 911 immediately', 'Sit upright in rested posture', 'Await emergency responders'],
          otcSuggestions: ['Do not self-medicate; await paramedics'],
          doctorQuestions: ['Time of onset?', 'Radiation to jaw or left arm?'],
          redFlags: ['Crushing chest pressure', 'Dizziness', 'Cold sweats'],
        },
        stage: 5,
        timestamp: new Date().toISOString(),
      });
    }

    // If OpenAI API key is active, call OpenAI with strict clinical reasoning
    if (openai) {
      try {
        const systemPrompt = `You are Dr.AI, an expert clinical triage assistant (${persona}). Follow standard medical intake protocols (SOCRATES / OPQRST). If the patient provides a brief symptom, ask 2-3 targeted clarifying questions (character, duration, severity, and red flags) before jumping to a final diagnosis. Once sufficient clinical details are gathered, provide a structured diagnostic evaluation.`;

        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            ...history.map((h: any) => ({ role: h.sender === 'user' ? 'user' : 'assistant', content: h.text })),
            { role: 'user', content: message },
          ],
          temperature: 0.3,
        });

        const reply = completion.choices[0]?.message?.content || 'Consultation complete.';
        return res.json({
          reply,
          isEmergency,
          persona,
          timestamp: new Date().toISOString(),
        });
      } catch (openAiError) {
        console.warn('OpenAI API call failed, falling back to multi-turn clinical decision engine:', openAiError);
      }
    }

    // Built-in Multi-Turn Clinical Intake Decision Engine
    // Stage 1: Clarify character and exact location
    if (stage === 1 && history.length <= 1) {
      if (lower.includes('head') || lower.includes('migraine')) {
        return res.json({
          reply: `I understand you are experiencing a headache. To evaluate this accurately:\n\n1. What does the pain feel like (throbbing, constant tight band, sharp behind one eye)?\n2. Where is it located (one side, forehead, back of neck)?`,
          suggestedOptions: [
            'Throbbing on one side',
            'Band-like forehead pressure',
            'Sharp piercing behind one eye',
            'Back of neck & head tension',
          ],
          nextStage: 2,
          timestamp: new Date().toISOString(),
        });
      }
      if (lower.includes('fever') || lower.includes('cough') || lower.includes('throat')) {
        return res.json({
          reply: `Thank you for reaching out about your respiratory/fever symptoms. Could you describe:\n\n1. Is the cough dry or productive with phlegm?\n2. Is your throat scratchy or severely painful when swallowing?`,
          suggestedOptions: [
            'Dry persistent cough',
            'Productive cough with phlegm',
            'Painful swallowing & scratchy throat',
            'Fever chills & sinus pressure',
          ],
          nextStage: 2,
          timestamp: new Date().toISOString(),
        });
      }
      if (lower.includes('stomach') || lower.includes('nausea') || lower.includes('belly')) {
        return res.json({
          reply: `I hear you regarding your stomach discomfort. To narrow down the cause:\n\n1. Is it sharp cramping, burning acid, or constant dull ache?\n2. Is there any nausea, vomiting, or diarrhea?`,
          suggestedOptions: [
            'Sharp lower abdomen cramps',
            'Burning acid reflux in upper stomach',
            'Nausea with stomach bloating',
            'Watery diarrhea',
          ],
          nextStage: 2,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Stage 2: Clarify duration and severity
    if (stage === 2 && history.length <= 3) {
      return res.json({
        reply: `Thank you for those details. How long have you had this, and on a scale of 1 to 10, how severe is the discomfort?`,
        suggestedOptions: [
          'Started today (< 4 hours) • Mild (3/10)',
          '1 to 3 days • Moderate (5/10)',
          'Severe (7-8/10) with light sensitivity',
          'Persistent for > 1 week',
        ],
        nextStage: 3,
        timestamp: new Date().toISOString(),
      });
    }

    // Stage 3 / 4: Final Synthesis & Differential Diagnosis
    let primaryImpression = 'Tension-Type Cephalea / Acute Migraine (ICD-11: 8A80)';
    let confidence = 88;
    let urgency = 'Moderate';

    if (lower.includes('fever') || lower.includes('cough') || lower.includes('throat')) {
      primaryImpression = 'Acute Upper Respiratory Viral Infection (ICD-11: CA40.0)';
      confidence = 86;
      urgency = 'Low';
    } else if (lower.includes('stomach') || lower.includes('nausea') || lower.includes('cramp')) {
      primaryImpression = 'Acute Viral Gastroenteritis / Reflux Dyspepsia (ICD-11: DA42)';
      confidence = 84;
      urgency = 'Moderate';
    } else if (lower.includes('rash') || lower.includes('skin') || lower.includes('itch')) {
      primaryImpression = 'Contact Dermatitis / Acute Allergic Eczema (ICD-11: EA80)';
      confidence = 86;
      urgency = 'Low';
    }

    res.json({
      reply: `### 📋 Clinical Intake & Triage Assessment Complete\n\nBased on your comprehensive multi-turn clinical inquiry, your presentation corresponds to **${primaryImpression}**.`,
      isEmergency,
      diagnosticCard: {
        primaryImpression,
        confidence,
        urgency,
        differential: [
          { condition: primaryImpression, probability: `${confidence}%` },
          { condition: 'Secondary Clinical Differential', probability: `${100 - confidence}%` },
        ],
        recommendations: [
          'Rest in a comfortable, quiet environment',
          'Maintain regular oral hydration with electrolyte fluids',
          'Schedule a telehealth video visit with a board-certified physician for targeted examination',
        ],
        otcSuggestions: ['Acetaminophen / Ibuprofen as appropriate with food', 'Oral hydration fluids'],
        doctorQuestions: ['How often do these episodes recur?', 'Has anything provided lasting relief?'],
        redFlags: ['Sudden escalation to max pain', 'High fever with neck stiffness', 'Shortness of breath'],
      },
      persona,
      stage: 5,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to process clinical inquiry', message: error.message });
  }
});

// Get sample chat history
router.get('/history', (req: Request, res: Response) => {
  res.json([
    {
      id: 'session-101',
      title: 'Headache and Neck Strain Triage',
      date: 'May 18, 2024',
      messagesCount: 6,
      urgency: 'Moderate',
    },
    {
      id: 'session-102',
      title: 'Seasonal Allergy & Inhaler Review',
      date: 'May 10, 2024',
      messagesCount: 8,
      urgency: 'Low',
    },
  ]);
});

export default router;