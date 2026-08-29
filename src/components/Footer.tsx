import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  Divider,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
  Activity,
  ShieldCheck,
  Lock,
  Award,
  Heart,
  PhoneCall,
  Mail,
  MapPin,
  Send,
  AlertCircle,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <Box
      component="footer"
      className="bg-slate-900 text-slate-200 border-t border-slate-800 transition-colors pt-16 pb-8 mt-20"
    >
      <Container maxWidth="xl">
        <Grid container spacing={5} className="mb-12">
          {/* Brand & Mission Column */}
          <Grid item xs={12} md={4}>
            <Box className="flex items-center gap-2.5 mb-4">
              <Box className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </Box>
              <Typography variant="h5" className="font-extrabold text-white tracking-tight">
                Dr.<span className="text-emerald-400">AI</span>
              </Typography>
            </Box>
            <Typography variant="body2" className="text-slate-400 leading-relaxed mb-6">
              AI-driven clinical intelligence, instant differential symptom triage, and on-demand encrypted video consultations with board-certified physicians.
            </Typography>

            {/* Compliance Badges */}
            <Box className="flex flex-wrap gap-2 mb-6">
              <Chip
                icon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                label="HIPAA Compliant"
                size="small"
                sx={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34D399', fontWeight: 600 }}
              />
              <Chip
                icon={<Lock className="w-3.5 h-3.5 text-cyan-400" />}
                label="256-Bit AES Encrypted"
                size="small"
                sx={{ backgroundColor: 'rgba(6, 182, 212, 0.15)', color: '#22D3EE', fontWeight: 600 }}
              />
              <Chip
                icon={<Award className="w-3.5 h-3.5 text-amber-400" />}
                label="AMA Verified Doctors"
                size="small"
                sx={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24', fontWeight: 600 }}
              />
            </Box>
          </Grid>

          {/* Quick Navigation Links */}
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle2" className="font-bold text-white uppercase tracking-wider mb-4 text-xs">
              Healthcare Services
            </Typography>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/chat" className="hover:text-emerald-400 transition-colors">
                  AI Symptom Triage
                </Link>
              </li>
              <li>
                <Link to="/video-consult" className="hover:text-emerald-400 transition-colors">
                  Video Consultations
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-emerald-400 transition-colors">
                  Symptom Matchmaker
                </Link>
              </li>
              <li>
                <Link to="/hospitals" className="hover:text-emerald-400 transition-colors">
                  Find Nearest ER
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-emerald-400 transition-colors">
                  Patient Health Records
                </Link>
              </li>
            </ul>
          </Grid>

          {/* Company & Support Links */}
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle2" className="font-bold text-white uppercase tracking-wider mb-4 text-xs">
              About & Trust
            </Typography>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition-colors">
                  Our Medical Board
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition-colors">
                  Clinical AI Standards
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-emerald-400 transition-colors">
                  Support & Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-emerald-400 transition-colors">
                  Doctor Partner Program
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-emerald-400 transition-colors">
                  Privacy & Data Policy
                </Link>
              </li>
            </ul>
          </Grid>

          {/* 24/7 Hotline & Newsletter */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" className="font-bold text-white uppercase tracking-wider mb-4 text-xs">
              24/7 Clinical Hotline & Updates
            </Typography>
            <Box className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 mb-4">
              <Box className="flex items-center gap-3">
                <Box className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0">
                  <PhoneCall className="w-5 h-5" />
                </Box>
                <Box>
                  <Typography variant="caption" className="text-slate-400 block font-semibold">
                    Emergency Triage Hotline:
                  </Typography>
                  <Typography variant="subtitle1" className="font-black text-white">
                    +1 (800) 555-MED-AI
                  </Typography>
                </Box>
              </Box>
            </Box>

            <form onSubmit={handleSubscribe} className="flex gap-2">
              <TextField
                size="small"
                placeholder="Enter email for health bulletins..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  backgroundColor: '#1E293B',
                  borderRadius: 2,
                  input: { color: 'white', fontSize: '0.85rem' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#334155' },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  borderRadius: 2,
                  px: 2.5,
                  minWidth: 'auto',
                }}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </Grid>
        </Grid>

        {/* Emergency Medical Disclaimer Bar */}
        <Box className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800 flex items-start gap-3 mb-8">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <Typography variant="caption" className="text-slate-400 leading-relaxed">
            <strong>Medical Disclaimer:</strong> Dr.AI provides AI-assisted clinical information and telemedicine access for general healthcare education and triage. In the event of a medical emergency (e.g. chest pain, stroke symptoms, respiratory distress), call <strong>911 / 112</strong> or proceed directly to the nearest hospital Emergency Room immediately.
          </Typography>
        </Box>

        <Divider sx={{ borderColor: 'rgba(51, 65, 85, 0.6)', mb: 4 }} />

        {/* Bottom Copyright */}
        <Box className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <Typography variant="caption">
            &copy; {new Date().getFullYear()} Dr.AI Healthcare Systems Inc. All rights reserved.
          </Typography>
          <Box className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">HIPAA Safe Harbor</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Telehealth</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Doctor Verification</span>
          </Box>
        </Box>
      </Container>

      <Snackbar open={subscribed} autoHideDuration={4000} onClose={() => setSubscribed(false)}>
        <Alert severity="success" sx={{ width: '100%' }}>
          Thank you for subscribing to Dr.AI Health Insights!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Footer;
