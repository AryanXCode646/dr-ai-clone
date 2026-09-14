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
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import {
  Send,
  User,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Image as ImageIcon,
  Download,
  RefreshCw,
  Video,
} from 'lucide-react';
import jsPDF from 'jspdf';
import { useAuth } from '../context/AuthContext';
import { useAppointments } from '../context/AppointmentContext';
import { EmergencyModal } from '../components/EmergencyModal';
import { BookingModal } from '../components/BookingModal';
import { chatService } from '../services/chatService';

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
    greeting: "Hello! I'm Dr. AI. To provide educational symptom triage guidance, I will ask you a few targeted questions about your symptoms. What is your primary health concern today?",
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

  const [activePersona] = useState<SpecialistPersona>(SPECIALIST_PERSONAS[0]);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Main user message handler calling backend clinical intelligence pipeline
  const handleUserMessage = async (text: string) => {
    if (!text.trim() && !uploadedImage) return;

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
      return;
    }

    if (text.includes('Book Video Consult') || text.includes('📅')) {
      setBookingOpen(true);
      return;
    }

    if (text.includes('Download PDF') || text.includes('📄')) {
      downloadConsultationPDF();
      return;
    }

    const currentImage = uploadedImage;
    const userMessage: Message = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: text || 'Uploaded medical photo for clinician intake',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      image: currentImage || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setUploadedImage(null);
    setIsLoading(true);

    try {
      if (currentImage) {
        // Send image to backend intake for clinician review
        await chatService.uploadImage(currentImage, 'clinical_intake.jpg', 'image/jpeg');
      }

      const history = messages
        .filter((m) => m.id !== 'msg-init')
        .slice(-6)
        .map((m) => ({
          sender: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
          content: m.text,
        }));

      const assessment = await chatService.sendMessage(
        text || 'Attached clinical photo for clinician review',
        activePersona.id,
        history
      );

      if (assessment.isEmergency) {
        setEmergencySymptom(assessment.summary);
        setEmergencyOpen(true);
      }

      const card: DiagnosticCard = {
        primaryImpression: assessment.possibleConditions[0]?.name || assessment.summary,
        confidence: null as any,
        urgency: assessment.urgency,
        differential: assessment.possibleConditions.map((c) => ({
          condition: c.name,
          probability: c.description,
        })),
        recommendations: [assessment.recommendedNextStep],
        otcSuggestions: ['Consult an attending healthcare provider before taking over-the-counter medications.'],
        doctorQuestions: ['What is the expected timeline?', 'What changes require immediate escalation?'],
        redFlags: assessment.redFlags,
      };

      const aiResponse: Message = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'ai',
        text: assessment.summary,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        diagnosticCard: card,
        suggestedOptions: [
          '📅 Book Video Consult with MD',
          '📄 Download PDF Clinical Report',
          '🔄 Start New Clinical Triage',
        ],
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (err) {
      console.warn('Backend clinical triage inquiry encountered an error; falling back to rule intake:', err);
      const fallbackCard: DiagnosticCard = {
        primaryImpression: 'General Symptom Intake (Clinical Review Recommended)',
        confidence: null as any,
        urgency: 'Low',
        differential: [{ condition: 'Non-emergency symptom cluster', probability: 'In-person medical exam recommended' }],
        recommendations: ['Schedule a consultation with a licensed physician.'],
        otcSuggestions: ['Do not self-medicate without doctor confirmation.'],
        doctorQuestions: ['Are symptoms worsening over time?'],
        redFlags: ['Shortness of breath', 'Chest pressure', 'High fever'],
      };

      const aiResponse: Message = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'ai',
        text: `### 📋 Clinical Triage Notice\n\nYour reported input has been recorded: "${text}".\n\n*Note: This AI assessment is educational and not a substitute for a licensed healthcare provider.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        diagnosticCard: fallbackCard,
        suggestedOptions: ['📅 Book Video Consult with MD', '🔄 Start New Clinical Triage'],
      };

      setMessages((prev) => [...prev, aiResponse]);
    } finally {
      setIsLoading(false);
    }
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
    doc.text('Standard: AI Clinical Triage Advisory (Educational Prototype - Not a Confirmed Diagnosis)', 14, 58);

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
        doc.text(`Primary Consideration: ${m.diagnosticCard.primaryImpression}`, 14, currentY);
        currentY += 6;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(`Urgency: ${m.diagnosticCard.urgency} | Status: AI-Assisted Assessment`, 14, currentY);
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
                label="AI Triage Prototype"
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
                        <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                          [SIMULATED — NOT A MEDICAL DIAGNOSIS]
                        </span>
                        <Typography variant="h6" className="font-black text-white leading-snug">
                          {msg.diagnosticCard.primaryImpression}
                        </Typography>
                      </Box>
                      <Box className="flex gap-2">
                        <Chip
                          label="Simulated Consideration"
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

                    {/* Differential Considerations */}
                    <Box>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">
                        Differential Considerations (Simulated / Educational Guidance):
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