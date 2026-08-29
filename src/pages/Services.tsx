import React, { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Paper,
  Chip,
  TextField,
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Video,
  Hospital,
  Brain,
  Pill,
  Activity,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
  HeartPulse,
} from 'lucide-react';

const SERVICES = [
  {
    id: 'ai-triage',
    title: 'AI Multi-Turn Clinical Diagnostics',
    description: 'Instant, multi-specialist clinical inquiry and differential diagnosis engine trained on ICD-11 and PubMed evidence.',
    features: ['Adaptive clarifying clinical inquiry', 'Emergency warning signs auto-detection', 'PDF consultation summary export'],
    icon: <Bot className="w-8 h-8 text-emerald-500" />,
    color: 'from-emerald-500/10 to-teal-500/10',
    link: '/chat',
    actionText: 'Launch AI Triage',
  },
  {
    id: 'video-consult',
    title: 'Encrypted HD Video Telehealth',
    description: 'Connect with board-certified physicians from the comfort of your home with integrated webcam and audio controls.',
    features: ['Board-certified MDs across 10+ specialties', 'Real-time in-call clinical notepad', 'Instant digital prescriptions & refills'],
    icon: <Video className="w-8 h-8 text-cyan-500" />,
    color: 'from-cyan-500/10 to-blue-500/10',
    link: '/video-consult',
    actionText: 'Book Video Visit',
  },
  {
    id: 'er-locator',
    title: '24/7 Emergency Room & Trauma Locator',
    description: 'Real-time simulated ER wait times, Level 1 trauma capabilities, and one-click ambulance dispatch shortcuts.',
    features: ['Live wait-time estimations', 'Pediatric ER & Stroke center filtering', 'One-click GPS emergency routing'],
    icon: <Hospital className="w-8 h-8 text-rose-500" />,
    color: 'from-rose-500/10 to-red-500/10',
    link: '/hospitals',
    actionText: 'Find Nearest ER',
  },
  {
    id: 'vitals-tracker',
    title: 'Continuous Vitals & Health Telemetry',
    description: 'Interactive graphical tracking of blood pressure, resting heart rate, SpO2, and fasting blood glucose levels.',
    features: ['7-day and 30-day interactive SVG trends', 'Healthy clinical baseline comparisons', 'Exportable health records for physicians'],
    icon: <Activity className="w-8 h-8 text-amber-500" />,
    color: 'from-amber-500/10 to-orange-500/10',
    link: '/profile',
    actionText: 'View Vitals Dashboard',
  },
  {
    id: 'mental-health',
    title: 'Mental Wellness & Cognitive Support',
    description: 'Confidential psychiatric triage, burnout assessment, anxiety coping tools, and licensed therapist telehealth sessions.',
    features: ['PHQ-9 and GAD-7 screening triage', 'Stress mitigation strategies', 'Compassionate video sessions'],
    icon: <Brain className="w-8 h-8 text-purple-500" />,
    color: 'from-purple-500/10 to-indigo-500/10',
    link: '/chat?symptoms=anxiety%20stress',
    actionText: 'Start Wellness Triage',
  },
  {
    id: 'prescription-wallet',
    title: 'Digital Rx & Prescription Management',
    description: 'Official verified digital prescriptions signed with cryptographic physician certificates and automatic dosage alerts.',
    features: ['Downloadable tamper-evident PDF Rx', 'Dosage and frequency schedule manager', 'Allergy cross-check safety mechanism'],
    icon: <Pill className="w-8 h-8 text-blue-500" />,
    color: 'from-blue-500/10 to-cyan-500/10',
    link: '/profile',
    actionText: 'Manage Medications',
  },
];

const MATCHMAKER_OPTIONS = [
  {
    concern: 'Throbbing head pain, light sensitivity, or visual flashes',
    specialist: 'Neurologist / General Physician',
    recommendedAction: 'AI Headache Triage -> Video Consult for Migraine Therapy',
    targetRoute: '/chat?symptoms=Migraine%20and%20Light%20Sensitivity',
  },
  {
    concern: 'Skin rash, itchy red patches, or changing mole',
    specialist: 'Consultant Dermatologist',
    recommendedAction: 'Upload Photo in AI Chat -> Video Dermoscopy Visit',
    targetRoute: '/chat?symptoms=Skin%20Rash%20and%20Itching',
  },
  {
    concern: 'Child fever, croup cough, or ear pain',
    specialist: 'Board Certified Pediatrician',
    recommendedAction: 'Switch to Dr. AI Pediatrics -> Urgent Telehealth Appointment',
    targetRoute: '/chat?symptoms=Child%20Fever%20and%20Cough',
  },
  {
    concern: 'Heart flutter, elevated BP readings, or mild exertion tightness',
    specialist: 'Cardiologist & Vascular Specialist',
    recommendedAction: 'Log Vitals in Profile -> Schedule Cardiology Consult',
    targetRoute: '/video-consult',
  },
  {
    concern: 'Persistent low mood, insomnia, or severe work anxiety',
    specialist: 'Psychiatrist & Cognitive Therapist',
    recommendedAction: 'Mental Wellness AI Triage -> Therapy Video Session',
    targetRoute: '/chat?symptoms=Anxiety%20and%20Insomnia',
  },
];

