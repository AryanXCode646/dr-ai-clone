import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Rating,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Paper,
  Slider,
  Dialog,
  DialogContent,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  MessageSquare,
  FileText,
  Share2,
  Settings,
  Search,
  Filter,
  CheckCircle,
  Sparkles,
  Calendar,
  Clock,
  Building,
  GraduationCap,
  Languages,
  ShieldCheck,
  Send,
  Star,
  Download,
  User,
} from 'lucide-react';
import { Doctor, Appointment, useAppointments } from '../context/AppointmentContext';
import { useAuth } from '../context/AuthContext';
import { BookingModal } from '../components/BookingModal';
import { PrescriptionModal } from '../components/PrescriptionModal';

export const VideoConsult: React.FC = () => {
  const { doctors, appointments, completeAppointment } = useAppointments();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('All');
  const [maxFee, setMaxFee] = useState<number>(100);

  // Booking Modal State
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  // Video Room States
  const [isInCall, setIsInCall] = useState(false);
  const [activeDoctor, setActiveDoctor] = useState<Doctor>(doctors[0]);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [inCallTab, setInCallTab] = useState<'none' | 'chat' | 'notes'>('none');
  const [inCallMessages, setInCallMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    {
      sender: 'Dr. Sarah Johnson, MD',
      text: 'Hello Alex! I have your AI symptom triage report. How are you feeling right now?',
      time: 'Just now',
    },
  ]);
  const [inCallInput, setInCallInput] = useState('');
  const [doctorNotes, setDoctorNotes] = useState(
    'Patient presenting with mild headache and seasonal allergic rhinitis. Lungs clear to auscultation. Vitals stable.'
  );

  // Post-call Feedback & Prescription Modal
  const [postCallModalOpen, setPostCallModalOpen] = useState(false);
  const [doctorRating, setDoctorRating] = useState(5);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [prescriptionData, setPrescriptionData] = useState<any>(null);
  const [prescriptionOpen, setPrescriptionOpen] = useState(false);

  // Media Stream Ref for User Camera
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Check if room parameter is present in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const room = params.get('room');
    if (room) {
      startLiveConsultation(doctors[0]);
    }
  }, [location.search]);

  // Timer for active call
  useEffect(() => {
    let interval: any;
    if (isInCall) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [isInCall]);

  // Request actual camera/mic stream when entering call
  const startLiveConsultation = async (doctor: Doctor) => {
    setActiveDoctor(doctor);
    setIsInCall(true);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        mediaStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }
    } catch (err) {
      console.log('Camera/Mic permission not granted or unavailable, fallback mode active:', err);
    }
  };

  const endLiveConsultation = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsInCall(false);

    // Prepare generated prescription data
    const rx = {
      doctorName: activeDoctor.name,
      doctorSpecialty: activeDoctor.specialty,
      doctorHospital: activeDoctor.hospital,
      patientName: user?.name || 'Alex Rivera',
      patientAge: '30',
      patientGender: 'Male',
      date: new Date().toLocaleDateString(),
      diagnosis: 'Acute Upper Respiratory Allergic Rhinopathy',
      medicines: [
        {
          name: 'Cetirizine Hydrochloride (Zyrtec)',
          dosage: '10mg',
          frequency: '1 tablet once daily at bedtime',
          duration: '14 days',
        },
        {
          name: 'Fluticasone Propionate Nasal Spray',
          dosage: '50mcg / spray',
          frequency: '2 sprays in each nostril daily',
          duration: '30 days',
        },
        {
          name: 'Saline Sinus Rinse',
          dosage: 'Isotonic buffer',
          frequency: 'As needed morning and night',
          duration: 'As needed',
        },
      ],
      advice:
        'Stay well hydrated. Avoid outdoor allergens during high pollen counts. If shortness of breath worsens, use prescribed albuterol inhaler.',
      followUp: 'Schedule telehealth follow-up in 2 weeks if symptoms do not resolve.',
    };

    setPrescriptionData(rx);
    setPostCallModalOpen(true);
  };

  const toggleMic = () => {
    if (mediaStreamRef.current) {
      const audioTracks = mediaStreamRef.current.getAudioTracks();
      audioTracks.forEach((track) => (track.enabled = !isMicOn));
    }
    setIsMicOn(!isMicOn);
  };

  const toggleVideo = () => {
    if (mediaStreamRef.current) {
      const videoTracks = mediaStreamRef.current.getVideoTracks();
      videoTracks.forEach((track) => (track.enabled = !isVideoOn));
    }
    setIsVideoOn(!isVideoOn);
  };

  const handleSendInCallMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inCallInput.trim()) return;

    const newMsg = {
      sender: user?.name || 'Alex Rivera',
      text: inCallInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setInCallMessages((prev) => [...prev, newMsg]);
    setInCallInput('');

    // Simulated doctor reply
    setTimeout(() => {
      setInCallMessages((prev) => [
        ...prev,
        {
          sender: activeDoctor.name,
          text: 'Got it! I am noting that down in your clinical summary chart.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1500);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Filter Doctors
  const specialties = ['All', 'General Physician', 'Cardiologist', 'Pediatrician', 'Dermatologist', 'Psychiatrist', 'Neurologist'];

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.about.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecialty =
      selectedSpecialty === 'All' || doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());

    const matchesAvailability =
      selectedAvailability === 'All' || doc.availability.toLowerCase().includes(selectedAvailability.toLowerCase());

    const matchesFee = doc.fee <= maxFee;

    return matchesSearch && matchesSpecialty && matchesAvailability && matchesFee;
  });

  return (
    <Container maxWidth="xl" className="py-6">
      {/* If currently in live call room */}
      {isInCall ? (
        <Box className="space-y-4">
          {/* Call Header Bar */}
          <Box className="p-4 rounded-2xl glass-card flex items-center justify-between border border-gray-200 dark:border-gray-800">
            <Box className="flex items-center gap-3">
              <Box className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <Typography variant="subtitle1" className="font-bold text-gray-900 dark:text-white">
                Encrypted HD Telehealth Session • {activeDoctor.name}
              </Typography>
              <Chip
                label={`Call Time: ${formatTime(callDuration)}`}
                size="small"
                sx={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#059669', fontWeight: 700 }}
              />
            </Box>

            <Box className="flex items-center gap-2">
              <Chip
                icon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />}
                label="HIPAA 256-Bit Encrypted"
                size="small"
                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
              />
              <Button
                variant="contained"
                color="error"
                onClick={endLiveConsultation}
                startIcon={<PhoneOff className="w-4 h-4" />}
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                End Call
              </Button>
            </Box>
          </Box>

          {/* Main Video Grid */}
          <Grid container spacing={3}>
            <Grid item xs={12} lg={inCallTab === 'none' ? 12 : 8}>
              <Box className="relative rounded-3xl overflow-hidden bg-slate-950 aspect-video max-h-[68vh] flex items-center justify-center border border-slate-800 shadow-2xl">
                {/* Doctor Video Feed (Simulated high-res feed) */}
                <img
                  src={activeDoctor.image}
                  alt={activeDoctor.name}
                  className="w-full h-full object-cover object-top opacity-90"
                />

                {/* Doctor Nameplate */}
                <Box className="absolute top-4 left-4 p-3 rounded-2xl bg-black/60 backdrop-blur-md text-white border border-white/10 flex items-center gap-3">
                  <Avatar src={activeDoctor.image} sx={{ width: 36, height: 36, border: '2px solid #10B981' }} />
                  <Box>
                    <Typography variant="subtitle2" className="font-bold leading-tight">
                      {activeDoctor.name}
                    </Typography>
                    <Typography variant="caption" className="text-emerald-400 block text-[11px]">
                      {activeDoctor.specialty} • Attending
                    </Typography>
                  </Box>
                </Box>

                {/* Patient Picture-in-Picture Self Video Stream */}
                <Box className="absolute bottom-4 right-4 w-44 sm:w-56 aspect-video rounded-2xl overflow-hidden bg-slate-900 border-2 border-emerald-500/80 shadow-2xl">
                  {isVideoOn ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform scale-x-[-1]"
                    />
                  ) : (
                    <Box className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-slate-800">
                      <User className="w-8 h-8 mb-1" />
                      <span className="text-[10px]">Camera Off</span>
                    </Box>
                  )}
                  <span className="absolute bottom-1.5 left-2 text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-md">
                    You ({user?.name ? user.name.split(' ')[0] : 'Alex'})
                  </span>
                </Box>

                {/* Center Audio Waveform Indicator */}
                <Box className="absolute bottom-4 left-4 p-2.5 rounded-2xl bg-black/60 backdrop-blur-md text-emerald-400 flex items-center gap-2 border border-white/10">
                  <span className="w-2 h-4 bg-emerald-400 rounded-full animate-bounce" />
                  <span className="w-2 h-6 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  <Typography variant="caption" className="text-white text-xs font-semibold">
                    Doctor Audio Active
                  </Typography>
                </Box>
              </Box>

              {/* In-Call Control Bar */}
              <Box className="mt-4 p-3 rounded-2xl glass-card flex items-center justify-center gap-3 border border-gray-200 dark:border-gray-800">
                <Tooltip title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}>
                  <IconButton
                    onClick={toggleMic}
                    sx={{
                      backgroundColor: isMicOn ? '#10B981' : '#EF4444',
                      color: 'white',
                      p: 1.5,
                      '&:hover': { backgroundColor: isMicOn ? '#059669' : '#DC2626' },
                    }}
                  >
                    {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </IconButton>
                </Tooltip>

                <Tooltip title={isVideoOn ? 'Turn Camera Off' : 'Turn Camera On'}>
                  <IconButton
                    onClick={toggleVideo}
                    sx={{
                      backgroundColor: isVideoOn ? '#10B981' : '#EF4444',
                      color: 'white',
                      p: 1.5,
                      '&:hover': { backgroundColor: isVideoOn ? '#059669' : '#DC2626' },
                    }}
                  >
                    {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </IconButton>
                </Tooltip>

                <Tooltip title="Toggle In-Call Chat">
                  <IconButton
                    onClick={() => setInCallTab(inCallTab === 'chat' ? 'none' : 'chat')}
                    sx={{
                      backgroundColor: inCallTab === 'chat' ? '#06B6D4' : 'rgba(156, 163, 175, 0.2)',
                      color: inCallTab === 'chat' ? 'white' : 'inherit',
                      p: 1.5,
                    }}
                  >
                    <MessageSquare className="w-5 h-5" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="View Live Clinical Prescription Pad">
                  <IconButton
                    onClick={() => setInCallTab(inCallTab === 'notes' ? 'none' : 'notes')}
                    sx={{
                      backgroundColor: inCallTab === 'notes' ? '#8B5CF6' : 'rgba(156, 163, 175, 0.2)',
                      color: inCallTab === 'notes' ? 'white' : 'inherit',
                      p: 1.5,
                    }}
                  >
                    <FileText className="w-5 h-5" />
                  </IconButton>
                </Tooltip>

                <Button
                  variant="contained"
                  color="error"
                  onClick={endLiveConsultation}
                  startIcon={<PhoneOff className="w-4 h-4" />}
                  sx={{ borderRadius: 2.5, px: 3, fontWeight: 'bold' }}
                >
                  End Call
                </Button>
              </Box>
            </Grid>

            {/* In-Call Side Panel: Chat or Live Rx Pad */}
            {inCallTab !== 'none' && (
              <Grid item xs={12} lg={4}>
                <Paper
                  elevation={0}
                  className="glass-card rounded-3xl p-4 border border-gray-200 dark:border-gray-800 h-[68vh] flex flex-col justify-between"
                >
                  {inCallTab === 'chat' ? (
                    <>
                      <Box className="pb-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                        <Typography variant="subtitle1" className="font-bold">
                          In-Call Consultation Chat
                        </Typography>
                        <IconButton size="small" onClick={() => setInCallTab('none')}>
                          ×
                        </IconButton>
                      </Box>

                      <Box className="flex-1 overflow-y-auto py-3 space-y-3">
                        {inCallMessages.map((m, idx) => (
                          <Box key={idx} className="p-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-xs">
                            <Box className="flex justify-between font-bold mb-1 text-gray-800 dark:text-gray-200">
                              <span>{m.sender}</span>
                              <span className="text-[10px] text-gray-400 font-normal">{m.time}</span>
                            </Box>
                            <Typography variant="body2" className="text-xs text-gray-600 dark:text-gray-300">
                              {m.text}
                            </Typography>
                          </Box>
                        ))}
                      </Box>

                      <form onSubmit={handleSendInCallMessage} className="flex gap-2 pt-2">
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Type message to doctor..."
                          value={inCallInput}
                          onChange={(e) => setInCallInput(e.target.value)}
                        />
                        <Button type="submit" variant="contained" sx={{ borderRadius: 2 }}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </form>
                    </>
                  ) : (
                    <>
                      <Box className="pb-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                        <Typography variant="subtitle1" className="font-bold flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-emerald-500" /> Live Doctor Clinical Notes
                        </Typography>
                        <IconButton size="small" onClick={() => setInCallTab('none')}>
                          ×
                        </IconButton>
                      </Box>

                      <Box className="flex-1 py-3 space-y-3 overflow-y-auto text-xs">
                        <Box className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
                          <Typography variant="caption" className="font-bold text-emerald-700 dark:text-emerald-300 block mb-1">
                            Current Impression:
                          </Typography>
                          <Typography variant="body2" className="text-xs">
                            Acute Allergic Rhinitis & Mild Tension Cephalea
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="caption" className="font-bold text-gray-500 block mb-1">
                            Doctor Real-Time Notes:
                          </Typography>
                          <TextField
                            fullWidth
                            multiline
                            rows={6}
                            value={doctorNotes}
                            onChange={(e) => setDoctorNotes(e.target.value)}
                            size="small"
                          />
                        </Box>
                      </Box>

                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => {
                          setPrescriptionData({
                            doctorName: activeDoctor.name,
                            doctorSpecialty: activeDoctor.specialty,
                            doctorHospital: activeDoctor.hospital,
                            patientName: user?.name || 'Alex Rivera',
                            date: new Date().toLocaleDateString(),
                            diagnosis: 'Acute Upper Respiratory Allergic Rhinopathy',
                            medicines: [
                              { name: 'Cetirizine 10mg', dosage: '1 tab', frequency: 'Once daily', duration: '14 days' },
                            ],
                            advice: doctorNotes,
                          });
                          setPrescriptionOpen(true);
                        }}
                        startIcon={<Download className="w-4 h-4" />}
                        sx={{ borderRadius: 2, fontWeight: 'bold' }}
                      >
                        Preview Digital Rx
                      </Button>
                    </>
                  )}
                </Paper>
              </Grid>
            )}
          </Grid>
        </Box>
      ) : (
        /* Doctor Directory & Booking Catalog */
        <Box className="space-y-8">
          {/* Header Banner */}
          <Box className="text-center max-w-3xl mx-auto space-y-3">
            <Box className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300">
              <Sparkles className="w-3.5 h-3.5" /> Board-Certified Telehealth Network
            </Box>
            <Typography variant="h3" component="h1" className="font-black text-gray-900 dark:text-white tracking-tight">
              Consult with Experienced Physicians
            </Typography>
            <Typography variant="body1" className="text-gray-500 dark:text-gray-400">
              Book scheduled visits or connect instantly via encrypted HD video calls with leading specialists.
            </Typography>
          </Box>

          {/* Search & Filter Toolbar */}
          <Paper elevation={0} className="glass-card rounded-3xl p-5 border border-gray-200 dark:border-gray-800 space-y-4">
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={5}>
                <Box className="flex items-center gap-2 p-2 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <Search className="w-5 h-5 text-gray-400 ml-2" />
                  <input
                    type="text"
                    placeholder="Search doctor by name, specialty, or condition..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white"
                  />
                </Box>
              </Grid>

              <Grid item xs={6} sm={4} md={3}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Specialty"
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                >
                  {specialties.map((spec) => (
                    <MenuItem key={spec} value={spec}>
                      {spec}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={6} sm={4} md={2}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Availability"
                  value={selectedAvailability}
                  onChange={(e) => setSelectedAvailability(e.target.value)}
                >
                  <MenuItem value="All">Anytime</MenuItem>
                  <MenuItem value="Available Now">Online Now</MenuItem>
                  <MenuItem value="Today">Today</MenuItem>
                  <MenuItem value="Tomorrow">Tomorrow</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={4} md={2}>
                <Box className="px-2">
                  <Typography variant="caption" className="text-gray-500 font-bold block text-[11px]">
                    Max Fee: ${maxFee}
                  </Typography>
                  <Slider
                    value={maxFee}
                    min={40}
                    max={150}
                    step={5}
                    onChange={(_, val) => setMaxFee(val as number)}
                    size="small"
                    sx={{ color: '#10B981' }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Doctor Cards Grid */}
          <Grid container spacing={3}>
            {filteredDoctors.map((doctor) => (
              <Grid item xs={12} sm={6} lg={4} key={doctor.id}>
                <Card
                  elevation={0}
                  className="h-full glass-card rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <Box className="p-6 space-y-4">
                    {/* Top Doctor Avatar & Status */}
                    <Box className="flex items-start gap-4">
                      <Avatar
                        src={doctor.image}
                        alt={doctor.name}
                        sx={{ width: 80, height: 80, border: '3px solid #10B981', boxShadow: '0 4px 12px rgba(16,185,129,0.2)' }}
                      />
                      <Box className="flex-1">
                        <Box className="flex items-center justify-between">
                          <Chip
                            label={doctor.availability}
                            size="small"
                            sx={{
                              backgroundColor:
                                doctor.availability === 'Available Now'
                                  ? 'rgba(16, 185, 129, 0.15)'
                                  : 'rgba(6, 182, 212, 0.15)',
                              color: doctor.availability === 'Available Now' ? '#059669' : '#0891B2',
                              fontWeight: 700,
                              fontSize: '0.7rem',
                            }}
                          />
                          <Typography variant="h6" className="font-extrabold text-emerald-600 dark:text-emerald-400">
                            ${doctor.fee}
                          </Typography>
                        </Box>
                        <Typography variant="h6" className="font-bold text-gray-900 dark:text-white mt-1">
                          {doctor.name}
                        </Typography>
                        <Typography variant="caption" className="text-emerald-600 dark:text-emerald-400 font-semibold block">
                          {doctor.specialty}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Rating and Experience */}
                    <Box className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
                      <Box className="flex items-center gap-1">
                        <Rating value={doctor.rating} precision={0.1} readOnly size="small" />
                        <span className="font-bold">{doctor.rating}</span>
                        <span className="text-gray-400">({doctor.reviewsCount})</span>
                      </Box>
                      <span>•</span>
                      <span>{doctor.experience}</span>
                    </Box>

                    {/* Hospital & Education */}
                    <Box className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <Box className="flex items-center gap-2">
                        <Building className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{doctor.hospital}</span>
                      </Box>
                      <Box className="flex items-center gap-2">
                        <GraduationCap className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{doctor.education}</span>
                      </Box>
                      <Box className="flex items-center gap-2">
                        <Languages className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span>{doctor.languages.join(', ')}</span>
                      </Box>
                    </Box>

                    <Typography variant="body2" className="text-gray-600 dark:text-gray-300 text-xs line-clamp-2 leading-relaxed">
                      {doctor.about}
                    </Typography>
                  </Box>

                  {/* Action Buttons */}
                  <Box className="p-4 bg-gray-50/80 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => startLiveConsultation(doctor)}
                      startIcon={<Video className="w-4 h-4" />}
                      sx={{
                        background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
                        fontWeight: 'bold',
                        borderRadius: 2,
                      }}
                    >
                      Instant Call
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => {
                        setSelectedDoctor(doctor);
                        setBookingOpen(true);
                      }}
                      startIcon={<Calendar className="w-4 h-4" />}
                      sx={{ borderRadius: 2, fontWeight: 600 }}
                    >
                      Schedule Slot
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Booking Modal */}
      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        doctor={selectedDoctor}
      />

      {/* Post-Call Rating & Feedback Dialog */}
      <Dialog
        open={postCallModalOpen}
        onClose={() => setPostCallModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: (theme) => (theme.palette.mode === 'dark' ? '#0F172A' : '#FFFFFF'),
          },
        }}
      >
        <DialogContent className="text-center p-6 space-y-4">
          <Box className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle className="w-8 h-8" />
          </Box>
          <Typography variant="h6" className="font-bold text-gray-900 dark:text-white">
            Consultation Completed
          </Typography>
          <Typography variant="body2" className="text-gray-500 text-xs">
            How was your telehealth experience with <strong>{activeDoctor.name}</strong>?
          </Typography>

          <Box className="flex justify-center py-1">
            <Rating
              value={doctorRating}
              onChange={(_, val) => setDoctorRating(val || 5)}
              size="large"
            />
          </Box>

          <TextField
            fullWidth
            size="small"
            placeholder="Optional review or feedback for the clinic..."
            value={feedbackNotes}
            onChange={(e) => setFeedbackNotes(e.target.value)}
          />

          <Box className="flex flex-col gap-2 pt-2">
            <Button
              variant="contained"
              onClick={() => {
                setPostCallModalOpen(false);
                setPrescriptionOpen(true);
              }}
              startIcon={<FileText className="w-4 h-4" />}
              sx={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                borderRadius: 2,
                fontWeight: 'bold',
              }}
            >
              View & Download Prescription (PDF)
            </Button>
            <Button
              variant="text"
              onClick={() => setPostCallModalOpen(false)}
              sx={{ borderRadius: 2 }}
            >
              Close & Return to Doctors
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Prescription PDF Modal */}
      {prescriptionData && (
        <PrescriptionModal
          open={prescriptionOpen}
          onClose={() => setPrescriptionOpen(false)}
          data={prescriptionData}
        />
      )}
    </Container>
  );
};

export default VideoConsult;