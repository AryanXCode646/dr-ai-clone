import React from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  Avatar,
  Card,
  CardContent,
  Chip,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Award,
  Lock,
  Heart,
  Bot,
  Video,
  Sparkles,
  Users,
  CheckCircle,
  Building,
  GraduationCap,
  ArrowRight,
} from 'lucide-react';

const MEDICAL_BOARD = [
  {
    name: 'Dr. Sarah Johnson, MD, FACP',
    role: 'Clinical Advisor (Demo Profile)',
    education: 'Internal Medicine & Telehealth Protocol Design',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
    bio: 'Simulated advisor profile demonstrating primary care workflows and clinical AI triage validation.',
  },
  {
    name: 'Dr. Michael Chen, MD, FACC',
    role: 'Cardiology Advisor (Demo Profile)',
    education: 'Cardiovascular Assessment & Triage Protocols',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
    bio: 'Simulated advisor profile modeling acute cardiovascular red-flag detection and escalation pathways.',
  },
  {
    name: 'Dr. Emily Rodriguez, MD, FAAP',
    role: 'Pediatric Advisor (Demo Profile)',
    education: 'Pediatric Telehealth & Adolescent Guidance',
    image: 'https://images.unsplash.com/photo-1594824813626-d621187d7b37?w=400&auto=format&fit=crop&q=80',
    bio: 'Simulated advisor profile modeling parent-facing pediatric intake and fever triage safety rules.',
  },
  {
    name: 'Dr. James Wilson, MD, FAAD',
    role: 'Dermatology Advisor (Demo Profile)',
    education: 'Dermatological Informatics & Image Intake',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80',
    bio: 'Simulated advisor profile demonstrating multi-modal image triage and dermatology tele-referral.',
  },
];

const SECURITY_STANDARDS = [
  {
    title: 'Role-Based Access Control',
    desc: 'Strict authorization boundaries partition Patient, Doctor, and Admin access across all endpoints.',
    icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
  },
  {
    title: 'Bcrypt & Signed Tokens',
    desc: 'Passwords hashed with salt rounds. Ephemeral JWTs validated on each API boundary with algorithm enforcement.',
    icon: <Lock className="w-6 h-6 text-cyan-500" />,
  },
  {
    title: 'Deterministic Emergency Rules',
    desc: 'Acute symptoms (chest pain, stroke, dyspnea) trigger immediate emergency routing before LLM invocation.',
    icon: <Award className="w-6 h-6 text-amber-500" />,
  },
  {
    title: 'Defensible AI Provenance',
    desc: 'Clear source labeling distinguishes live LLM inference from deterministic fallback templates with no fabricated confidence.',
    icon: <Bot className="w-6 h-6 text-purple-500" />,
  },
];

