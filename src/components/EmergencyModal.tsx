import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  AlertTriangle,
  PhoneCall,
  X,
  MapPin,
  HeartPulse,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EmergencyModalProps {
  open: boolean;
  onClose: () => void;
  detectedSymptom?: string;
  symptom?: string;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  open,
  onClose,
  detectedSymptom,
  symptom,
}) => {
  const navigate = useNavigate();
  const activeSymptom = symptom || detectedSymptom;

  const emergencyContacts = [
    {
      title: 'Emergency Medical Services',
      number: '911',
      sub: 'USA / Canada / International dispatch',
      color: 'from-red-600 to-rose-600',
      action: 'tel:911',
    },
    {
      title: 'European Emergency Hotline',
      number: '112',
      sub: 'All EU countries & Mobile standard',
      color: 'from-red-600 to-amber-600',
      action: 'tel:112',
    },
    {
      title: 'National Poison Control',
      number: '1-800-222-1222',
      sub: '24/7 Free Expert Toxicologist Advice',
      color: 'from-amber-600 to-orange-600',
      action: 'tel:18002221222',
    },
    {
      title: 'Suicide & Crisis Lifeline',
      number: '988',
      sub: 'Free & Confidential Emotional Support',
      color: 'from-indigo-600 to-blue-600',
      action: 'tel:988',
    },
  ];

  const handleHospitalNavigate = () => {
    onClose();
    navigate('/hospitals');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          background: (theme) =>
            theme.palette.mode === 'dark' ? '#0F172A' : '#FFFFFF',
          border: '2px solid rgba(239, 68, 68, 0.4)',
          boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.25)',
        },
      }}
    >
      {/* Alert Header */}
      <Box className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-6 relative">
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 16, top: 16, color: 'white' }}
        >
          <X className="w-6 h-6" />
        </IconButton>
        <Box className="flex items-center gap-3 mb-2">
          <Box className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
            <AlertTriangle className="w-7 h-7 text-white" />
          </Box>
          <Box>
            <Typography variant="h5" className="font-bold tracking-tight">
              Medical Emergency Warning
            </Typography>
            <Typography variant="body2" className="text-red-100 font-medium">
              If you are facing severe, life-threatening symptoms, seek immediate emergency care.
            </Typography>
          </Box>
        </Box>

        {activeSymptom && (
          <Box className="mt-3 p-3 rounded-lg bg-black/20 border border-white/20 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-300 flex-shrink-0" />
            <Typography variant="body2" className="text-white text-sm">
              <strong>High Urgency Trigger:</strong> "{activeSymptom}" was detected. Do not delay emergency response.
            </Typography>
          </Box>
        )}
      </Box>

      <DialogContent sx={{ p: 4 }}>
        <Typography variant="subtitle1" className="font-bold text-gray-900 dark:text-gray-100 mb-3">
          Immediate One-Click Emergency Hotlines:
        </Typography>

        <Grid container spacing={2} className="mb-6">
          {emergencyContacts.map((contact, idx) => (
            <Grid item xs={12} sm={6} key={idx}>
              <Card
                className="hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-800"
                sx={{ borderRadius: 3 }}
              >
                <CardContent className="p-4">
                  <Box className="flex items-start justify-between">
                    <Box>
                      <Typography variant="subtitle2" className="font-semibold text-gray-800 dark:text-gray-200">
                        {contact.title}
                      </Typography>
                      <Typography variant="caption" className="text-gray-500 dark:text-gray-400 block mb-2">
                        {contact.sub}
                      </Typography>
                      <Typography variant="h5" className="font-black text-red-600 dark:text-red-400">
                        {contact.number}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      href={contact.action}
                      startIcon={<PhoneCall className="w-4 h-4" />}
                      sx={{
                        backgroundColor: '#DC2626',
                        '&:hover': { backgroundColor: '#B91C1C' },
                        borderRadius: 2,
                        py: 1,
                        px: 2,
                      }}
                    >
                      Call Now
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Warning Signs Checklist */}
        <Box className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 mb-6">
          <Typography variant="subtitle2" className="font-bold text-red-900 dark:text-red-200 flex items-center gap-2 mb-2">
            <HeartPulse className="w-4 h-4" /> Go to the nearest Emergency Room (ER) immediately if experiencing:
          </Typography>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-red-800 dark:text-red-300 ml-4 list-disc">
            <li>Sudden chest pain, pressure, or tightness radiating to arm/jaw</li>
            <li>Sudden weakness, facial drooping, or speech difficulty (Stroke signs)</li>
            <li>Severe unexplained shortness of breath or inability to breathe</li>
            <li>Loss of consciousness, severe head trauma, or seizures</li>
            <li>Uncontrolled bleeding or severe sudden abdominal agony</li>
            <li>Severe allergic reaction with lip/throat swelling (Anaphylaxis)</li>
          </ul>
        </Box>

        <Box className="flex flex-col sm:flex-row gap-3 justify-end items-center">
          <Button
            variant="outlined"
            onClick={onClose}
            startIcon={<HelpCircle className="w-4 h-4" />}
            sx={{ borderRadius: 2 }}
          >
            I Understand, Continue Chat
          </Button>
          <Button
            variant="contained"
            onClick={handleHospitalNavigate}
            startIcon={<MapPin className="w-4 h-4" />}
            sx={{
              background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
              borderRadius: 2,
              px: 3,
            }}
          >
            Find Nearest Emergency Room
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
