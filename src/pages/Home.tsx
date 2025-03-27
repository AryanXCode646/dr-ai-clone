import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SecurityIcon from '@mui/icons-material/Security';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';

const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: 'white',
  padding: theme.spacing(15, 0),
  textAlign: 'center',
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(8),
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
  },
}));

const StatsCard = styled(Card)(({ theme }) => ({
  background: theme.palette.background.paper,
  textAlign: 'center',
  padding: theme.spacing(3),
}));

const Home = () => {
  const theme = useTheme();

  const features = [
    {
      icon: <SmartToyIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'AI Health Assistant',
      description: 'Get instant health insights and recommendations from our advanced AI system.',
    },
    {
      icon: <VideoCallIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Expert Video Consultations',
      description: 'Connect with experienced healthcare professionals from the comfort of your home.',
    },
    {
      icon: <AccessTimeIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: '24/7 Medical Support',
      description: 'Access healthcare services round the clock, whenever you need them.',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'HIPAA Compliant',
      description: 'Your health data is protected with industry-standard security measures.',
    },
  ];

  const stats = [
    { number: '10M+', label: 'Patients Served' },
    { number: '500+', label: 'Licensed Doctors' },
    { number: '24/7', label: 'Availability' },
    { number: '98%', label: 'Patient Satisfaction' },
  ];

  return (
    <Box>
      <HeroSection>
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography variant="h2" component="h1" gutterBottom>
              Your Health, Our Priority
            </Typography>
            <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
              Experience the future of healthcare with AI-powered medical assistance
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                backgroundColor: 'white',
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
              }}
            >
              Start Your Health Journey
            </Button>
          </motion.div>
        </Container>
      </HeroSection>

      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <FeatureCard>
                  <CardContent sx={{ textAlign: 'center' }}>
                    {feature.icon}
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      {feature.title}
                    </Typography>
                    <Typography color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </FeatureCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ my: 8 }}>
          <Typography variant="h3" component="h2" gutterBottom align="center">
            Our Impact
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <StatsCard>
                    <Typography variant="h3" color="primary" gutterBottom>
                      {stat.number}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </StatsCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ my: 8, textAlign: 'center' }}>
          <Typography variant="h3" component="h2" gutterBottom>
            How It Works
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Box sx={{ p: 3 }}>
                  <HealthAndSafetyIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
                  <Typography variant="h5" gutterBottom>
                    1. AI Health Assessment
                  </Typography>
                  <Typography color="text.secondary">
                    Get an instant health assessment from our AI system
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Box sx={{ p: 3 }}>
                  <VerifiedUserIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
                  <Typography variant="h5" gutterBottom>
                    2. Expert Review
                  </Typography>
                  <Typography color="text.secondary">
                    Our healthcare professionals review your assessment
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Box sx={{ p: 3 }}>
                  <LocalHospitalIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
                  <Typography variant="h5" gutterBottom>
                    3. Comprehensive Care
                  </Typography>
                  <Typography color="text.secondary">
                    Receive personalized treatment and follow-up care
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Home; 