import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  Snackbar,
  Alert,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { KeyRound, CheckCircle2, ArrowLeft } from 'lucide-react';
import { authService } from '../services/authService';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');

    try {
      const res = await authService.forgotPassword(email);
      setSuccessMessage(res.message || 'Password reset instructions have been dispatched.');
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newPassword) {
      setError('Please provide the reset token and your new password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await authService.resetPassword(token.trim(), newPassword);
      setSuccessMessage(res.message || 'Password successfully updated.');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Password reset token is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" className="py-16">
      <Paper
        elevation={0}
        className="glass-card rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 space-y-6"
      >
        <Box className="text-center space-y-2">
          <Box className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
            <KeyRound className="w-6 h-6" />
          </Box>
          <Typography variant="h5" className="font-extrabold text-gray-900 dark:text-white">
            {step === 1 ? 'Reset Password' : 'Enter Reset Token'}
          </Typography>
          <Typography variant="body2" className="text-gray-400 text-xs">
            {step === 1
              ? 'Enter your registered email to receive a secure recovery token'
              : `Enter the recovery token issued for ${email} and choose a new password`}
          </Typography>
        </Box>

        {step === 1 ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <TextField
              required
              fullWidth
              type="email"
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex.rivera@example.com"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                borderRadius: 2.5,
                fontWeight: 'bold',
                py: 1.3,
              }}
            >
              {loading ? 'Requesting...' : 'Send Recovery Token'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <TextField
              required
              fullWidth
              label="Recovery Token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste 64-character token"
            />
            <TextField
              required
              fullWidth
              type="password"
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 8 characters"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={<CheckCircle2 className="w-4 h-4" />}
              sx={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                borderRadius: 2.5,
                fontWeight: 'bold',
                py: 1.3,
              }}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        )}

        <Box className="text-center pt-2">
          <Link
            component={RouterLink}
            to="/login"
            className="text-xs text-gray-500 hover:text-emerald-600 font-semibold inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </Box>
      </Paper>

      <Snackbar open={!!error} autoHideDuration={5000} onClose={() => setError('')}>
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!successMessage} autoHideDuration={4000} onClose={() => setSuccessMessage('')}>
        <Alert severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ForgotPassword;