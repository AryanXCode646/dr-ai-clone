import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  useTheme,
  Paper,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Chat as ChatIcon,
  VideoCall as VideoCallIcon,
  LocalHospital as HospitalIcon,
  Language as LanguageIcon,
  MedicalServices as MedicalServicesIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const Home: React.FC = () => {
  const theme = useTheme();

  const features = [
    {
      title: 'AI Health Chat',
      description: 'Get instant answers to your health-related questions from our AI assistant.',
      icon: <ChatIcon sx={{ fontSize: 40 }} />,
      path: '/chat',
    },
    {
      title: 'Video Consultation',
      description: 'Connect with healthcare professionals through secure video calls.',
      icon: <VideoCallIcon sx={{ fontSize: 40 }} />,
      path: '/services',
    },
    {
      title: 'Find Hospitals',
      description: 'Locate nearby hospitals and emergency care centers.',
      icon: <HospitalIcon sx={{ fontSize: 40 }} />,
      path: '/services',
    },
  ];

  const stats = [
    {
      number: '38',
      label: 'LANGUAGES',
      description: 'Multilingual Support',
    },
    {
      number: '12',
      label: 'SUBSPECIALTIES',
      description: 'Across 12 Medical Specialties',
    },
    {
      number: '95/100',
      label: 'Score',
      description: 'Mean Diagnostic Accuracy Score',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 12,
          mb: 6,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h1"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  lineHeight: 1.2,
                }}
              >
                Borderless Empowering Healthcare Professionals
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                Seamlessly integrate inpatient and outpatient care with AI-powered solutions
              </Typography>
              <Button
                component={Link}
                to="/chat"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
                }}
              >
                Free Start
              </Button>
            </Grid>
          </Grid>
        </Container>
      </MotionBox>

      {/* Stats Section */}
      <Container sx={{ mb: 8 }}>
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={12} md={4} key={index}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 3,
                  borderRadius: 2,
                  boxShadow: 3,
                }}
              >
                <Typography
                  variant="h2"
                  component="div"
                  sx={{ color: 'primary.main', fontWeight: 700, mb: 1 }}
                >
                  {stat.number}
                </Typography>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  {stat.label}
                </Typography>
                <Typography color="text.secondary">
                  {stat.description}
                </Typography>
              </MotionCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{ textAlign: 'center', mb: 6, fontWeight: 700 }}
          >
            A New Dawn in Medical Care
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <MotionCard
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
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
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                    <Box sx={{ color: 'primary.main', mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography gutterBottom variant="h5" component="h3" sx={{ fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography color="text.secondary" paragraph>
                      {feature.description}
                    </Typography>
                    <Button
                      component={Link}
                      to={feature.path}
                      variant="outlined"
                      color="primary"
                      sx={{ mt: 2 }}
                    >
                      Learn More
                    </Button>
                  </CardContent>
                </MotionCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 