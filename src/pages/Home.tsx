import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Video,
  ShieldCheck,
  Zap,
  ArrowRight,
  Clock,
  Sparkles,
  Search,
  CheckCircle,
  HeartPulse,
  Activity,
  Users,
  ChevronDown,
  Stethoscope,
  Building,
} from 'lucide-react';
import { BodyMap } from '../components/BodyMap';
import { BookingModal } from '../components/BookingModal';
import { Doctor, useAppointments } from '../context/AppointmentContext';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { doctors } = useAppointments();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  const quickSymptoms = [
    { label: 'Pulsating Headache', icon: '🧠' },
    { label: 'Fever & Chills', icon: '🌡️' },
    { label: 'Persistent Cough', icon: '🗣️' },
    { label: 'Chest Pressure', icon: '🫁' },
    { label: 'Stomach Cramps', icon: '🫄' },
    { label: 'Skin Rash & Itching', icon: '🧴' },
    { label: 'Sprain & Joint Ache', icon: '🦵' },
    { label: 'Anxiety & Sleep Issues', icon: '🧘' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/chat?symptoms=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/chat');
    }
  };

  const handleDoctorClick = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setBookingOpen(true);
  };

  const stats = [
    { number: '10M+', label: 'Patients Triaged', sub: 'Across 120+ countries' },
    { number: '500+', label: 'Licensed MDs', sub: 'AMA & Board Certified' },
    { number: '< 18s', label: 'AI Response Time', sub: 'Instant clinical inference' },
    { number: '99.4%', label: 'Clinical Accuracy', sub: 'ICD-11 & PubMed aligned' },
  ];

  const faqs = [
    {
      q: 'How accurate is the Dr.AI medical diagnostic assistant?',
      a: 'Dr.AI utilizes state-of-the-art medical LLMs combined with clinical decision support algorithms benchmarked against ICD-11 diagnostic classifications and peer-reviewed medical databases. It triages symptoms, ranks differential diagnoses, and advises when immediate emergency care or physician follow-up is necessary.',
    },
    {
      q: 'Can I get official prescriptions through video consultations?',
      a: 'Yes. All our doctors are board-certified, licensed physicians who can evaluate you through HIPAA-compliant HD video, write official digital prescriptions, and route them to your preferred pharmacy or generate a downloadable verified PDF.',
    },
    {
      q: 'Is my personal health information confidential and secure?',
      a: 'Absolutely. We enforce 256-bit end-to-end AES encryption, HIPAA Safe Harbor compliance, and strict zero-retention policies for non-consensual health telemetry.',
    },
    {
      q: 'What should I do if I am experiencing severe chest pain or stroke symptoms?',
      a: 'Never delay emergency response. If you have acute chest pain, facial drooping, sudden weakness, or severe breathing difficulties, click our 911 Hotline button or proceed immediately to the nearest Emergency Room.',
    },
  ];

  return (
    <Box className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <Box className="relative overflow-hidden pt-8 pb-16 sm:pt-16 sm:pb-24">
        {/* Background glow orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/20 via-teal-500/15 to-cyan-500/20 blur-[100px] rounded-full pointer-events-none -z-10" />

        <Container maxWidth="xl">
          <Box className="max-w-4xl mx-auto text-center space-y-6">
            {/* Top pill badge */}
            <Box className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-bold shadow-sm">
              <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span>Next-Gen Medical AI 2.0 • 24/7 Board-Certified Physicians</span>
            </Box>

            {/* Main Headline */}
            <Typography
              variant="h2"
              component="h1"
              className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-white tracking-tight leading-tight"
            >
              Instant Medical AI Diagnosis & <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                On-Demand Video Telehealth
              </span>
            </Typography>

            <Typography
              variant="h6"
              className="text-gray-600 dark:text-gray-300 text-base sm:text-xl font-normal max-w-2xl mx-auto leading-relaxed"
            >
              Analyze your symptoms with advanced clinical AI in seconds, consult top-rated board-certified doctors over HD video, and manage your complete health records securely.
            </Typography>

            {/* Interactive Symptom Search Box */}
            <Box className="max-w-2xl mx-auto pt-2">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Box className="glass-card rounded-2xl sm:rounded-full p-2 flex flex-col sm:flex-row items-center gap-2 shadow-xl border border-emerald-500/30">
                  <Box className="flex items-center gap-3 px-4 w-full sm:w-auto flex-1">
                    <Search className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Describe symptoms (e.g. throbbing headache, fever, skin rash)..."
                      className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 text-sm sm:text-base py-2"
                    />
                  </Box>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    endIcon={<ArrowRight className="w-4 h-4" />}
                    sx={{
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      borderRadius: '9999px',
                      px: 3.5,
                      py: 1.4,
                      fontWeight: 'bold',
                      width: { xs: '100%', sm: 'auto' },
                    }}
                  >
                    Triage with AI
                  </Button>
                </Box>
              </form>
            </Box>

            {/* Quick Symptom Chips */}
            <Box className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold mr-1">Popular:</span>
              {quickSymptoms.map((symp) => (
                <Chip
                  key={symp.label}
                  label={`${symp.icon} ${symp.label}`}
                  clickable
                  onClick={() => navigate(`/chat?symptoms=${encodeURIComponent(symp.label)}`)}
                  sx={{
                    borderRadius: '9999px',
                    fontWeight: 600,
                    fontSize: '0.78rem',
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(241, 245, 249, 0.9)',
                    border: '1px solid rgba(226, 232, 240, 0.2)',
                    '&:hover': {
                      backgroundColor: '#10B981',
                      color: 'white',
                    },
                  }}
                />
              ))}
            </Box>

            {/* CTA action buttons */}
            <Box className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/chat')}
                startIcon={<Bot className="w-5 h-5" />}
                sx={{
                  background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
                  borderRadius: 3,
                  px: 4,
                  py: 1.6,
                  fontWeight: 700,
                  fontSize: '1rem',
                  boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
                }}
              >
                Start Free AI Consultation
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/video-consult')}
                startIcon={<Video className="w-5 h-5 text-cyan-500" />}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.6,
                  fontWeight: 700,
                  fontSize: '1rem',
                }}
              >
                Meet a Doctor on Video
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Interactive Anatomy Body Map Section */}
      <Container maxWidth="xl">
        <BodyMap />
      </Container>

      {/* How It Works Section */}
      <Container maxWidth="xl">
        <Box className="text-center max-w-2xl mx-auto mb-12">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300">
            Seamless Healthcare Experience
          </span>
          <Typography variant="h4" className="font-black text-gray-900 dark:text-white mt-2">
            How Dr.AI Empowers Your Health
          </Typography>
          <Typography variant="body2" className="text-gray-500 dark:text-gray-400 mt-1">
            Clinical intelligence from triage to recovery in three streamlined steps.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {[
            {
              step: '01',
              title: 'Multi-Turn AI Clinical Triage',
              desc: 'Describe your symptoms or upload photos. Our medical AI asks adaptive clarifying questions to pinpoint potential conditions.',
              icon: <Bot className="w-8 h-8 text-emerald-500" />,
              color: 'from-emerald-500/10 to-teal-500/10',
            },
            {
              step: '02',
              title: 'Structured Differential Diagnosis',
              desc: 'Receive immediate likelihood ratings, urgency classifications, home remedies, OTC guidelines, and questions to ask your physician.',
              icon: <Activity className="w-8 h-8 text-cyan-500" />,
              color: 'from-cyan-500/10 to-blue-500/10',
            },
            {
              step: '03',
              title: 'Instant Video Consult & Rx',
              desc: 'Seamlessly transition to a licensed board-certified doctor via encrypted video, receive a digital prescription, and get follow-up care.',
              icon: <Video className="w-8 h-8 text-indigo-500" />,
              color: 'from-indigo-500/10 to-purple-500/10',
            },
          ].map((item, idx) => (
            <Grid item xs={12} md={4} key={idx}>
              <Card
                elevation={0}
                className="h-full glass-card rounded-3xl p-6 border border-gray-200 dark:border-gray-800 hover:-translate-y-2 transition-transform duration-300"
              >
                <CardContent className="p-2 flex flex-col justify-between h-full">
                  <Box>
                    <Box className="flex justify-between items-center mb-6">
                      <Box className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${item.color} flex items-center justify-center`}>
                        {item.icon}
                      </Box>
                      <span className="text-3xl font-black text-gray-200 dark:text-gray-800">
                        {item.step}
                      </span>
                    </Box>
                    <Typography variant="h6" className="font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {item.title}
                    </Typography>
                    <Typography variant="body2" className="text-gray-500 dark:text-gray-400 leading-relaxed">
                      {item.desc}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Doctors Section */}
      <Container maxWidth="xl">
        <Box className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <Box>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              Verified Medical Staff
            </span>
            <Typography variant="h4" className="font-black text-gray-900 dark:text-white mt-2">
              Top Board-Certified Specialists
            </Typography>
            <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
              Connect in under 15 minutes with licensed healthcare providers across specialties.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => navigate('/video-consult')}
            endIcon={<ArrowRight className="w-4 h-4" />}
            sx={{ borderRadius: 2.5, fontWeight: 700 }}
          >
            View All Doctors ({doctors.length})
          </Button>
        </Box>

        <Grid container spacing={3}>
          {doctors.slice(0, 4).map((doctor) => (
            <Grid item xs={12} sm={6} md={3} key={doctor.id}>
              <Card
                elevation={0}
                className="h-full glass-card rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <Box className="relative">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-full h-48 object-cover object-top"
                  />
                  <Box className="absolute top-3 right-3">
                    <Chip
                      label={doctor.availability}
                      size="small"
                      sx={{
                        backgroundColor: doctor.availability === 'Available Now' ? '#10B981' : '#06B6D4',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.7rem',
                      }}
                    />
                  </Box>
                </Box>
                <CardContent className="p-4 flex-1 flex flex-col justify-between">
                  <Box>
                    <Typography variant="subtitle1" className="font-bold text-gray-900 dark:text-gray-100 truncate">
                      {doctor.name}
                    </Typography>
                    <Typography variant="caption" className="text-emerald-600 dark:text-emerald-400 font-semibold block mb-1">
                      {doctor.specialty}
                    </Typography>
                    <Box className="flex items-center gap-1 mb-2">
                      <Rating value={doctor.rating} precision={0.1} readOnly size="small" />
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        {doctor.rating}
                      </span>
                      <span className="text-[11px] text-gray-400">({doctor.reviewsCount})</span>
                    </Box>
                    <Typography variant="caption" className="text-gray-500 dark:text-gray-400 block line-clamp-2 mb-3">
                      {doctor.about}
                    </Typography>
                  </Box>

                  <Box className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <Box>
                      <Typography variant="caption" className="text-gray-400 text-[10px] block">Consultation Fee</Typography>
                      <Typography variant="subtitle1" className="font-black text-emerald-600 dark:text-emerald-400">
                        ${doctor.fee}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleDoctorClick(doctor)}
                      sx={{
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        borderRadius: 2,
                        fontWeight: 'bold',
                        textTransform: 'none',
                      }}
                    >
                      Book Consult
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Clinical Stats Banner */}
      <Container maxWidth="xl">
        <Box className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white shadow-2xl relative overflow-hidden">
          <Grid container spacing={4} className="text-center">
            {stats.map((st, idx) => (
              <Grid item xs={6} md={3} key={idx}>
                <Typography variant="h3" className="font-black tracking-tight mb-1 text-3xl sm:text-5xl">
                  {st.number}
                </Typography>
                <Typography variant="subtitle1" className="font-bold text-emerald-100 text-sm sm:text-base">
                  {st.label}
                </Typography>
                <Typography variant="caption" className="text-emerald-200/80 block text-xs">
                  {st.sub}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      {/* Frequently Asked Questions */}
      <Container maxWidth="md">
        <Box className="text-center mb-8">
          <Typography variant="h4" className="font-black text-gray-900 dark:text-white">
            Frequently Asked Questions
          </Typography>
          <Typography variant="body2" className="text-gray-500 dark:text-gray-400 mt-1">
            Learn more about our clinical AI architecture, physician licensing, and telemedicine security.
          </Typography>
        </Box>

        <Box className="space-y-3">
          {faqs.map((faq, idx) => (
            <Accordion
              key={idx}
              elevation={0}
              sx={{
                borderRadius: '16px !important',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                '&:before': { display: 'none' },
                background: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(19, 29, 51, 0.7)' : '#FFFFFF',
              }}
            >
              <AccordionSummary expandIcon={<ChevronDown className="w-5 h-5 text-emerald-500" />}>
                <Typography variant="subtitle1" className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                  {faq.q}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {faq.a}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>

      {/* Booking Modal */}
      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        doctor={selectedDoctor}
      />
    </Box>
  );
};

export default Home;