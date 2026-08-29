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
  FileText,
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
    greeting: "Hello! I'm your AI Clinical Health Assistant. Describe what symptoms you are feeling today, how long they've lasted, and their severity.",
    systemRole: 'General Internal Medicine Physician',
    color: '#10B981',
  },
  {
    id: 'pediatric',
    name: 'Dr. AI Pediatrics',
    specialty: 'Child & Adolescent Care',
    avatar: '👶',
    greeting: "Hello! I am Dr. AI Pediatric Specialist. How can I assist with your child's health, fever, milestones, or symptoms today?",
    systemRole: 'Board Certified Pediatrician',
    color: '#06B6D4',
  },
  {
    id: 'derma',
    name: 'Dr. AI Dermatology',
    specialty: 'Skin, Hair & Lesions',
    avatar: '🧴',
    greeting: "Welcome! I specialize in dermatology. You can describe your skin condition or upload a photo of the affected area for visual triage.",
    systemRole: 'Consultant Dermatologist',
    color: '#F59E0B',
  },
  {
    id: 'cardio',
    name: 'Dr. AI Cardiology',
    specialty: 'Heart & Blood Pressure',
    avatar: '❤️',
    greeting: "Hello. I monitor cardiovascular health, blood pressure readings, and heart rhythm symptoms. What is on your mind?",
    systemRole: 'Cardiologist',
    color: '#EF4444',
  },
  {
    id: 'mental',
    name: 'Dr. AI Mental Wellness',
    specialty: 'Psychiatry & Emotional Health',
    avatar: '🧘',
    greeting: "Hi there. I provide a calm, supportive space for stress, anxiety, burnout, sleep difficulties, and emotional well-being.",
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
    },
  ]);
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

  // Clinical Rule-Based Intelligence Engine
  const generateClinicalResponse = (query: string, imagePresent: boolean): { reply: string; card?: DiagnosticCard } => {
    const lower = query.toLowerCase();

    // Check emergency triggers
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
    ];

    const isEmergency = emergencyTriggers.some((t) => lower.includes(t));
    if (isEmergency) {
      const trigger = emergencyTriggers.find((t) => lower.includes(t)) || 'Emergency symptoms';
      setEmergencySymptom(trigger);
      setEmergencyOpen(true);

      return {
        reply: `⚠️ **CRITICAL MEDICAL ALERT DETECTED:** You mentioned "${trigger}". This can be a sign of a life-threatening cardiopulmonary emergency.\n\nPlease call **911 / 112** or go to the nearest hospital Emergency Room immediately without delay. Do not drive yourself.`,
        card: {
          primaryImpression: 'Possible Acute Cardiopulmonary / Neurovascular Event',
          confidence: 94,
          urgency: 'Emergency',
          differential: [
            { condition: 'Acute Coronary Syndrome / Myocardial Infarction', probability: 'High Urgency' },
            { condition: 'Pulmonary Embolism', probability: 'High Urgency' },
            { condition: 'Severe Asthma / Bronchospasm', probability: 'Urgent' },
          ],
          recommendations: [
            'Call 911 / 112 immediately',
            'Sit upright in a rested, relaxed posture',
            'Loosen tight clothing around neck and chest',
            'If advised by paramedic and not allergic, consider chewed aspirin',
          ],
          otcSuggestions: ['Do not self-medicate; await paramedics'],
          doctorQuestions: ['Time of onset?', 'Does pain radiate to jaw/arm?', 'Any nausea/sweating?'],
          redFlags: ['Crushing chest pressure', 'Dizziness', 'Cold sweats', 'Cyanosis (blue lips)'],
        },
      };
    }

    // Headache / Migraine
    if (lower.includes('headache') || lower.includes('migraine') || lower.includes('head pain')) {
      return {
        reply: `Based on your description of head discomfort, here is a preliminary clinical assessment. Headaches are commonly tension-type, migraine-related, or secondary to dehydration and eye strain.`,
        card: {
          primaryImpression: 'Tension-Type Headache / Acute Migraine Episode',
          confidence: 88,
          urgency: 'Moderate',
          differential: [
            { condition: 'Tension-Type Cephalea', probability: '55%' },
            { condition: 'Migraine with/without Aura', probability: '32%' },
            { condition: 'Cervicogenic Headache / Neck Strain', probability: '10%' },
          ],
          recommendations: [
            'Rest in a quiet, darkened room with reduced screen brightness',
            'Hydrate with 500ml water or electrolyte fluids',
            'Apply a cool compress across the forehead and temples',
            'Perform gentle neck and shoulder stretching',
          ],
          otcSuggestions: ['Acetaminophen (Tylenol) 500mg or Ibuprofen 400mg with food', 'Electrolyte hydration solution'],
          doctorQuestions: [
            'How often do these headaches occur?',
            'Is there any light sensitivity, nausea, or visual aura?',
            'Does physical exertion worsen the throbbing?',
          ],
          redFlags: ['"Worst headache of life" (thunderclap onset)', 'High fever with neck stiffness', 'Vision loss or numbness'],
        },
      };
    }

    // Fever, Cold & Cough
    if (lower.includes('fever') || lower.includes('cough') || lower.includes('cold') || lower.includes('sore throat') || lower.includes('chills')) {
      return {
        reply: `I've analyzed your upper respiratory and febrile symptoms. These symptoms match common viral respiratory tract infections, but bacterial pharyngitis should be ruled out if symptoms persist.`,
        card: {
          primaryImpression: 'Upper Respiratory Viral Infection (Viral Pharyngitis / Bronchitis)',
          confidence: 86,
          urgency: 'Low',
          differential: [
            { condition: 'Acute Viral Rhinopharyngitis', probability: '60%' },
            { condition: 'Influenza (Flu) or Covid-19', probability: '25%' },
            { condition: 'Streptococcal Pharyngitis', probability: '15%' },
          ],
          recommendations: [
            'Maintain abundant oral hydration (warm herbal teas, broths, water)',
            'Warm salt-water gargle (1/2 tsp salt in 1 cup warm water) 3x daily',
            'Use a cool-mist room humidifier to soothe bronchial irritation',
            'Get 8-10 hours of restorative sleep',
          ],
          otcSuggestions: ['Acetaminophen or Ibuprofen for temperature control', 'Dextromethorphan or Honey for cough relief'],
          doctorQuestions: [
            'What is your highest recorded body temperature?',
            'Is the cough productive with yellow/green phlegm?',
            'Are there white patches or exudates on your tonsils?',
          ],
          redFlags: ['Fever > 103°F (39.4°C) lasting > 3 days', 'Difficulty breathing or stridor', 'Inability to swallow liquids'],
        },
      };
    }

    // Skin rash or lesion
    if (lower.includes('skin') || lower.includes('rash') || lower.includes('itch') || lower.includes('eczema') || imagePresent) {
      return {
        reply: `I have evaluated the dermatological symptoms and visual indicators. Common presentations include contact dermatitis, allergic eczema, or localized urticaria.`,
        card: {
          primaryImpression: 'Contact Dermatitis / Acute Allergic Eczema',
          confidence: 84,
          urgency: 'Low',
          differential: [
            { condition: 'Allergic Contact Dermatitis', probability: '50%' },
            { condition: 'Atopic Eczema Flare-up', probability: '30%' },
            { condition: 'Tinea Corporis (Fungal infection)', probability: '15%' },
          ],
          recommendations: [
            'Avoid scratching to prevent secondary bacterial excoriation',
            'Wash area with lukewarm water and fragrance-free gentle cleanser',
            'Apply a thick ceramide-based barrier repair moisturizer',
            'Identify and remove recent contact irritants (new soaps, fabrics, plants)',
          ],
          otcSuggestions: ['1% Hydrocortisone topical cream (max 7 days)', 'Oral Cetirizine or Loratadine for pruritus'],
          doctorQuestions: [
            'When did the rash first appear and is it spreading?',
            'Have you started any new skincare products or medications?',
            'Is there any blistering, oozing, or warm localized swelling?',
          ],
          redFlags: ['Rapidly spreading rash with high fever', 'Blistering involving mucous membranes (eyes/mouth)', 'Signs of cellulitis (red hot streaks)'],
        },
      };
    }

    // Stomach / Digestive
    if (lower.includes('stomach') || lower.includes('nausea') || lower.includes('vomit') || lower.includes('diarrhea') || lower.includes('acid') || lower.includes('reflux') || lower.includes('cramp')) {
      return {
        reply: `Here is the clinical triage assessment for your gastrointestinal symptoms. Most mild episodes stem from acute gastroenteritis, dietary irritation, or GERD.`,
        card: {
          primaryImpression: 'Acute Gastroenteritis / Gastroesophageal Reflux (GERD)',
          confidence: 82,
          urgency: 'Moderate',
          differential: [
            { condition: 'Viral Gastroenteritis (Stomach Flu)', probability: '45%' },
            { condition: 'Acid Reflux / Functional Dyspepsia', probability: '35%' },
            { condition: 'Irritable Bowel Syndrome (IBS) Flare', probability: '15%' },
          ],
          recommendations: [
            'Follow the BRAT diet (Bananas, Rice, Applesauce, Toast) for 24-48 hours',
            'Sip oral rehydration salts (ORS) or electrolyte solutions in small frequent sips',
            'Avoid spicy, fatty, acidic foods, caffeine, and dairy',
            'Avoid lying flat for at least 2 hours after consuming liquids/food',
          ],
          otcSuggestions: ['Oral Rehydration Salts (ORS)', 'Antacids (Calcium carbonate or Famotidine for heartburn)'],
          doctorQuestions: [
            'Can you keep fluids down without vomiting for > 4 hours?',
            'Is the abdominal pain localized to a specific quadrant (e.g. lower right)?',
            'Have others who shared food experienced similar symptoms?',
          ],
          redFlags: ['Severe persistent right lower quadrant agony (Appendicitis sign)', 'Blood in vomit or dark tarry stools', 'Signs of severe dehydration (no urination >8h, confusion)'],
        },
      };
    }

    // General default inquiry
    return {
      reply: `Thank you for sharing your health details. Based on your symptoms: "${query}", here is a structured preliminary assessment.\n\nTo provide an even more accurate assessment, could you specify when this began, how intense it is on a scale of 1-10, and if anything relieves or worsens it?`,
      card: {
        primaryImpression: 'Constitutional Symptom Evaluation - Clinical Follow-up Advised',
        confidence: 78,
        urgency: 'Low',
        differential: [
          { condition: 'Mild Acute Symptom Presentation', probability: '65%' },
          { condition: 'Stress-Related Somatic Tension', probability: '25%' },
          { condition: 'Metabolic / Nutritional Fatigue', probability: '10%' },
        ],
        recommendations: [
          'Log your symptoms over the next 24-48 hours',
          'Maintain regular hydration, balanced nutrition, and adequate rest',
          'Book a telehealth video consultation with one of our licensed physicians',
        ],
        otcSuggestions: ['Multivitamins and electrolyte replenishment as appropriate'],
        doctorQuestions: [
          'What triggers or relieves these symptoms?',
          'Are you currently taking any prescription medications?',
        ],
        redFlags: ['Sudden drastic worsening of symptoms', 'High fever or severe unmanageable pain'],
      },
    };
  };

  const handleUserMessage = (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim() && !uploadedImage) return;

    const userMessage: Message = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: messageText,
      image: uploadedImage || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    const hadImage = !!uploadedImage;
    setUploadedImage(null);
    setIsLoading(true);

    setTimeout(() => {
      const response = generateClinicalResponse(messageText, hadImage);
      const aiMessage: Message = {
        id: 'msg-ai-' + Date.now(),
        sender: 'ai',
        text: response.reply,
        diagnosticCard: response.card,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1200);
  };

  const handleSwitchPersona = (persona: SpecialistPersona) => {
    setActivePersona(persona);
    const greetingMsg: Message = {
      id: 'msg-' + Date.now(),
      sender: 'ai',
      text: `[Switched to ${persona.name} - ${persona.specialty}]\n\n${persona.greeting}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, greetingMsg]);
  };

  // Export consultation to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, 210, 26, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Dr.AI Clinical Triage Summary Report', 14, 17);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Patient: ${user?.name || 'Alex Rivera'}`, 14, 36);
    doc.text(`Date: ${new Date().toLocaleDateString()} | Specialist: ${activePersona.name}`, 14, 42);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 46, 196, 46);

    let y = 54;
    messages.forEach((m) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(m.sender === 'ai' ? 16 : 71, m.sender === 'ai' ? 185 : 85, m.sender === 'ai' ? 129 : 105);
      doc.text(`${m.sender === 'ai' ? activePersona.name : 'Patient'}:`, 14, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      const split = doc.splitTextToSize(m.text, 182);
      doc.text(split, 14, y);
      y += split.length * 5 + 4;

      if (m.diagnosticCard) {
        doc.setFillColor(240, 253, 244);
        doc.rect(14, y, 182, 36, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(5, 150, 105);
        doc.text(`Primary Impression: ${m.diagnosticCard.primaryImpression}`, 18, y + 8);
        doc.text(`Urgency: ${m.diagnosticCard.urgency} | Confidence: ${m.diagnosticCard.confidence}%`, 18, y + 15);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        doc.text(`Recommendations: ${m.diagnosticCard.recommendations.slice(0, 2).join(' • ')}`, 18, y + 23);
        doc.text(`OTC Support: ${m.diagnosticCard.otcSuggestions.join(', ')}`, 18, y + 30);
        y += 42;
      }

      if (y > 260) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save(`DrAI_Clinical_Triage_${Date.now()}.pdf`);
  };

  return (
    <Container maxWidth="xl" className="py-6">
      <Grid container spacing={3}>
        {/* Left Sidebar: Specialist Selector & Quick Tools */}
        <Grid item xs={12} lg={3}>
          <Paper elevation={0} className="glass-card rounded-3xl p-5 border border-gray-200 dark:border-gray-800 space-y-4">
            <Box className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              <Typography variant="subtitle1" className="font-bold text-gray-900 dark:text-gray-100">
                AI Clinical Personas
              </Typography>
            </Box>

            <Box className="space-y-1.5">
              {SPECIALIST_PERSONAS.map((persona) => {
                const isSelected = activePersona.id === persona.id;
                return (
                  <Box
                    key={persona.id}
                    onClick={() => handleSwitchPersona(persona)}
                    className={`p-3 rounded-2xl cursor-pointer transition-all duration-200 border flex items-center gap-3 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 shadow-sm ring-2 ring-emerald-500/20'
                        : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/60'
                    }`}
                  >
                    <span className="text-2xl">{persona.avatar}</span>
                    <Box className="min-w-0 flex-1">
                      <Typography variant="subtitle2" className="font-bold text-xs truncate text-gray-900 dark:text-gray-100">
                        {persona.name}
                      </Typography>
                      <Typography variant="caption" className="text-gray-400 text-[10px] block truncate">
                        {persona.specialty}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Quick Actions in Sidebar */}
            <Box className="space-y-2">
              <Button
                fullWidth
                variant="outlined"
                onClick={handleExportPDF}
                startIcon={<Download className="w-4 h-4" />}
                sx={{ borderRadius: 2, fontSize: '0.8rem', fontWeight: 600 }}
              >
                Export Triage as PDF
              </Button>

              <Button
                fullWidth
                variant="contained"
                onClick={() => setBookingOpen(true)}
                startIcon={<Video className="w-4 h-4" />}
                sx={{
                  background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
                  borderRadius: 2,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}
              >
                Book Video Doctor
              </Button>

              <Button
                fullWidth
                variant="outlined"
                color="error"
                onClick={() => setEmergencyOpen(true)}
                startIcon={<AlertTriangle className="w-4 h-4 text-red-500" />}
                sx={{ borderRadius: 2, fontSize: '0.8rem', fontWeight: 600 }}
              >
                Emergency Hotlines (911)
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Center: Main Chat Interface */}
        <Grid item xs={12} lg={9}>
          <Paper
            elevation={0}
            className="glass-card rounded-3xl border border-gray-200 dark:border-gray-800 flex flex-col h-[82vh] overflow-hidden"
          >
            {/* Chat Header */}
            <Box className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white/50 dark:bg-gray-900/50">
              <Box className="flex items-center gap-3">
                <Box className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-xl shadow-md shadow-emerald-500/20">
                  {activePersona.avatar}
                </Box>
                <Box>
                  <Box className="flex items-center gap-2">
                    <Typography variant="subtitle1" className="font-bold text-gray-900 dark:text-white">
                      {activePersona.name}
                    </Typography>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Online & Verified</span>
                  </Box>
                  <Typography variant="caption" className="text-gray-400">
                    {activePersona.specialty} • Encrypted Clinical Session
                  </Typography>
                </Box>
              </Box>

              <Box className="flex items-center gap-1.5">
                <Tooltip title="Clear chat session">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setMessages([
                        {
                          id: 'msg-reset',
                          sender: 'ai',
                          text: activePersona.greeting,
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        },
                      ]);
                    }}
                  >
                    <RefreshCw className="w-4 h-4 text-gray-400" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Messages Scroll Area */}
            <Box className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/30">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <Box
                    key={msg.id}
                    className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <Avatar
                      sx={{
                        width: 38,
                        height: 38,
                        bgcolor: isUser ? '#059669' : '#10B981',
                        border: '2px solid rgba(255,255,255,0.2)',
                      }}
                    >
                      {isUser ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                    </Avatar>

                    <Box className={`max-w-2xl space-y-3 ${isUser ? 'items-end' : 'items-start'}`}>
                      {/* Message Bubble */}
                      <Box
                        className={`p-4 rounded-3xl text-sm leading-relaxed shadow-sm ${
                          isUser
                            ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white rounded-tr-none'
                            : 'glass-card text-gray-800 dark:text-gray-200 border border-gray-200/80 dark:border-gray-800 rounded-tl-none'
                        }`}
                      >
                        {/* Optional uploaded image */}
                        {msg.image && (
                          <Box className="mb-3 rounded-2xl overflow-hidden border border-white/20 max-w-xs">
                            <img src={msg.image} alt="Uploaded symptom" className="w-full h-auto object-cover" />
                            <Box className="p-1.5 bg-black/40 text-white text-[10px] text-center">
                              📸 Image analyzed with dermatological computer vision
                            </Box>
                          </Box>
                        )}

                        <Typography variant="body2" className="whitespace-pre-line text-sm">
                          {msg.text}
                        </Typography>

                        {/* Speech Synthesis Audio Button */}
                        {!isUser && (
                          <Box className="mt-2 pt-2 border-t border-gray-200/60 dark:border-gray-700/60 flex items-center justify-between text-[11px] text-gray-400">
                            <span>{msg.timestamp}</span>
                            <button
                              onClick={() => speakText(msg.text)}
                              className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              {isSpeaking ? 'Stop Audio' : 'Listen to Doctor'}
                            </button>
                          </Box>
                        )}
                      </Box>

                      {/* Structured Clinical Diagnostic Card */}
                      {msg.diagnosticCard && (
                        <Box className="p-5 rounded-3xl bg-white dark:bg-gray-800/90 border-2 border-emerald-500/40 shadow-lg space-y-4 text-xs">
                          {/* Card Header */}
                          <Box className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700 gap-2">
                            <Box>
                              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                                Clinical AI Triage Assessment
                              </span>
                              <Typography variant="subtitle1" className="font-extrabold text-gray-900 dark:text-white">
                                {msg.diagnosticCard.primaryImpression}
                              </Typography>
                            </Box>
                            <Box className="flex items-center gap-2">
                              <Chip
                                label={`Confidence: ${msg.diagnosticCard.confidence}%`}
                                size="small"
                                sx={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#059669', fontWeight: 700 }}
                              />
                              <Chip
                                label={`Urgency: ${msg.diagnosticCard.urgency}`}
                                size="small"
                                sx={{
                                  backgroundColor:
                                    msg.diagnosticCard.urgency === 'Emergency'
                                      ? '#EF4444'
                                      : msg.diagnosticCard.urgency === 'High'
                                      ? '#F59E0B'
                                      : '#10B981',
                                  color: 'white',
                                  fontWeight: 700,
                                }}
                              />
                            </Box>
                          </Box>

                          {/* Differential Diagnoses */}
                          <Box>
                            <Typography variant="caption" className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                              Differential Possibilities:
                            </Typography>
                            <Box className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              {msg.diagnosticCard.differential.map((diff, i) => (
                                <Box key={i} className="p-2 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200/60 dark:border-gray-800">
                                  <span className="font-bold text-gray-900 dark:text-gray-100 block truncate">{diff.condition}</span>
                                  <span className="text-[10px] text-emerald-600 font-semibold">{diff.probability} probability</span>
                                </Box>
                              ))}
                            </Box>
                          </Box>

                          {/* Actionable Recommendations */}
                          <Box>
                            <Typography variant="caption" className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                              Recommended Immediate Care:
                            </Typography>
                            <ul className="list-disc ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                              {msg.diagnosticCard.recommendations.map((rec, i) => (
                                <li key={i}>{rec}</li>
                              ))}
                            </ul>
                          </Box>

                          {/* Over-The-Counter (OTC) suggestions */}
                          <Box className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200">
                            <span className="font-bold block">Safe OTC Considerations:</span>
                            <span>{msg.diagnosticCard.otcSuggestions.join(' • ')}</span>
                          </Box>

                          {/* Card Footer actions */}
                          <Box className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2">
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                              Advisory only. Always consult a physician.
                            </span>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => setBookingOpen(true)}
                              startIcon={<Video className="w-3.5 h-3.5" />}
                              sx={{
                                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                borderRadius: 2,
                                fontWeight: 'bold',
                                textTransform: 'none',
                              }}
                            >
                              Discuss with a Video Doctor
                            </Button>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Box>
                );
              })}

              {isLoading && (
                <Box className="flex items-center gap-3">
                  <Avatar sx={{ width: 38, height: 38, bgcolor: '#10B981' }}>
                    <Bot className="w-5 h-5 text-white" />
                  </Avatar>
                  <Box className="glass-card p-4 rounded-3xl rounded-tl-none flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <Typography variant="body2" className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                      {activePersona.name} is formulating clinical triage analysis...
                    </Typography>
                  </Box>
                </Box>
              )}

              <div ref={messagesEndRef} />
            </Box>

            {/* Input Controls Bar */}
            <Box className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 space-y-2">
              {/* Image upload preview tag */}
              {uploadedImage && (
                <Box className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 max-w-sm">
                  <img src={uploadedImage} alt="Preview" className="w-8 h-8 rounded object-cover" />
                  <Typography variant="caption" className="font-bold text-emerald-800 dark:text-emerald-200 flex-1 truncate">
                    Image ready for AI inspection
                  </Typography>
                  <IconButton size="small" onClick={() => setUploadedImage(null)}>
                    ×
                  </IconButton>
                </Box>
              )}

              <Box className="flex items-center gap-2">
                {/* Image Upload Button */}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <Tooltip title="Upload medical photo or rash for inspection">
                  <IconButton
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      border: '1px solid',
                      borderColor: (theme) => (theme.palette.mode === 'dark' ? '#334155' : '#E2E8F0'),
                      borderRadius: 2.5,
                      p: 1.2,
                    }}
                  >
                    <ImageIcon className="w-5 h-5 text-gray-500" />
                  </IconButton>
                </Tooltip>

                {/* Speech to Text Microphone Button */}
                <Tooltip title={isListening ? 'Listening... click to stop' : 'Speak symptoms with voice'}>
                  <IconButton
                    onClick={toggleSpeechRecognition}
                    sx={{
                      border: '1px solid',
                      borderColor: isListening ? '#EF4444' : (theme) => (theme.palette.mode === 'dark' ? '#334155' : '#E2E8F0'),
                      backgroundColor: isListening ? 'rgba(239, 68, 68, 0.15)' : undefined,
                      borderRadius: 2.5,
                      p: 1.2,
                    }}
                  >
                    {isListening ? (
                      <MicOff className="w-5 h-5 text-red-500 animate-pulse" />
                    ) : (
                      <Mic className="w-5 h-5 text-gray-500" />
                    )}
                  </IconButton>
                </Tooltip>

                {/* Text Input */}
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  maxRows={3}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleUserMessage();
                    }
                  }}
                  placeholder="Type health question, describe symptoms, or ask about medications..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                    },
                  }}
                />

                {/* Send Message Button */}
                <IconButton
                  onClick={() => handleUserMessage()}
                  disabled={!input.trim() && !uploadedImage}
                  sx={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: 'white',
                    borderRadius: 2.5,
                    p: 1.2,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    },
                    '&.Mui-disabled': {
                      background: 'rgba(156, 163, 175, 0.3)',
                      color: 'rgba(255,255,255,0.6)',
                    },
                  }}
                >
                  <Send className="w-5 h-5" />
                </IconButton>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Emergency Alert Modal */}
      <EmergencyModal
        open={emergencyOpen}
        onClose={() => setEmergencyOpen(false)}
        detectedSymptom={emergencySymptom}
      />

      {/* Doctor Video Consultation Booking Modal */}
      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        doctor={doctors[0]}
        initialReason={messages[messages.length - 1]?.text || 'AI Triage Follow-up Consultation'}
      />
    </Container>
  );
};

export default Chat;