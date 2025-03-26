import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 64px)',
        textAlign: 'center',
        p: 3,
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to MediConnect AI
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Your intelligent medical assistant for instant health information and guidance
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/chat')}
          sx={{ mt: 4 }}
        >
          Start Chatting
        </Button>
      </Container>
    </Box>
  );
};

export default Home; 