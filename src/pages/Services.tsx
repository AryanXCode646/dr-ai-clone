import React from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  useTheme,
} from '@mui/material';
import {
  Chat as ChatIcon,
  VideoCall as VideoCallIcon,
  LocalHospital as HospitalIcon,
  Psychology as PsychologyIcon,
  Medication as MedicationIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';

const services = [
  {
    title: 'AI Health Chat',
    description: 'Get instant answers to your health-related questions from our AI assistant.',
    icon: <ChatIcon sx={{ fontSize: 40 }} />,
    color: '#2196f3',
  },
  {
    title: 'Video Consultation',
    description: 'Connect with healthcare professionals through secure video calls.',
    icon: <VideoCallIcon sx={{ fontSize: 40 }} />,
    color: '#4caf50',
  },
  {
    title: 'Hospital Finder',
    description: 'Find nearby hospitals and emergency care centers.',
    icon: <HospitalIcon sx={{ fontSize: 40 }} />,
    color: '#f44336',
  },
  {
    title: 'Mental Health Support',
    description: 'Access mental health resources and professional counseling.',
    icon: <PsychologyIcon sx={{ fontSize: 40 }} />,
    color: '#9c27b0',
  },
  {
    title: 'Medication Reminder',
    description: 'Set up reminders for your medications and track your prescriptions.',
    icon: <MedicationIcon sx={{ fontSize: 40 }} />,
    color: '#ff9800',
  },
  {
    title: 'Health Records',
    description: 'Securely store and manage your medical records and test results.',
    icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
    color: '#795548',
  },
];

const Services: React.FC = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            textFillColor: 'transparent',
          }}
        >
          Our Services
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Comprehensive healthcare solutions powered by AI technology
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {services.map((service, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                },
              }}
            >
              <CardMedia
                sx={{
                  height: 200,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: service.color,
                }}
              >
                <Box sx={{ color: 'white' }}>{service.icon}</Box>
              </CardMedia>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {service.title}
                </Typography>
                <Typography color="text.secondary" paragraph>
                  {service.description}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Services; 