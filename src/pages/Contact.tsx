import React, { useState } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  MenuItem,
  Snackbar,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import {
  Mail,
  PhoneCall,
  MapPin,
  Send,
  Clock,
  ShieldAlert,
  Sparkles,
  CheckCircle,
  HelpCircle,
  Building,
} from 'lucide-react';
import { EmergencyModal } from '../components/EmergencyModal';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'General Clinical Support',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        category: 'General Clinical Support',
        subject: '',
        message: '',
      });
    }
  };

  const contactChannels = [
    {
      title: '24/7 Clinical Support',
      value: '+1 (800) 555-MED-AI',
      sub: 'Toll-free medical customer service',
      icon: <PhoneCall className="w-6 h-6 text-emerald-500" />,
      action: 'tel:18005556332',
    },
    {
      title: 'Email Medical Concierge',
      value: 'care@mediai.com',
      sub: 'Response within 2 hours',
      icon: <Mail className="w-6 h-6 text-cyan-500" />,
      action: 'mailto:care@mediai.com',
    },
    {
      title: 'Clinical Headquarters',
      value: '500 Howard St, Suite 400',
      sub: 'San Francisco, CA 94105, USA',
      icon: <MapPin className="w-6 h-6 text-rose-500" />,
      action: 'https://maps.google.com',
    },
  ];

  return (
    <Container maxWidth="xl" className="py-8 space-y-12">
      {/* Header */}
      <Box className="text-center max-w-3xl mx-auto space-y-3">
        <Box className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
          <Sparkles className="w-3.5 h-3.5" /> 24/7 Patient Care Support
        </Box>
        <Typography variant="h3" component="h1" className="font-black text-gray-900 dark:text-white tracking-tight">
          We’re Here for Your Health
        </Typography>
        <Typography variant="body1" className="text-gray-500 dark:text-gray-400">
          Have questions about our AI triage engine, need help scheduling a video consult, or looking for physician partnerships?
        </Typography>
      </Box>

      {/* Emergency Notification Strip */}
      <Box className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-red-900 dark:text-red-200">
        <Box className="flex items-center gap-3 text-xs sm:text-sm">
          <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>
            <strong>Experiencing acute medical distress?</strong> Do not use this contact form. Call <strong>911 / 112</strong> or click below.
          </span>
        </Box>
        <Button
          variant="contained"
          color="error"
          size="small"
          onClick={() => setEmergencyOpen(true)}
          sx={{ borderRadius: 2, fontWeight: 'bold', whiteSpace: 'nowrap' }}
        >
          Emergency 911 Hotline
        </Button>
      </Box>

      {/* Main Grid: Channels & Form */}
      <Grid container spacing={4}>
        {/* Left Column: Channels */}
        <Grid item xs={12} lg={4} className="space-y-4">
          <Typography variant="h6" className="font-extrabold text-gray-900 dark:text-white">
            Direct Support Channels
          </Typography>

          {contactChannels.map((ch, idx) => (
            <Card key={idx} elevation={0} className="glass-card rounded-3xl p-5 border border-gray-200 dark:border-gray-800">
              <Box className="flex items-start gap-4">
                <Box className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800">{ch.icon}</Box>
                <Box className="flex-1">
                  <Typography variant="subtitle2" className="font-bold text-gray-800 dark:text-gray-200">
                    {ch.title}
                  </Typography>
                  <Typography variant="body2" className="font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {ch.value}
                  </Typography>
                  <Typography variant="caption" className="text-gray-400 block text-xs">
                    {ch.sub}
                  </Typography>
                </Box>
              </Box>
            </Card>
          ))}

          {/* Operating Hours Card */}
          <Paper elevation={0} className="glass-card rounded-3xl p-5 border border-gray-200 dark:border-gray-800 space-y-2 text-xs">
            <Typography variant="subtitle2" className="font-bold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-500" /> Clinic Operating Times
            </Typography>
            <Box className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>AI Diagnostic Engine:</span>
              <span className="font-bold text-emerald-600">24/7 / 365 Days</span>
            </Box>
            <Box className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Physician Video Telehealth:</span>
              <span className="font-bold">6:00 AM – 11:00 PM Daily</span>
            </Box>
            <Box className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Emergency Services (ER):</span>
              <span className="font-bold text-rose-500">Continuous 24/7</span>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column: Contact Form */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={0} className="glass-card rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800">
            <Typography variant="h5" className="font-extrabold text-gray-900 dark:text-white mb-2">
              Send Our Healthcare Concierge a Message
            </Typography>
            <Typography variant="body2" className="text-gray-500 text-sm mb-6">
              Fill out the details below and our team will get back to you promptly.
            </Typography>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Your Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    type="email"
                    label="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number (Optional)"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Inquiry Category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <MenuItem value="General Clinical Support">General Clinical Support</MenuItem>
                    <MenuItem value="Video Consult Scheduling">Video Consult Scheduling</MenuItem>
                    <MenuItem value="Doctor Partner Program">Doctor Partner Program</MenuItem>
                    <MenuItem value="Billing & Health Insurance">Billing & Health Insurance</MenuItem>
                    <MenuItem value="Technical Bug / Feedback">Technical Bug / Feedback</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Subject"
                    placeholder="Brief summary of your inquiry..."
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    multiline
                    rows={4}
                    label="Detailed Message"
                    placeholder="Describe how we can assist you..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                variant="contained"
                size="large"
                endIcon={<Send className="w-4 h-4" />}
                sx={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  borderRadius: 2.5,
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.4,
                  mt: 2,
                }}
              >
                Send Inquiry
              </Button>
            </form>
          </Paper>
        </Grid>
      </Grid>

      {/* Emergency Modal */}
      <EmergencyModal open={emergencyOpen} onClose={() => setEmergencyOpen(false)} />

      {/* Feedback Snackbar */}
      <Snackbar open={submitted} autoHideDuration={5000} onClose={() => setSubmitted(false)}>
        <Alert severity="success" sx={{ width: '100%', borderRadius: 2 }}>
          Your message has been dispatched to the Dr.AI clinical concierge team! We will respond shortly.
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Contact;