import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  IconButton,
  Paper,
  Avatar,
  Chip,
  Button,
  Grid,
  Tooltip,
  Divider,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bot,
  Send,
  User,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Image as ImageIcon,
  Download,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Video,
  CheckCircle2,
  HelpCircle,
  Stethoscope,
  ShieldCheck,
  Zap,
  ArrowRight,
} from 'lucide-react';
import jsPDF from 'jspdf';
import { useAuth } from '../context/AuthContext';
import { useAppointments } from '../context/AppointmentContext';
import { EmergencyModal } from '../components/EmergencyModal';
import { BookingModal } from '../components/BookingModal';

interface SpecialistPersona {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  greeting: string;
  systemRole: string;
  color: string;
}

const SPECIALIST_PERSONAS: SpecialistPersona[] = [
  {
    id: 'general',
    name: 'Dr. AI Generalist',
    specialty: 'Internal Medicine & Triage',
    avatar: '🩺',
    greeting: "Hello! I'm Dr. AI. To provide an accurate, hospital-grade clinical overview, I will ask you a few targeted questions about your symptoms. What is your primary health concern today?",
    systemRole: 'General Internal Medicine Physician',
    color: '#10B981',
  },
  {
    id: 'pediatric',
    name: 'Dr. AI Pediatrics',
    specialty: 'Child & Adolescent Care',
    avatar: '👶',
    greeting: "Hello! I am Dr. AI Pediatric Specialist. Let's walk through your child's symptoms step-by-step to assess their condition accurately. What symptoms are you noticing?",
    systemRole: 'Board Certified Pediatrician',
    color: '#06B6D4',
  },
  {
    id: 'derma',
    name: 'Dr. AI Dermatology',
    specialty: 'Skin, Hair & Lesions',
    avatar: '🧴',
    greeting: "Welcome! I specialize in dermatology. You can describe your skin rash, lesion, or itch, or upload a clear photo for an in-depth clinical evaluation.",
    systemRole: 'Consultant Dermatologist',
    color: '#F59E0B',
  },
  {
    id: 'cardio',
    name: 'Dr. AI Cardiology',
    specialty: 'Heart & Blood Pressure',
    avatar: '❤️',
    greeting: "Hello. I evaluate cardiovascular health, pulse irregularities, and blood pressure patterns through structured clinical triage. What symptoms are you experiencing?",
    systemRole: 'Cardiologist',
    color: '#EF4444',
  },
  {
    id: 'mental',
    name: 'Dr. AI Mental Wellness',
    specialty: 'Psychiatry & Emotional Health',
    avatar: '🧘',
    greeting: "Hi there. I provide a confidential, supportive clinical space for assessing anxiety, burnout, mood changes, and sleep patterns. What is on your mind today?",
    systemRole: 'Psychiatrist & Cognitive Therapist',
    color: '#8B5CF6',
  },
];

interface DiagnosticCard {
  primaryImpression: string;
  confidence: number;
  urgency: 'Low' | 'Moderate' | 'High' | 'Emergency';
  differential: Array<{ condition: string; probability: string }>;
  recommendations: string[];
  otcSuggestions: string[];
  doctorQuestions: string[];
  redFlags: string[];
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  image?: string;
  diagnosticCard?: DiagnosticCard;
  suggestedOptions?: string[];
}

interface InterviewState {
  stage: number; // 1: Chief Complaint, 2: Character/Location, 3: Duration/Severity, 4: Associated/Red Flags, 5: Assessment
  chiefComplaint: string;
  characterLocation: string;
  durationSeverity: string;
  associatedSymptoms: string[];
}