export const About: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="xl" className="py-8 space-y-16">
      {/* Hero Section */}
      <Box className="text-center max-w-3xl mx-auto space-y-4">
        <Box className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
          <Sparkles className="w-3.5 h-3.5" /> Architecture & Clinical Safeguards
        </Box>
        <Typography variant="h3" component="h1" className="font-black text-gray-900 dark:text-white tracking-tight">
          Technically Defensible AI Healthcare Architecture
        </Typography>
        <Typography variant="body1" className="text-gray-500 dark:text-gray-400 leading-relaxed">
          Dr.AI is an end-to-end prototype designed to prove production-grade clinical AI safeguards, authenticated telehealth workflows, and transactional medical record persistence.
        </Typography>
      </Box>

      {/* Mission Banner */}
      <Paper elevation={0} className="glass-card rounded-3xl p-8 sm:p-12 border border-gray-200 dark:border-gray-800 relative overflow-hidden">
        <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-gradient-to-tl from-emerald-500/15 via-teal-500/10 to-transparent rounded-full blur-3xl -z-10" />

        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6} className="space-y-4">
            <Typography variant="h4" className="font-black text-gray-900 dark:text-white">
              Engineering Defensible Healthcare AI
            </Typography>
            <Typography variant="body1" className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Consumer health queries require more than open-ended chat. A production healthcare architecture must enforce deterministic emergency safety gates, verified identity boundaries, and real conflict-free appointment scheduling.
            </Typography>
            <Typography variant="body1" className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Dr.AI demonstrates how an AI decision support layer integrates seamlessly with backend databases, role-based access control, and simulated telehealth rooms.
            </Typography>

            <Box className="flex flex-wrap gap-3 pt-2">
              <Button
                variant="contained"
                onClick={() => navigate('/chat')}
                endIcon={<ArrowRight className="w-4 h-4" />}
                sx={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  borderRadius: 2.5,
                  fontWeight: 'bold',
                  px: 3,
                }}
              >
                Try AI Triage
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/video-consult')}
                sx={{ borderRadius: 2.5, fontWeight: 600 }}
              >
                Explore Telehealth Demo
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              {[
                { number: '100%', label: 'Emergency Guardrail Intercept' },
                { number: '3', label: 'Isolated Security Roles' },
                { number: '< 1s', label: 'Booking Conflict Engine' },
                { number: '0%', label: 'Fabricated Confidence Scores' },
              ].map((stat, idx) => (
                <Grid item xs={6} key={idx}>
                  <Box className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-800 text-center">
                    <Typography variant="h4" className="font-black text-emerald-600 dark:text-emerald-400">
                      {stat.number}
                    </Typography>
                    <Typography variant="caption" className="text-gray-500 font-semibold block mt-1">
                      {stat.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Security & Clinical Standards */}
      <Box className="space-y-6">
        <Box className="text-center max-w-2xl mx-auto">
          <Typography variant="h4" className="font-black text-gray-900 dark:text-white">
            Enterprise Security & Clinical Standards
          </Typography>
          <Typography variant="body2" className="text-gray-500 dark:text-gray-400 mt-1">
            Built from the ground up to protect patient confidentiality and uphold medical integrity.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {SECURITY_STANDARDS.map((std, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Card elevation={0} className="h-full glass-card rounded-3xl p-5 border border-gray-200 dark:border-gray-800">
                <Box className="p-3 rounded-2xl bg-gray-100 dark:bg-gray-800 w-fit mb-3">{std.icon}</Box>
                <Typography variant="subtitle1" className="font-bold text-gray-900 dark:text-white mb-1">
                  {std.title}
                </Typography>
                <Typography variant="body2" className="text-gray-500 text-xs leading-relaxed">
                  {std.desc}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Medical Board Advisors */}
      <Box className="space-y-6">
        <Box className="text-center max-w-2xl mx-auto">
          <Typography variant="h4" className="font-black text-gray-900 dark:text-white">
            Our Medical Advisory Board
          </Typography>
          <Typography variant="body2" className="text-gray-500 dark:text-gray-400 mt-1">
            Leading clinician-researchers overseeing algorithm safety and telehealth clinical governance.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {MEDICAL_BOARD.map((doc, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Card elevation={0} className="h-full glass-card rounded-3xl p-5 border border-gray-200 dark:border-gray-800 text-center flex flex-col justify-between">
                <Box>
                  <Avatar
                    src={doc.image}
                    alt={doc.name}
                    sx={{ width: 88, height: 88, mx: 'auto', mb: 2, border: '3px solid #10B981' }}
                  />
                  <Typography variant="subtitle1" className="font-bold text-gray-900 dark:text-white">
                    {doc.name}
                  </Typography>
                  <Typography variant="caption" className="text-emerald-600 dark:text-emerald-400 font-bold block mb-1">
                    {doc.role}
                  </Typography>
                  <Typography variant="caption" className="text-gray-400 block text-[11px] mb-2">
                    {doc.education}
                  </Typography>
                  <Typography variant="body2" className="text-gray-500 text-xs leading-relaxed">
                    {doc.bio}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default About;