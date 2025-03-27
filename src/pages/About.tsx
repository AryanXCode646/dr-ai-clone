import React from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  SmartToy as AIIcon,
  Security as SecurityIcon,
  People as PeopleIcon,
  EmojiObjects as InnovationIcon,
} from '@mui/icons-material';

const features = [
  {
    icon: <AIIcon sx={{ fontSize: 40 }} />,
    title: 'AI-Powered Healthcare',
    description: 'Our advanced AI technology provides instant, accurate health information and assistance.',
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 40 }} />,
    title: 'Secure & Private',
    description: 'Your health data is protected with industry-leading security measures and encryption.',
  },
  {
    icon: <PeopleIcon sx={{ fontSize: 40 }} />,
    title: 'Expert Support',
    description: 'Connect with qualified healthcare professionals for personalized care.',
  },
  {
    icon: <InnovationIcon sx={{ fontSize: 40 }} />,
    title: 'Innovative Solutions',
    description: 'Cutting-edge technology to make healthcare more accessible and efficient.',
  },
];

const About: React.FC = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Hero Section */}
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
          About MediAI
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
          Revolutionizing healthcare through artificial intelligence and innovative technology
        </Typography>
      </Box>

      {/* Mission Statement */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 8,
          background: `linear-gradient(45deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
          color: 'white',
        }}
      >
        <Typography variant="h4" gutterBottom>
          Our Mission
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
          At MediAI, we're committed to making healthcare more accessible, efficient, and personalized
          through the power of artificial intelligence. Our platform combines cutting-edge technology
          with human expertise to provide comprehensive healthcare solutions for everyone.
        </Typography>
      </Paper>

      {/* Features Grid */}
      <Grid container spacing={4} sx={{ mb: 8 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Box
              sx={{
                textAlign: 'center',
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  width: 80,
                  height: 80,
                  mb: 2,
                }}
              >
                {feature.icon}
              </Avatar>
              <Typography variant="h6" gutterBottom>
                {feature.title}
              </Typography>
              <Typography color="text.secondary">
                {feature.description}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Story Section */}
      <Grid container spacing={4} alignItems="center">
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>
            Our Story
          </Typography>
          <Typography paragraph>
            Founded in 2024, MediAI emerged from a vision to transform healthcare delivery
            through technology. We recognized the growing need for accessible healthcare
            solutions and the potential of AI to address these challenges.
          </Typography>
          <Typography paragraph>
            Today, we're proud to serve thousands of users, providing them with instant
            access to health information, connecting them with healthcare professionals,
            and helping them manage their health more effectively.
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box
            component="img"
            src="/images/about-story.jpg"
            alt="Our Story"
            sx={{
              width: '100%',
              height: 'auto',
              borderRadius: 2,
              boxShadow: 3,
            }}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default About; 