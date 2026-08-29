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
import { KeyRound, Mail, CheckCircle2, ArrowLeft } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setStep(2);
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 1200);
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
            {step === 1 ? 'Reset Password' : 'Enter Verification Code'}
          </Typography>
          <Typography variant="body2" className="text-gray-400 text-xs">
            {step === 1
              ? 'Enter your registered email to receive a secure recovery code'
              : `Enter the 6-digit code sent to ${email} and choose a new password`}
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
              sx={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                borderRadius: 2.5,
                fontWeight: 'bold',
                py: 1.3,
              }}
            >
              Send Recovery Code
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <TextField
              required
              fullWidth
              label="6-Digit Verification Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="849201"
            />
            <TextField
              required
              fullWidth
              type="password"
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              startIcon={<CheckCircle2 className="w-4 h-4" />}
              sx={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                borderRadius: 2.5,
                fontWeight: 'bold',
                py: 1.3,
              }}
            >
              Update Password
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

      <Snackbar open={success} autoHideDuration={4000} onClose={() => setSuccess(false)}>
        <Alert severity="success" sx={{ width: '100%' }}>
          Password successfully reset! Directing to login...
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ForgotPassword;