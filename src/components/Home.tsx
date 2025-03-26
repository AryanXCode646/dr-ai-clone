import React from 'react';
import { motion } from 'framer-motion';
import { Box, Container, Typography, Grid, Paper, Button, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  Language as LanguageIcon, 
  MedicalServices as MedicalServicesIcon,
  CheckCircle as CheckCircleIcon,
  VideoCall as VideoCallIcon,
  Chat as ChatIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';

const Home: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const stats = [
    { number: '38', label: 'LANGUAGES', icon: <LanguageIcon sx={{ fontSize: 40 }} /> },
    { number: '12', label: 'SUBSPECIALTIES', icon: <MedicalServicesIcon sx={{ fontSize: 40 }} /> },
    { number: '95/100', label: 'DIAGNOSTIC ACCURACY', icon: <CheckCircleIcon sx={{ fontSize: 40 }} /> }
  ];

  const features = [
    {
      title: 'For Professionals',
      items: [
        'Admission Note',
        'Progress Note',
        'Pharmacotherapy',
        'Cancer Strategy',
        'SOAP Note',
        'Nursing Note',
        'Meeting Recap',
        'Medical Scribe'
      ],
      icon: <VideoCallIcon sx={{ fontSize: 40 }} />
    },
    {
      title: 'For Individuals',
      items: [
        'Integrated Health Platform',
        'Immediate Symptom Advice',
        'Medication Guidance',
        'Custom Health Plans',
        'Dietary Advice',
        'Disease Information'
      ],
      icon: <ChatIcon sx={{ fontSize: 40 }} />
    },
    {
      title: 'Medical Exam Center',
      items: [
        'Integrated Diagnosis',
        'Custom Reports',
        'Multilingual Support',
        'Mass Report Generation',
        'Diverse Layout Options'
      ],
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />
    }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Hero Section */}
      <Box sx={{ 
        bgcolor: 'primary.main', 
        color: 'white', 
        py: 8, 
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Borderless Empowering Healthcare Professionals
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
              Dr.AI seamlessly integrates inpatient and outpatient care, addressing healthcare professionals' challenges.
            </Typography>
            <Button 
              variant="contained" 
              size="large" 
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main',
                '&:hover': { bgcolor: 'grey.100' }
              }}
              onClick={() => navigate('/chat')}
            >
              Free Start
            </Button>
          </motion.div>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  {stat.icon}
                  <Typography variant="h3" component="div" sx={{ my: 2, fontWeight: 'bold' }}>
                    {stat.number}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            A New Dawn in Medical Care
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 4, 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {feature.icon}
                      <Typography variant="h5" component="h3" sx={{ ml: 2 }}>
                        {feature.title}
                      </Typography>
                    </Box>
                    <Box component="ul" sx={{ listStyle: 'none', pl: 0 }}>
                      {feature.items.map((item, itemIndex) => (
                        <Box 
                          component="li" 
                          key={itemIndex}
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            mb: 1
                          }}
                        >
                          <CheckCircleIcon sx={{ color: 'primary.main', mr: 1 }} />
                          <Typography>{item}</Typography>
                        </Box>
                      ))}
                    </Box>
                    <Button 
                      variant="contained" 
                      sx={{ mt: 2 }}
                      onClick={() => navigate('/chat')}
                    >
                      Learn more
                    </Button>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 