import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Avatar,
  Rating,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

const DoctorCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[4],
  },
}));

const AvailabilityChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.success.light,
  color: 'white',
  '&:hover': {
    backgroundColor: theme.palette.success.main,
  },
}));

const VideoConsult = () => {
  const theme = useTheme();
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);

  const doctors = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialty: 'General Physician',
      experience: '15 years',
      rating: 4.8,
      reviews: 128,
      image: 'https://source.unsplash.com/random/400x300?doctor',
      availability: 'Available Now',
      languages: ['English', 'Spanish'],
      fee: '$50',
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialty: 'Cardiologist',
      experience: '12 years',
      rating: 4.9,
      reviews: 256,
      image: 'https://source.unsplash.com/random/400x300?physician',
      availability: 'Next: 2:30 PM',
      languages: ['English', 'Mandarin'],
      fee: '$75',
    },
    {
      id: 3,
      name: 'Dr. Emily Rodriguez',
      specialty: 'Pediatrician',
      experience: '10 years',
      rating: 4.7,
      reviews: 189,
      image: 'https://source.unsplash.com/random/400x300?pediatrician',
      availability: 'Available Now',
      languages: ['English', 'Spanish'],
      fee: '$60',
    },
    {
      id: 4,
      name: 'Dr. James Wilson',
      specialty: 'Dermatologist',
      experience: '18 years',
      rating: 4.9,
      reviews: 312,
      image: 'https://source.unsplash.com/random/400x300?dermatologist',
      availability: 'Next: 3:00 PM',
      languages: ['English'],
      fee: '$65',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h3" component="h1" gutterBottom>
            Video Consultations
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Connect with experienced healthcare professionals from the comfort of your home
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<VideoCallIcon />}
              sx={{
                backgroundColor: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              Start Consultation
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<AccessTimeIcon />}
            >
              Schedule Later
            </Button>
          </Box>
        </motion.div>
      </Box>

      <Grid container spacing={4}>
        {doctors.map((doctor, index) => (
          <Grid item xs={12} sm={6} md={3} key={doctor.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <DoctorCard>
                <CardMedia
                  component="img"
                  height="200"
                  image={doctor.image}
                  alt={doctor.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        mr: 1,
                      }}
                    >
                      <LocalHospitalIcon />
                    </Avatar>
                    <Typography variant="h6" component="h2">
                      {doctor.name}
                    </Typography>
                  </Box>
                  <Typography color="text.secondary" gutterBottom>
                    {doctor.specialty}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating
                      value={doctor.rating}
                      precision={0.1}
                      readOnly
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      ({doctor.reviews} reviews)
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    {doctor.languages.map((lang) => (
                      <Chip
                        key={lang}
                        label={lang}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="primary">
                      {doctor.fee}
                    </Typography>
                    <AvailabilityChip
                      label={doctor.availability}
                      icon={<AccessTimeIcon />}
                    />
                  </Box>
                </CardContent>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => setSelectedDoctor(doctor.id)}
                    sx={{
                      backgroundColor: selectedDoctor === doctor.id
                        ? theme.palette.primary.dark
                        : theme.palette.primary.main,
                    }}
                  >
                    {selectedDoctor === doctor.id ? 'Selected' : 'Select Doctor'}
                  </Button>
                </Box>
              </DoctorCard>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Why Choose Video Consultations?
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Box sx={{ p: 3 }}>
                <AccessTimeIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Convenience
                </Typography>
                <Typography color="text.secondary">
                  Consult with doctors from anywhere, anytime
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
                <StarIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Quality Care
                </Typography>
                <Typography color="text.secondary">
                  Access to experienced healthcare professionals
                </Typography>
              </Box>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Box sx={{ p: 3 }}>
                <LocalHospitalIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Follow-up Care
                </Typography>
                <Typography color="text.secondary">
                  Easy access to follow-up consultations
                </Typography>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default VideoConsult; 