import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  Divider,
  Snackbar,
  Alert,
  Grid,
  Chip,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Activity,
  LogIn,
  ShieldCheck,
  User,
  Stethoscope,
  Sparkles,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const { login, switchDemoUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in your email and password');
      return;
    }

    setLoading(true);
    setError('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/profile');
      }, 800);
    } else {
      setError(res.error || 'Invalid credentials');
    }
  };

  const handleDemoPatient = () => {
    switchDemoUser('patient');
    setSuccess(true);
    setTimeout(() => {
      navigate('/profile');
    }, 500);
  };

  const handleDemoDoctor = () => {
    switchDemoUser('doctor');
    setSuccess(true);
    setTimeout(() => {
      navigate('/video-consult');
    }, 500);
  };

  return (
    <Container maxWidth="lg" className="py-12">
      <Grid container spacing={4} alignItems="center">
        {/* Left Side: Medical Branding & Trust Features */}
        <Grid item xs={12} md={6} className="hidden md:block space-y-6">
          <Box className="flex items-center gap-2.5">
            <Box className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Activity className="w-7 h-7 text-white" />
            </Box>
            <Typography variant="h4" className="font-black text-gray-900 dark:text-white">
              Dr.<span className="text-emerald-500">AI</span>
            </Typography>
          </Box>

          <Typography variant="h3" className="font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
            Intelligent Clinical Care at Your Fingertips
          </Typography>

          <Typography variant="body1" className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Sign in to access your continuous vitals telemetry, active medical prescriptions, upcoming telehealth appointments, and personalized AI diagnostics.
          </Typography>

          <Box className="space-y-3 pt-2">
            {[
              'HIPAA Safe Harbor certified encrypted records',
              'Direct encrypted video consultations with board-certified MDs',
              'AI multi-turn differential symptom assessment',
            ].map((feat, i) => (
              <Box key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>{feat}</span>
              </Box>
            ))}
          </Box>
        </Grid>

        {/* Right Side: Login Form & 1-Click Demo Logins */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            className="glass-card rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 space-y-6"
          >
            <Box className="text-center space-y-1">
              <Typography variant="h5" className="font-extrabold text-gray-900 dark:text-white">
                Welcome Back
              </Typography>
              <Typography variant="body2" className="text-gray-400">
                Sign in to your verified Dr.AI account
              </Typography>
            </Box>

            {/* 1-Click Demo Profiles */}
            <Box className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300/60 dark:border-emerald-900 space-y-2">
              <Box className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> 1-Click Instant Demo Login:
                </span>
              </Box>
              <Box className="grid grid-cols-2 gap-2">
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  onClick={handleDemoPatient}
                  startIcon={<User className="w-4 h-4 text-emerald-600" />}
                  sx={{
                    borderRadius: 2,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    backgroundColor: 'white',
                    '&:hover': { backgroundColor: '#F0FDF4' },
                  }}
                >
                  Patient Demo
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  onClick={handleDemoDoctor}
                  startIcon={<Stethoscope className="w-4 h-4 text-cyan-600" />}
                  sx={{
                    borderRadius: 2,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    backgroundColor: 'white',
                    '&:hover': { backgroundColor: '#F0FDF4' },
                  }}
                >
                  Doctor Demo
                </Button>
              </Box>
            </Box>

            <Divider className="text-xs text-gray-400">OR SIGN IN WITH EMAIL</Divider>

            <form onSubmit={handleSubmit} className="space-y-4">
              <TextField
                required
                fullWidth
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <TextField
                required
                fullWidth
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Box className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Secure 256-bit Login</span>
                <Link component={RouterLink} to="/forgot-password" className="text-emerald-600 font-semibold hover:underline">
                  Forgot password?
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={<LogIn className="w-4 h-4" />}
                sx={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  borderRadius: 2.5,
                  fontWeight: 'bold',
                  py: 1.3,
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <Box className="text-center pt-2 text-xs text-gray-500">
              Don’t have an account?{' '}
              <Link component={RouterLink} to="/signup" className="text-emerald-600 font-bold hover:underline">
                Create free account
              </Link>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')}>
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
        <Alert severity="success" sx={{ width: '100%' }}>
          Welcome back! Directing to your health portal...
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Login;