export const Chat: React.FC = () => {
  const { user } = useAuth();
  const { doctors } = useAppointments();
  const location = useLocation();
  const navigate = useNavigate();

  const [activePersona, setActivePersona] = useState<SpecialistPersona>(SPECIALIST_PERSONAS[0]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-init',
      sender: 'ai',
      text: SPECIALIST_PERSONAS[0].greeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedOptions: [
        '🤕 Throbbing Headache',
        '🌡️ Fever & Sore Throat',
        '🧴 Itchy Skin Rash',
        '🫄 Stomach Pain & Nausea',
        '🫁 Shortness of Breath',
        '💥 Joint / Muscle Aches',
      ],
    },
  ]);
  const [interview, setInterview] = useState<InterviewState>({
    stage: 1,
    chiefComplaint: '',
    characterLocation: '',
    durationSeverity: '',
    associatedSymptoms: [],
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [emergencySymptom, setEmergencySymptom] = useState('');
  const [bookingOpen, setBookingOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse URL query params (e.g. ?symptoms=Headache)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const symptoms = params.get('symptoms');
    if (symptoms) {
      handleUserMessage(`I am experiencing: ${decodeURIComponent(symptoms)}`);
    }
  }, [location.search]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Voice Speech Recognition setup
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  // Text-to-Speech Audio Playback
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = text.replace(/[*#_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Handle Photo / File Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Multi-Turn Adaptive Clinical Interview Engine
  const processInterviewStep = (
    userText: string,
    currentInterview: InterviewState
  ): { reply: string; card?: DiagnosticCard; nextOptions?: string[]; nextStage: number } => {
    const lower = userText.toLowerCase();

    // Check emergency triggers at ANY stage
    const emergencyTriggers = [
      'chest pain',
      'heart attack',
      'shortness of breath',
      'cannot breathe',
      'stroke',
      'facial drooping',
      'slurred speech',
      'loss of consciousness',
      'passed out',
      'coughing blood',
      'severe bleeding',
      'anaphylaxis',
      'worst headache of my life',
      'thunderclap',
    ];

    const isEmergency = emergencyTriggers.some((t) => lower.includes(t));
    if (isEmergency) {
      const trigger = emergencyTriggers.find((t) => lower.includes(t)) || 'Acute Emergency Symptoms';
      setEmergencySymptom(trigger);
      setEmergencyOpen(true);

      return {
        reply: `⚠️ **CRITICAL RED-FLAG ALERT DETECTED:** You reported symptoms consistent with an acute cardiopulmonary or neurovascular emergency ("${trigger}").\n\nPlease dial **911 / 112** or go to the nearest Hospital Emergency Department immediately. Do not drive yourself.`,
        card: {
          primaryImpression: 'Possible Acute Cardiopulmonary / Neurovascular Emergency',
          confidence: 95,
          urgency: 'Emergency',
          differential: [
            { condition: 'Acute Coronary Syndrome / Myocardial Infarction', probability: 'High Urgency' },
            { condition: 'Pulmonary Embolism / Acute Respiratory Compromise', probability: 'High Urgency' },
            { condition: 'Acute Subarachnoid Hemorrhage / Neuro Event', probability: 'High Urgency' },
          ],
          recommendations: [
            'Call 911 / 112 immediately',
            'Sit upright in a rested, relaxed posture',
            'Loosen tight clothing around neck and chest',
            'If advised by emergency medical dispatch, consider chewed aspirin',
          ],
          otcSuggestions: ['Do not self-medicate; await emergency medical dispatch'],
          doctorQuestions: ['Exact time of onset?', 'Does pain radiate to jaw, neck, or left arm?', 'Any cold sweats or dizziness?'],
          redFlags: ['Crushing retrosternal chest pressure', 'Dizziness / Syncope', 'Cyanosis (blue lips/nails)'],
        },
        nextStage: 5,
      };
    }

    // ── Pharmacology / Drug Monograph Lookup ──────────────────────────────
    interface DrugMonograph {
      name: string; drugClass: string; uses: string[]; mechanism: string;
      dosage: string; sideEffects: string; warnings: string; otcAlternatives: string;
    }

    const lookupDrug = (q: string): DrugMonograph | null => {
      if (q.includes('tapentadol') || q.includes('tapendadol') || q.includes('nucynta') || q.includes('aspadol') || q.includes('tapal')) {
        return {
          name: 'Tapentadol (Nucynta / Tapal / Aspadol)',
          drugClass: 'Centrally-Acting Opioid Analgesic & Norepinephrine Reuptake Inhibitor (NRI)',
          uses: ['Moderate-to-severe acute pain (post-op, musculoskeletal injury)', 'Severe chronic neuropathic pain (diabetic peripheral neuropathy)'],
          mechanism: 'Dual mechanism: μ-opioid receptor agonist + norepinephrine reuptake inhibition in dorsal horn, blocking ascending pain signals.',
          dosage: '**IR:** 50–100 mg every 4–6 h as needed (max 500 mg Day 1; max 400 mg/day thereafter). **ER:** 50–250 mg orally twice daily for chronic pain. Swallow ER tablets whole — do not crush or chew.',
          sideEffects: '**Common:** Nausea, dizziness, somnolence, constipation, headache, dry mouth. **Serious:** Respiratory depression, serotonin syndrome, physical dependence/tolerance.',
          warnings: '⚠️ Schedule II / Schedule H1 Controlled Substance. Black-Box Warning: opioid addiction and life-threatening respiratory depression. Avoid concurrent alcohol, sedatives, or MAO inhibitors. **Prescription required.**',
          otcAlternatives: 'For mild-moderate pain: Acetaminophen 500–1000 mg + Ibuprofen 400 mg with food; topical Lidocaine 4% patch.',
        };
      }
      if (q.includes('metformin') || q.includes('glucophage') || q.includes('glycomet')) {
        return {
          name: 'Metformin (Glucophage / Glycomet / Fortamet)',
          drugClass: 'Biguanide Antihyperglycemic / Antidiabetic Agent',
          uses: ['First-line pharmacological treatment for Type 2 Diabetes Mellitus', 'Polycystic Ovary Syndrome (PCOS) — insulin resistance & ovulatory dysfunction'],
          mechanism: 'Decreases hepatic gluconeogenesis, reduces intestinal glucose absorption, and enhances peripheral insulin sensitivity without causing hypoglycaemia.',
          dosage: '**IR:** 500 mg or 850 mg orally twice daily with meals (max 2550 mg/day). **XR:** 500–2000 mg once daily with the evening meal.',
          sideEffects: '**Common:** GI upset — diarrhoea, nausea, flatulence, metallic taste. **Rare/Serious:** Lactic acidosis; long-term Vitamin B12 malabsorption.',
          warnings: 'Contraindicated in severe renal impairment (eGFR < 30 mL/min) and active metabolic acidosis. Withhold 48 h before iodinated contrast procedures.',
          otcAlternatives: 'Dietary carbohydrate restriction, regular aerobic exercise, berberine 500 mg TID, soluble fibre supplementation.',
        };
      }
      if (q.includes('omeprazole') || q.includes('pantoprazole') || q.includes('prilosec') || q.includes('esomeprazole') || q.includes('nexium') || q.includes('pan-d') || q.includes('rabeprazole')) {
        return {
          name: 'Omeprazole / Pantoprazole (Prilosec / Protonix / Nexium)',
          drugClass: 'Proton Pump Inhibitor (PPI) / Gastric Acid Reducer',
          uses: ['Gastroesophageal Reflux Disease (GERD) & chronic acid regurgitation', 'Peptic ulcer treatment & H. pylori eradication (in combination with antibiotics)'],
          mechanism: 'Irreversibly inhibits H⁺/K⁺ ATPase in gastric parietal cells, profoundly suppressing acid secretion.',
          dosage: '**Standard:** 20–40 mg orally once daily. Take 30–60 min before breakfast. Swallow delayed-release capsules whole.',
          sideEffects: '**Common:** Headache, abdominal pain, diarrhoea, constipation. **Long-term:** Hypomagnesaemia, reduced B12/Ca absorption, increased C. difficile risk.',
          warnings: 'Limit OTC self-treatment to 14 days without physician guidance. Not for immediate relief — antacids work faster for acute heartburn.',
          otcAlternatives: 'Famotidine (Pepcid) 20 mg, Calcium Carbonate (Tums), Sodium Alginate (Gaviscon) for acute relief.',
        };
      }
      if (q.includes('amoxicillin') || q.includes('augmentin') || q.includes('moxikind') || q.includes('penicillin')) {
        return {
          name: 'Amoxicillin / Amoxicillin-Clavulanate (Augmentin / Moxikind)',
          drugClass: 'Aminopenicillin / Beta-Lactam Antibiotic',
          uses: ['Bacterial pharyngitis, sinusitis, community-acquired pneumonia', 'Otitis media, dental abscesses, and urinary tract infections (UTIs)'],
          mechanism: 'Inhibits bacterial cell wall peptidoglycan synthesis → autolytic enzyme activation → cell lysis.',
          dosage: '**Adult:** 500 mg every 8 h OR 875 mg every 12 h for 7–10 days. **Critical:** Complete the full antibiotic course to prevent resistance.',
          sideEffects: '**Common:** Diarrhoea, nausea, oral candidiasis (thrush), skin rash. **Serious:** Anaphylaxis, C. difficile colitis.',
          warnings: '⚠️ Contraindicated in penicillin / beta-lactam hypersensitivity. Ineffective against viral infections (cold, flu, COVID-19). **Prescription required.**',
          otcAlternatives: 'Throat numbing sprays, warm salt-water gargles, honey-lemon teas (for viral sore throat only).',
        };
      }
      if (q.includes('atorvastatin') || q.includes('lipitor') || q.includes('rosuvastatin') || q.includes('crestor') || q.includes('statin')) {
        return {
          name: 'Atorvastatin / Rosuvastatin (Lipitor / Crestor / Storvas)',
          drugClass: 'HMG-CoA Reductase Inhibitor (Statin) / Lipid-Lowering Agent',
          uses: ['Reduction of elevated LDL, total cholesterol, and triglycerides', 'Primary & secondary prevention of myocardial infarction (MI) and ischaemic stroke'],
          mechanism: 'Inhibits HMG-CoA reductase (rate-limiting step of cholesterol synthesis), upregulating hepatic LDL receptors to clear circulating LDL.',
          dosage: '**Atorvastatin:** 10–80 mg orally once daily (evening preferred). **Rosuvastatin:** 5–40 mg once daily.',
          sideEffects: '**Common:** Myalgia, arthralgia, mild LFT elevation. **Rare/Serious:** Rhabdomyolysis, hepatotoxicity.',
          warnings: 'Contraindicated in active hepatic disease and pregnancy. Avoid grapefruit juice (CYP3A4 inhibition with atorvastatin).',
          otcAlternatives: 'Omega-3 EPA/DHA (4 g/day), plant sterols, Mediterranean diet, ≥150 min/week moderate aerobic exercise.',
        };
      }
      if (q.includes('gabapentin') || q.includes('pregabalin') || q.includes('neurontin') || q.includes('lyrica')) {
        return {
          name: 'Gabapentin / Pregabalin (Neurontin / Lyrica)',
          drugClass: 'GABA Analog / Voltage-Gated Ca²⁺ Channel α2δ Ligand',
          uses: ['Neuropathic pain: post-herpetic neuralgia, diabetic peripheral neuropathy', 'Fibromyalgia, chronic spinal nerve pain, adjunct for partial seizures'],
          mechanism: 'Binds α2δ subunit of voltage-gated calcium channels in CNS dorsal horn, reducing excitatory neurotransmitter (glutamate, Substance P) release.',
          dosage: '**Gabapentin:** 300 mg Day 1, titrate to 300–600 mg TID (max 3600 mg/day). **Pregabalin:** 75–150 mg BID with or without food.',
          sideEffects: '**Common:** Dizziness, somnolence, peripheral oedema, ataxia. **Serious:** Respiratory depression when co-administered with opioids or CNS depressants.',
          warnings: 'Do not discontinue abruptly — taper over ≥1 week to prevent withdrawal seizures. May significantly impair driving ability.',
          otcAlternatives: 'Topical Capsaicin 0.025% cream, Alpha-lipoic acid (ALA) 600 mg/day, Methylcobalamin B12 1500 mcg/day.',
        };
      }
      if (q.includes('sumatriptan') || q.includes('imitrex') || q.includes('triptan') || q.includes('imigran') || q.includes('suminat')) {
        return {
          name: 'Sumatriptan (Imitrex / Imigran / Suminat)',
          drugClass: 'Selective Serotonin 5-HT1B/1D Receptor Agonist (Antimigraine Triptan)',
          uses: ['Acute abortive treatment of migraine headache with or without aura', 'Acute treatment of cluster headache episodes'],
          mechanism: 'Selective cranial vasoconstriction + blockade of trigeminal nociceptive neuropeptide release (CGRP, Substance P).',
          dosage: '**Oral:** 50–100 mg at earliest onset. May repeat once after 2 h if headache returns (max 200 mg/24 h). **Nasal:** 10–20 mg in one nostril.',
          sideEffects: '**Common:** Chest/throat warmth or pressure sensation, tingling, flushing, somnolence. **Serious:** Coronary vasospasm, MI, arrhythmias.',
          warnings: '⚠️ Contraindicated in ischaemic CAD, history of stroke/TIA, uncontrolled hypertension, and within 24 h of ergotamine/other triptans.',
          otcAlternatives: 'Acetaminophen + Aspirin + Caffeine (Excedrin Migraine), oral Magnesium Glycinate 400 mg, rest in dark quiet room.',
        };
      }
      if (q.includes('cetirizine') || q.includes('zyrtec') || q.includes('loratadine') || q.includes('claritin') || q.includes('antihistamine') || q.includes('fexofenadine') || q.includes('allegra')) {
        return {
          name: 'Cetirizine / Loratadine / Fexofenadine (Zyrtec / Claritin / Allegra)',
          drugClass: 'Second-Generation H1 Antihistamine / Antiallergic Agent',
          uses: ['Seasonal and perennial allergic rhinitis (hay fever)', 'Chronic urticaria (hives), allergic conjunctivitis, skin pruritus'],
          mechanism: 'Selective inverse agonist at peripheral H1 histamine receptors, blocking histamine-mediated allergic inflammatory cascade.',
          dosage: '**Cetirizine / Loratadine / Fexofenadine:** 10 mg orally once daily. Can be taken with or without food.',
          sideEffects: '**Cetirizine:** Mild drowsiness, dry mouth. **Loratadine / Fexofenadine:** Non-sedating at standard doses.',
          warnings: 'Cetirizine may impair driving at higher doses. Use with caution in severe renal impairment. Separate from antacids by 15 min (fexofenadine).',
          otcAlternatives: 'HEPA air purifiers, nasal saline rinse (Neti pot), local honey, allergen avoidance strategies.',
        };
      }
      // Generic drug pattern fallback: "what is tapentadol", "use of X", "tell me about X", "X tablet"
      const drugMatch = q.match(/(?:use of|what is|about|tell me about|how to take|side effects of|dose of|is)\s+([a-zA-Z0-9_-]{3,})/i)
        ?? q.match(/([a-zA-Z0-9_-]{4,})\s+(?:tablet|capsule|injection|uses|use|medicine|drug|dosage|side effects|dose)/i);
      const extractedDrug = drugMatch?.[1];
      if (extractedDrug && !['headache','fever','cough','rash','pain','cold','stomach','symptom','disease'].includes(extractedDrug)) {
        const displayName = extractedDrug.charAt(0).toUpperCase() + extractedDrug.slice(1);
        return {
          name: `${displayName} — Pharmaceutical Assessment`,
          drugClass: 'Prescription Therapeutic Agent',
          uses: ['Targeted pharmacological management as evaluated and prescribed by your physician', 'Symptom control or physiological stabilisation under ongoing medical supervision'],
          mechanism: 'Acts selectively on specific cellular receptors, enzymatic pathways, or organ systems to produce therapeutic biological effects.',
          dosage: '**Dosage:** Must be individually tailored by your prescribing physician based on body weight, renal/hepatic function, and clinical indication. Administer strictly as written on your prescription label.',
          sideEffects: 'Adverse effects vary by drug class. Monitor for allergic rashes, facial swelling, severe dizziness, or persistent GI irritation.',
          warnings: '⚠️ Always consult a licensed physician or pharmacist before starting, stopping, or combining any medications to prevent dangerous interactions.',
          otcAlternatives: 'Book a telehealth consultation with an MD for a personalised prescription review and safe OTC alternatives.',
        };
      }
      return null;
    };

    const drugMonograph = lookupDrug(lower);
    if (drugMonograph) {
      return {
        reply: `### 💊 Clinical Pharmacology Profile\n\n**${drugMonograph.name}**\n*Drug Class:* ${drugMonograph.drugClass}\n\n---\n\n**🎯 Primary Medical Uses:**\n${drugMonograph.uses.map(u => `- ${u}`).join('\n')}\n\n**🧬 Mechanism of Action:**\n${drugMonograph.mechanism}\n\n**⚖️ Standard Dosage & Administration:**\n${drugMonograph.dosage}\n\n**⚠️ Precautions & Adverse Effects:**\n${drugMonograph.sideEffects}\n\n> ${drugMonograph.warnings}\n\n**🩹 Non-Prescription / OTC Alternatives:**\n${drugMonograph.otcAlternatives}\n\n---\n*This pharmacology profile is for educational purposes. Always confirm with a licensed physician or pharmacist before use.*`,
        nextOptions: ['📅 Book Video Consult for Prescription', '💊 Ask About Another Medicine', '🩺 Start Symptom Triage', '🔄 New Clinical Consultation'],
        nextStage: currentInterview.stage,
      };
    }

    // Conversational Follow-up Questions & General Medical Q&A
    if (
      lower.includes('medicine') ||
      lower.includes('medication') ||
      lower.includes('ibuprofen') ||
      lower.includes('paracetamol') ||
      lower.includes('tylenol') ||
      lower.includes('advil') ||
      lower.includes('antibiotic') ||
      lower.includes('take for')
    ) {
      return {
        reply: `### 💊 Medication & OTC Guidance\n\nFor mild to moderate pain or fever reduction, over-the-counter options include:\n- **Acetaminophen (Tylenol / Paracetamol):** 500–1000 mg every 4–6 hours (max 3000 mg/24h). Gentler on the stomach; avoid if you have liver conditions.\n- **Ibuprofen (Advil / Motrin):** 200–400 mg every 6–8 hours with a meal or snack. Acts as an anti-inflammatory; avoid if you have stomach ulcers, kidney disease, or active bleeding.\n\n*Note: Antibiotics require a prescription and are only effective against bacterial infections, not viral illnesses.* Always verify with a licensed pharmacist or physician before starting new medications.`,
        nextOptions: ['⏱️ How long will this last?', '🥗 What should I eat/drink?', '📅 Book Video Visit with MD', '🔄 Start New Clinical Triage'],
        nextStage: currentInterview.stage,
      };
    }

    if (
      lower.includes('how long') ||
      lower.includes('when will') ||
      lower.includes('duration') ||
      lower.includes('recovery time')
    ) {
      return {
        reply: `### ⏱️ Expected Recovery Timeline\n\n- **Acute Migraines / Tension Headaches:** Typically resolve within 4–24 hours with rest, darkness, and adequate hydration.\n- **Upper Respiratory Viral Infections:** Usually peak around Day 3 and gradually subside over 7–10 days.\n- **Viral Gastroenteritis:** Acute stomach symptoms generally ease within 24–48 hours; full digestion normalizes in 3–5 days.\n\n*If your symptoms worsen instead of improving after 72 hours, or if you develop new red-flag signs, schedule a physician evaluation.*`,
        nextOptions: ['💊 What medicines can I take?', '🥗 What foods help recovery?', '📅 Book Video Consult', '🔄 Start New Triage'],
        nextStage: currentInterview.stage,
      };
    }

    if (
      lower.includes('contagious') ||
      lower.includes('infectious') ||
      lower.includes('go to work') ||
      lower.includes('school')
    ) {
      return {
        reply: `### 🛡️ Contagion & Workplace Advisory\n\n- **Headaches / Migraines / Allergies:** Not contagious. You may resume work or activities as soon as you feel comfortable.\n- **Respiratory & Viral Symptoms (Cough/Fever):** Contagious through airborne droplets. As a rule of thumb, stay home until you have been **fever-free for at least 24 hours** without fever-reducing medications, and practice regular hand hygiene.`,
        nextOptions: ['💊 Safe OTC options?', '⏱️ Recovery timeline?', '📅 Schedule Doctor Video Call', '🔄 Start New Triage'],
        nextStage: currentInterview.stage,
      };
    }

    if (
      lower.includes('eat') ||
      lower.includes('food') ||
      lower.includes('drink') ||
      lower.includes('diet') ||
      lower.includes('coffee') ||
      lower.includes('water')
    ) {
      return {
        reply: `### 🥗 Nutritional & Hydration Support\n\n- **For Headaches & Fatigue:** Hydrate with 2–3 liters of water or oral electrolyte solutions. Limit caffeine and avoid processed high-sodium foods.\n- **For Cough & Sore Throat:** Warm herbal teas with honey, lemon, and warm clear bone broths soothe inflamed mucous membranes.\n- **For Stomach Issues:** Follow the **BRAT diet** (Bananas, Rice, Applesauce, Toast). Avoid dairy, greasy foods, and citrus for 48 hours.`,
        nextOptions: ['💊 Medication advice?', '⏱️ How long to recover?', '📅 Consult a Doctor', '🔄 Start New Triage'],
        nextStage: currentInterview.stage,
      };
    }

    if (
      lower.includes('thank') ||
      lower.includes('ok') ||
      lower.includes('okay') ||
      lower.includes('great') ||
      lower.includes('helpful')
    ) {
      return {
        reply: `You're very welcome! I'm glad I could provide clarity on your health concerns. Remember to prioritize rest, stay well-hydrated, and don't hesitate to reach out or book a video visit with one of our board-certified doctors if you need a formal clinical prescription or follow-up evaluation.\n\nTake care of yourself! 🩺✨`,
        nextOptions: ['📅 Book Video Consult with MD', '📄 Export PDF Clinical Summary', '🔄 Start New Clinical Triage'],
        nextStage: currentInterview.stage,
      };
    }
    if (currentInterview.stage === 1) {
      let category = 'general';
      let options = ['💥 Throbbing / Pulsating', '🗜️ Dull Constant Pressure', '⚡ Sharp / Stabbing', '🔥 Burning Sensation', '🤕 Aching & Sore'];

      if (lower.includes('head') || lower.includes('migraine')) {
        category = 'headache';
        options = [
          '💥 Throbbing / Pulsating on one side',
          '🗜️ Band-like tight pressure across forehead',
          '👁️ Piercing pain behind one eye',
          '🔙 Back of head and neck stiffness',
          '🤕 Dull generalized ache throughout head',
        ];
      } else if (lower.includes('fever') || lower.includes('cough') || lower.includes('throat') || lower.includes('cold')) {
        category = 'respiratory';
        options = [
          '🔥 Scratchy / painful raw throat',
          '🫁 Dry hacking cough',
          '🫁 Productive wet cough with phlegm',
          '🌡️ Chills with body aches',
          '🤧 Stuffy runny nose and sinus pressure',
        ];
      } else if (lower.includes('skin') || lower.includes('rash') || lower.includes('itch') || uploadedImage) {
        category = 'dermatology';
        options = [
          '🔴 Red raised itchy patches / bumps',
          '🔥 Dry scaly peeling skin',
          '🫧 Small fluid-filled blisters',
          '🩹 Swollen warm localized plaque',
          '⚡ Stinging / burning irritation',
        ];
      } else if (lower.includes('stomach') || lower.includes('nausea') || lower.includes('vomit') || lower.includes('diarrhea') || lower.includes('cramp')) {
        category = 'digestive';
        options = [
          '⚡ Sharp cramping in lower abdomen',
          '🔥 Burning acid pain in upper stomach / chest',
          '🤢 Persistent nausea / bloating',
          '🚽 Watery diarrhea and stomach rumbling',
          '🫄 Generalized dull belly ache',
        ];
      }

      currentInterview.chiefComplaint = userText;

      return {
        reply: `Thank you for sharing your concern ("${userText}").\n\nTo help me formulate an accurate differential diagnosis, could you describe **what the sensation feels like** and **where exactly it is concentrated**?`,
        nextOptions: options,
        nextStage: 2,
      };
    }

    // STAGE 2 -> STAGE 3: Onset, Duration & Severity
    if (currentInterview.stage === 2) {
      currentInterview.characterLocation = userText;

      return {
        reply: `Got it: "${userText}".\n\nNext, **how long have you had this**, and on a scale of **1 to 10**, what is the current pain or discomfort severity?`,
        nextOptions: [
          '⚡ Started suddenly today (< 2 hours) • Mild (2/10)',
          '⏱️ Began gradually over 1–3 days • Moderate (5/10)',
          '⏱️ Ongoing for 4–7 days • Moderate (6/10)',
          '🔴 Severe discomfort (7–8/10) impacting work/sleep',
          '📅 Persistent for > 2 weeks • Mild to Moderate (4/10)',
        ],
        nextStage: 3,
      };
    }

    // STAGE 3 -> STAGE 4: Triggers, Associated Symptoms & Red Flags
    if (currentInterview.stage === 3) {
      currentInterview.durationSeverity = userText;

      let associatedOpts = [
        '☀️ Sensitive to bright light or loud sounds',
        '🤢 Mild nausea or loss of appetite',
        '🌡️ Mild feverish feeling / warm forehead',
        '🥱 Severe fatigue and brain fog',
        '🧘 Worse with stress or screen time',
        '❌ None of these associated symptoms',
      ];

      return {
        reply: `Understood. Duration & severity recorded: "${userText}".\n\nLastly, are you experiencing any **associated symptoms, triggers, or secondary signs**? Please select all that apply or describe them:`,
        nextOptions: associatedOpts,
        nextStage: 4,
      };
    }

    // STAGE 4 -> STAGE 5: Synthesis & Comprehensive Diagnostic Assessment Card
    currentInterview.associatedSymptoms.push(userText);
    const complaint = currentInterview.chiefComplaint.toLowerCase();
    const character = currentInterview.characterLocation.toLowerCase();
    const duration = currentInterview.durationSeverity.toLowerCase();
    const associated = userText.toLowerCase();

    // Headache Synthesis
    if (complaint.includes('head') || complaint.includes('migraine') || character.includes('throbbing') || character.includes('forehead')) {
      const isMigraine = character.includes('throbbing') || character.includes('one eye') || associated.includes('light') || associated.includes('nausea');
      const primaryImpression = isMigraine ? 'Acute Migraine Episode (ICD-11: 8A80.0)' : 'Tension-Type Cephalea (ICD-11: 8A81.0)';
      const confidence = isMigraine ? 90 : 86;

      return {
        reply: `### 📋 Comprehensive Clinical Evaluation Complete\n\nThank you for providing thorough details throughout our consultation.\n\n**Patient Reported Overview:**\n- **Chief Complaint:** ${currentInterview.chiefComplaint}\n- **Character & Site:** ${currentInterview.characterLocation}\n- **Duration & Severity:** ${currentInterview.durationSeverity}\n- **Associated Triggers:** ${userText}\n\nBased on clinical diagnostic criteria (ICD-11), your symptoms strongly correlate with **${primaryImpression}**. Below is your structured differential triage report and actionable medical pathway:`,
        card: {
          primaryImpression,
          confidence,
          urgency: duration.includes('severe') || duration.includes('7') || duration.includes('8') ? 'Moderate' : 'Low',
          differential: [
            { condition: primaryImpression, probability: `${confidence}%` },
            { condition: isMigraine ? 'Tension-Type Cephalea' : 'Migraine without Aura', probability: `${Math.round((100 - confidence) * 0.7)}%` },
            { condition: 'Cervicogenic Strain / Dehydration Headache', probability: `${Math.round((100 - confidence) * 0.3)}%` },
          ],
          recommendations: [
            'Rest in a darkened, quiet environment away from screens and fluorescent lights',
            'Drink 500–750 ml of electrolyte-enhanced oral fluids immediately',
            'Apply a cool gel pack to the forehead or warm compress to the cervical spine',
            'Avoid known trigger foods (caffeine withdrawal, aged cheeses, excessive sodium)',
          ],
          otcSuggestions: [
            'Acetaminophen (Tylenol) 500mg OR Ibuprofen 400mg with a light snack',
            'Oral magnesium glycinate and electrolyte replenishment',
          ],
          doctorQuestions: [
            'How frequently do these headaches occur per month?',
            'Do you experience visual auras, zig-zag lines, or blind spots before onset?',
            'Has your sleep routine or stress level changed recently?',
          ],
          redFlags: [
            'Sudden explosive "thunderclap" headache reaching max intensity in seconds',
            'High fever accompanied by neck stiffness and confusion',
            'Unilateral limb weakness or facial numbness',
          ],
        },
        nextStage: 5,
        nextOptions: ['📅 Book Video Consult with MD', '📄 Download PDF Clinical Report', '🔄 Start New Clinical Triage'],
      };
    }

    // Respiratory / Fever Synthesis
    if (complaint.includes('fever') || complaint.includes('cough') || complaint.includes('throat') || complaint.includes('cold')) {
      const isPharyngitis = character.includes('throat') || character.includes('scratchy');
      const primaryImpression = isPharyngitis ? 'Acute Viral Pharyngitis (ICD-11: CA02.0)' : 'Upper Respiratory Viral Infection (ICD-11: CA40.0)';
      const confidence = 88;

      return {
        reply: `### 📋 Comprehensive Clinical Evaluation Complete\n\nThank you for answering the detailed clinical interview.\n\n**Patient Reported Overview:**\n- **Chief Complaint:** ${currentInterview.chiefComplaint}\n- **Character & Site:** ${currentInterview.characterLocation}\n- **Duration & Severity:** ${currentInterview.durationSeverity}\n- **Associated Triggers:** ${userText}\n\nYour presentation aligns with **${primaryImpression}**. Review your clinical care card below:`,
        card: {
          primaryImpression,
          confidence,
          urgency: duration.includes('severe') || associated.includes('fever') ? 'Moderate' : 'Low',
          differential: [
            { condition: primaryImpression, probability: `${confidence}%` },
            { condition: 'Influenza Type A/B or Covid-19', probability: '18%' },
            { condition: 'Streptococcal Bacterial Pharyngitis', probability: '10%' },
          ],
          recommendations: [
            'Maintain continuous warm oral hydration (herbal teas with honey, clear broths)',
            'Warm salt-water gargle (1/2 tsp salt in 1 cup warm water) 3–4 times daily',
            'Use a cool-mist room humidifier to keep airway membranes moist',
            'Rest and avoid heavy physical exertion for 48–72 hours',
          ],
          otcSuggestions: [
            'Acetaminophen (Paracetamol) or Ibuprofen for temperature and body aches',
            'Throat lozenges with benzocaine / menthol for swallowing comfort',
          ],
          doctorQuestions: [
            'Has fever exceeded 102°F (38.9°C)?',
            'Are there white spots/exudates visible on your tonsils?',
            'Is there any difficulty swallowing saliva or breathing?',
          ],
          redFlags: [
            'Difficulty breathing or audible stridor',
            'Inability to swallow liquids leading to dehydration',
            'Fever persisting beyond 3 days without improvement',
          ],
        },
        nextStage: 5,
        nextOptions: ['📅 Book Video Consult with MD', '📄 Download PDF Clinical Report', '🔄 Start New Clinical Triage'],
      };
    }

    // Skin / Dermatology Synthesis
    if (complaint.includes('skin') || complaint.includes('rash') || complaint.includes('itch') || uploadedImage) {
      const primaryImpression = 'Contact Dermatitis / Acute Allergic Eczema (ICD-11: EA80.0)';
      const confidence = 86;

      return {
        reply: `### 📋 Comprehensive Clinical Evaluation Complete\n\nThank you for providing the dermatological details.\n\n**Patient Reported Overview:**\n- **Chief Complaint:** ${currentInterview.chiefComplaint}\n- **Character & Site:** ${currentInterview.characterLocation}\n- **Duration & Severity:** ${currentInterview.durationSeverity}\n- **Associated Signs:** ${userText}\n\nYour clinical presentation corresponds to **${primaryImpression}**:`,
        card: {
          primaryImpression,
          confidence,
          urgency: 'Low',
          differential: [
            { condition: 'Allergic Contact Dermatitis', probability: '52%' },
            { condition: 'Atopic Eczema Flare-up', probability: '30%' },
            { condition: 'Localized Urticaria', probability: '18%' },
          ],
          recommendations: [
            'Avoid scratching to prevent secondary epidermal barrier disruption',
            'Wash gently with lukewarm water and fragrance-free syndet cleanser',
            'Apply a thick ceramide-based barrier repair moisturizer 3x daily',
            'Avoid direct sunlight and hot showers on affected area',
          ],
          otcSuggestions: [
            '1% Hydrocortisone topical cream applied thinly twice daily (max 7 days)',
            'Oral antihistamine (Cetirizine 10mg or Loratadine 10mg) for pruritus',
          ],
          doctorQuestions: [
            'Have you recently switched laundry detergents, soaps, or perfumes?',
            'Is the rash spreading rapidly beyond the initial site?',
            'Are there any oozing blisters or yellow crusts?',
          ],
          redFlags: [
            'Rapidly spreading redness with localized heat and fever (cellulitis)',
            'Involvement of eyes, lips, or oral mucosa',
            'Severe blistering with skin sloughing',
          ],
        },
        nextStage: 5,
        nextOptions: ['📅 Book Video Consult with MD', '📄 Download PDF Clinical Report', '🔄 Start New Clinical Triage'],
      };
    }

    // Default Clinical Synthesis
    const primaryImpression = 'Acute Constitutional Symptom Evaluation (ICD-11: MG22)';
    return {
      reply: `### 📋 Comprehensive Clinical Evaluation Complete\n\nThank you for completing the clinical triage assessment.\n\n**Patient Reported Overview:**\n- **Chief Complaint:** ${currentInterview.chiefComplaint}\n- **Character & Site:** ${currentInterview.characterLocation}\n- **Duration & Severity:** ${currentInterview.durationSeverity}\n- **Associated Signs:** ${userText}\n\nBased on your reported pattern, here is your clinical triage summary:`,
      card: {
        primaryImpression,
        confidence: 84,
        urgency: 'Low',
        differential: [
          { condition: primaryImpression, probability: '65%' },
          { condition: 'Transient Viral / Physiological Reaction', probability: '25%' },
          { condition: 'Musculoskeletal Strain / Fatigue', probability: '10%' },
        ],
        recommendations: [
          'Rest and maintain adequate hydration',
          'Monitor body temperature and vitals for 48 hours',
          'Schedule a telehealth video visit with a board-certified physician for targeted examination',
        ],
        otcSuggestions: ['Supportive hydration electrolytes', 'Mild analgesics with food if needed'],
        doctorQuestions: ['When did you first notice these symptoms?', 'Have similar symptoms occurred before?'],
        redFlags: ['Sudden severe escalation in pain', 'Shortness of breath or fainting', 'Uncontrolled high fever'],
      },
      nextStage: 5,
      nextOptions: ['📅 Book Video Consult with MD', '📄 Download PDF Clinical Report', '🔄 Start New Clinical Triage'],
    };
  };

  // Main user message handler
  const handleUserMessage = (text: string) => {
    if (!text.trim() && !uploadedImage) return;

    const userMessage: Message = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: text || 'Uploaded medical photo for inspection',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      image: uploadedImage || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setUploadedImage(null);
    setIsLoading(true);

    setTimeout(() => {
      if (text.includes('Start New Clinical Triage') || text.includes('🔄')) {
        setInterview({
          stage: 1,
          chiefComplaint: '',
          characterLocation: '',
          durationSeverity: '',
          associatedSymptoms: [],
        });
        setMessages([
          {
            id: 'msg-' + Date.now(),
            sender: 'ai',
            text: activePersona.greeting,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestedOptions: [
              '🤕 Throbbing Headache',
              '🌡️ Fever & Sore Throat',
              '🧴 Itchy Skin Rash',
              '🫄 Stomach Pain & Nausea',
              '🫁 Shortness of Breath',
              '💥 Joint / Muscle Aches',
            ],
          },
        ]);
        setIsLoading(false);
        return;
      }

      if (text.includes('Book Video Consult') || text.includes('📅')) {
        setBookingOpen(true);
        setIsLoading(false);
        return;
      }

      if (text.includes('Download PDF') || text.includes('📄')) {
        downloadConsultationPDF();
        setIsLoading(false);
        return;
      }

      const interviewResult = processInterviewStep(text, { ...interview });
      setInterview((prev) => ({
        ...prev,
        stage: interviewResult.nextStage,
      }));

      const aiResponse: Message = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'ai',
        text: interviewResult.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        diagnosticCard: interviewResult.card,
        suggestedOptions: interviewResult.nextOptions,
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 700);
  };

  // Download PDF Report
  const downloadConsultationPDF = () => {
    const doc = new jsPDF();

    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('Dr.AI — Clinical Triage Summary Report', 14, 20);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.text(`Patient: ${user?.name || 'Alex Rivera'}`, 14, 40);
    doc.text(`Consultation Date: ${new Date().toLocaleDateString()}`, 14, 46);
    doc.text(`Clinical Specialist: ${activePersona.name} (${activePersona.specialty})`, 14, 52);
    doc.text('Standard: WHO ICD-11 Diagnostic Protocol', 14, 58);

    doc.line(14, 64, 196, 64);

    doc.setFontSize(13);
    doc.setTextColor(5, 150, 105);
    doc.text('CLINICAL INQUIRY & ASSESSMENT SUMMARY', 14, 76);

    let currentY = 86;
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);

    messages.forEach((m) => {
      if (m.sender === 'user') {
        doc.setFont('helvetica', 'bold');
        doc.text(`Patient: ${m.text.substring(0, 80)}`, 14, currentY);
        currentY += 8;
      }
      if (m.diagnosticCard) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(16, 185, 129);
        doc.text(`Primary Impression: ${m.diagnosticCard.primaryImpression}`, 14, currentY);
        currentY += 6;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(`Confidence: ${m.diagnosticCard.confidence}% | Urgency: ${m.diagnosticCard.urgency}`, 14, currentY);
        currentY += 8;
      }
      if (currentY > 260) {
        doc.addPage();
        currentY = 20;
      }
    });

    doc.save(`DrAI_Clinical_Report_${Date.now()}.pdf`);
  };

  return (
    <Container maxWidth="xl" className="py-6 h-[calc(100vh-80px)] flex flex-col">
      {/* Top Header & Interview Progress Steps */}
      <Box className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 flex-shrink-0">
        <Box className="flex items-center gap-3">
          <Avatar sx={{ bgcolor: activePersona.color, width: 44, height: 44, fontSize: '1.4rem' }}>
            {activePersona.avatar}
          </Avatar>
          <Box>
            <Box className="flex items-center gap-2">
              <Typography variant="h6" className="font-extrabold text-gray-900 dark:text-white leading-none">
                {activePersona.name}
              </Typography>
              <Chip
                label="Clinical CDS Mode"
                size="small"
                sx={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', fontWeight: 800, fontSize: '10px' }}
              />
            </Box>
            <Typography variant="caption" className="text-gray-400 font-medium">
              {activePersona.specialty} • Adaptive Multi-Turn Inquiry Engine
            </Typography>
          </Box>
        </Box>

        {/* Clinical Interview Stage Indicator */}
        <Box className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-[11px] font-bold overflow-x-auto">
          {[
            { num: 1, label: '1. Symptom' },
            { num: 2, label: '2. Character/Site' },
            { num: 3, label: '3. Duration/Severity' },
            { num: 4, label: '4. Red Flags' },
            { num: 5, label: '5. Assessment' },
          ].map((s) => (
            <Box
              key={s.num}
              className={`px-2.5 py-1 rounded-xl transition-all whitespace-nowrap ${
                interview.stage >= s.num
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              {s.label}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Main Chat Body */}
      <Paper
        elevation={0}
        className="glass-card rounded-3xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 flex-1 flex flex-col overflow-hidden"
      >
        {/* Messages Scroll Area */}
        <Box className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((msg) => (
            <Box
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <Avatar sx={{ bgcolor: activePersona.color, width: 36, height: 36, fontSize: '1.1rem', flexShrink: 0 }}>
                  {activePersona.avatar}
                </Avatar>
              )}

              <Box className={`max-w-2xl space-y-3 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                {/* Text Bubble */}
                <Box
                  className={`p-4 rounded-3xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-br-none shadow-md shadow-emerald-500/20'
                      : 'bg-white/80 dark:bg-slate-900/90 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-200 dark:border-slate-800 shadow-sm'
                  }`}
                >
                  <Typography variant="body2" className="whitespace-pre-line text-[13.5px]">
                    {msg.text}
                  </Typography>

                  {/* Image Attachment */}
                  {msg.image && (
                    <Box className="mt-3 rounded-2xl overflow-hidden border border-white/20 max-w-xs">
                      <img src={msg.image} alt="Patient Upload" className="w-full h-auto object-cover" />
                    </Box>
                  )}

                  <Box className="flex justify-between items-center mt-2 text-[10px] opacity-70">
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'ai' && (
                      <IconButton size="small" onClick={() => speakText(msg.text)} sx={{ color: 'inherit', p: 0.5 }}>
                        {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </IconButton>
                    )}
                  </Box>
                </Box>

                {/* Diagnostic Card if Present */}
                {msg.diagnosticCard && (
                  <Box className="p-5 rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-xl space-y-4 text-xs text-white">
                    <Box className="flex justify-between items-start">
                      <Box>
                        <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                          Primary Differential Diagnosis
                        </span>
                        <Typography variant="h6" className="font-black text-white leading-snug">
                          {msg.diagnosticCard.primaryImpression}
                        </Typography>
                      </Box>
                      <Box className="flex gap-2">
                        <Chip
                          label={`Confidence ${msg.diagnosticCard.confidence}%`}
                          size="small"
                          sx={{ bgcolor: 'rgba(16,185,129,0.2)', color: '#10B981', fontWeight: 800 }}
                        />
                        <Chip
                          label={`Urgency: ${msg.diagnosticCard.urgency}`}
                          size="small"
                          sx={{
                            bgcolor: msg.diagnosticCard.urgency === 'Emergency' ? 'rgba(239,68,68,0.25)' : 'rgba(6,182,212,0.25)',
                            color: msg.diagnosticCard.urgency === 'Emergency' ? '#F87171' : '#22D3EE',
                            fontWeight: 800,
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Differential Probabilities */}
                    <Box>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">
                        Differential Likelihood Matrix:
                      </span>
                      <Grid container spacing={1.5}>
                        {msg.diagnosticCard.differential.map((diff, i) => (
                          <Grid item xs={12} sm={4} key={i}>
                            <Box className="p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700">
                              <Typography variant="caption" className="font-bold text-white block leading-tight">
                                {diff.condition}
                              </Typography>
                              <span className="text-emerald-400 font-extrabold text-[11px]">
                                {diff.probability}
                              </span>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>

                    {/* Recommendations */}
                    <Box className="space-y-1">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase block">
                        Clinical Care Recommendations:
                      </span>
                      <ul className="list-disc ml-4 space-y-1 text-slate-300 text-[11.5px]">
                        {msg.diagnosticCard.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </Box>

                    {/* OTC Suggestions */}
                    <Box className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/60">
                      <span className="text-[10px] font-bold text-emerald-300 uppercase block mb-1">
                        Over-The-Counter (OTC) Guidance:
                      </span>
                      <p className="text-[11.5px] text-emerald-100">
                        {msg.diagnosticCard.otcSuggestions.join(' • ')}
                      </p>
                    </Box>

                    {/* Questions for Doctor */}
                    <Box className="space-y-1">
                      <span className="text-[10px] font-bold text-cyan-400 uppercase block">
                        Recommended Questions to Ask Your Doctor:
                      </span>
                      <ul className="list-disc ml-4 space-y-0.5 text-slate-300 text-[11.5px]">
                        {msg.diagnosticCard.doctorQuestions.map((q, i) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </Box>

                    {/* Action Buttons */}
                    <Box className="pt-2 border-t border-slate-800 flex flex-wrap gap-2">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => setBookingOpen(true)}
                        startIcon={<Video className="w-4 h-4" />}
                        sx={{
                          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                          borderRadius: 2,
                          fontWeight: 'bold',
                        }}
                      >
                        Book Video Consultation with Doctor
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={downloadConsultationPDF}
                        startIcon={<Download className="w-4 h-4" />}
                        sx={{ borderRadius: 2, fontWeight: 'bold' }}
                      >
                        Export PDF Report
                      </Button>
                    </Box>
                  </Box>
                )}

                {/* Suggested Quick-Response Chips */}
                {msg.suggestedOptions && (
                  <Box className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestedOptions.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleUserMessage(opt)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-slate-700 transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <span>{opt}</span>
                      </button>
                    ))}
                  </Box>
                )}
              </Box>

              {msg.sender === 'user' && (
                <Avatar sx={{ bgcolor: '#10B981', width: 36, height: 36, flexShrink: 0 }}>
                  <User className="w-4 h-4 text-white" />
                </Avatar>
              )}
            </Box>
          ))}

          {isLoading && (
            <Box className="flex gap-3 items-center">
              <Avatar sx={{ bgcolor: activePersona.color, width: 36, height: 36 }}>
                {activePersona.avatar}
              </Avatar>
              <Box className="p-3 rounded-2xl bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-emerald-500 animate-spin" />
                <span className="text-xs text-gray-500 font-medium">
                  {interview.stage >= 4 ? 'Synthesizing clinical differential diagnosis...' : 'Analyzing clinical indicators...'}
                </span>
              </Box>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Input Bar & Media Controls */}
        <Box className="pt-3 border-t border-gray-200 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUserMessage(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />

            <Tooltip title="Upload medical photo or skin lesion for inspection">
              <IconButton
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  backgroundColor: uploadedImage ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                  color: uploadedImage ? '#10B981' : 'inherit',
                }}
              >
                <ImageIcon className="w-5 h-5" />
              </IconButton>
            </Tooltip>

            <Tooltip title={isListening ? 'Stop microphone' : 'Speak symptoms'}>
              <IconButton
                onClick={toggleSpeechRecognition}
                sx={{
                  backgroundColor: isListening ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                  color: isListening ? '#EF4444' : 'inherit',
                }}
              >
                {isListening ? <MicOff className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5" />}
              </IconButton>
            </Tooltip>

            <TextField
              fullWidth
              size="small"
              placeholder="Type your symptom, response, or question here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#0F172A' : '#F8FAFC'),
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={!input.trim() && !uploadedImage}
              sx={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                borderRadius: 3,
                px: 3,
                py: 1,
                minWidth: 'auto',
              }}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </Box>
      </Paper>

      {/* Emergency Modal */}
      <EmergencyModal open={emergencyOpen} onClose={() => setEmergencyOpen(false)} symptom={emergencySymptom} />

      {/* Doctor Booking Modal */}
      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        doctor={doctors[0]}
      />
    </Container>
  );
};

export default Chat;