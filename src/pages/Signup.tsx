import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  Grid,
  Snackbar,
  Alert,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Activity,
  UserPlus,
  ShieldCheck,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Signup: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '1995-05-15',
    bloodGroup: 'O+',
  });
  const [agreed, setAgreed] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!agreed) {
      setError('Please agree to the Telehealth Consent and Terms');
      return;
    }

    const res = await signup({
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      dateOfBirth: formData.dateOfBirth,
      bloodGroup: formData.bloodGroup,
    });

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/profile');
      }, 800);
    } else {
      setError(res.error || 'Failed to create account');
    }
  };

  return (
    <Container maxWidth="sm" className="py-10">
      <Paper
        elevation={0}
        className="glass-card rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 space-y-6"
      >
        <Box className="text-center space-y-1">
          <Box className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 mb-2">
            <Activity className="w-7 h-7 text-white" />
          </Box>
          <Typography variant="h5" className="font-extrabold text-gray-900 dark:text-white">
            Create Your Health Profile
          </Typography>
          <Typography variant="body2" className="text-gray-400 text-xs">
            Join Dr.AI for 24/7 AI clinical triage and on-demand video telehealth
          </Typography>
        </Box>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                size="small"
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                size="small"
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                size="small"
                type="email"
                label="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                size="small"
                type="date"
                label="Date of Birth"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                size="small"
                label="Blood Group"
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <MenuItem key={bg} value={bg}>
                    {bg}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                size="small"
                type="password"
                label="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                size="small"
                type="password"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </Grid>
          </Grid>

          <FormControlLabel
            control={
              <Checkbox
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                sx={{ color: '#10B981', '&.Mui-checked': { color: '#10B981' } }}
              />
            }
            label={
              <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                I agree to the <strong>Telehealth Informed Consent</strong> and <strong>HIPAA Privacy Policy</strong>.
              </Typography>
            }
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            startIcon={<UserPlus className="w-4 h-4" />}
            sx={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              borderRadius: 2.5,
              fontWeight: 'bold',
              py: 1.3,
            }}
          >
            Create Free Account
          </Button>
        </form>

        <Box className="text-center pt-2 text-xs text-gray-500">
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" className="text-emerald-600 font-bold hover:underline">
            Sign in
          </Link>
        </Box>
      </Paper>

      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')}>
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
        <Alert severity="success" sx={{ width: '100%' }}>
          Account created successfully! Preparing your health dashboard...
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Signup;