export const Services: React.FC = () => {
  const navigate = useNavigate();
  const [selectedConcernIdx, setSelectedConcernIdx] = useState<number>(0);

  const currentMatch = MATCHMAKER_OPTIONS[selectedConcernIdx];

  return (
    <Container maxWidth="xl" className="py-8 space-y-12">
      {/* Hero Header */}
      <Box className="text-center max-w-3xl mx-auto space-y-3">
        <Box className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
          <Sparkles className="w-3.5 h-3.5" /> Comprehensive Health Solutions
        </Box>
        <Typography variant="h3" component="h1" className="font-black text-gray-900 dark:text-white tracking-tight">
          Clinical Telehealth & AI Care Ecosystem
        </Typography>
        <Typography variant="body1" className="text-gray-500 dark:text-gray-400">
          From intelligent instant differential triage to board-certified physician consultations and digital prescriptions.
        </Typography>
      </Box>

      {/* Interactive Symptom-to-Specialist Matchmaker Tool */}
      <Paper elevation={0} className="glass-card rounded-3xl p-6 sm:p-8 border border-emerald-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-emerald-500/15 via-cyan-500/10 to-transparent rounded-full blur-2xl -z-10" />

        <Box className="max-w-3xl mb-6">
          <Box className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300">
              Interactive Tool
            </span>
          </Box>
          <Typography variant="h5" className="font-extrabold text-gray-900 dark:text-white">
            Symptom-to-Specialist Matchmaker
          </Typography>
          <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
            Unsure who to consult? Select your health concern below to see the recommended clinical pathway.
          </Typography>
        </Box>

        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Select your primary health symptom or concern:"
              value={selectedConcernIdx}
              onChange={(e) => setSelectedConcernIdx(Number(e.target.value))}
            >
              {MATCHMAKER_OPTIONS.map((opt, i) => (
                <MenuItem key={i} value={i}>
                  {opt.concern}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300/60 dark:border-emerald-800 space-y-2">
              <Box className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300">
                  Recommended Specialist
                </span>
                <Chip label="Optimal Match" size="small" sx={{ backgroundColor: '#10B981', color: 'white', fontWeight: 'bold' }} />
              </Box>
              <Typography variant="h6" className="font-extrabold text-gray-900 dark:text-white">
                {currentMatch.specialist}
              </Typography>
              <Typography variant="body2" className="text-xs text-gray-600 dark:text-gray-300">
                <strong>Pathway:</strong> {currentMatch.recommendedAction}
              </Typography>
              <Button
                variant="contained"
                size="small"
                onClick={() => navigate(currentMatch.targetRoute)}
                endIcon={<ArrowRight className="w-4 h-4" />}
                sx={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  fontWeight: 'bold',
                  borderRadius: 2,
                  mt: 1,
                }}
              >
                Proceed to Match
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Services Grid */}
      <Grid container spacing={3}>
        {SERVICES.map((service) => (
          <Grid item xs={12} md={6} lg={4} key={service.id}>
            <Card
              elevation={0}
              className="h-full glass-card rounded-3xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <Box className="space-y-4">
                <Box className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${service.color} flex items-center justify-center`}>
                  {service.icon}
                </Box>
                <Typography variant="h6" className="font-bold text-gray-900 dark:text-white leading-snug">
                  {service.title}
                </Typography>
                <Typography variant="body2" className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">
                  {service.description}
                </Typography>

                <Box className="space-y-1.5 pt-2">
                  {service.features.map((feat, i) => (
                    <Box key={i} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span>{feat}</span>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box className="pt-6">
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => navigate(service.link)}
                  endIcon={<ArrowRight className="w-4 h-4" />}
                  sx={{
                    background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
                    borderRadius: 2.5,
                    fontWeight: 'bold',
                    py: 1.2,
                  }}
                >
                  {service.actionText}
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Services;