import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  Avatar,
  Grid,
  Chip,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Rating,
} from '@mui/material';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Phone,
  Building,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Doctor, useAppointments } from '../context/AppointmentContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  doctor: Doctor | null;
  initialReason?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  open,
  onClose,
  doctor,
  initialReason = '',
}) => {
  const { bookAppointment, startCall } = useAppointments();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState<string>('Today');
  const [selectedTime, setSelectedTime] = useState<string>('2:30 PM');
  const [consultType, setConsultType] = useState<'video' | 'audio' | 'in-person'>('video');
  const [reason, setReason] = useState<string>(initialReason);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [bookedAptId, setBookedAptId] = useState<string>('');

  React.useEffect(() => {
    if (doctor?.availableSlots?.[0]) {
      setSelectedDate(doctor.availableSlots[0].date);
      setSelectedTime(doctor.availableSlots[0].times[0] || '2:30 PM');
    }
    if (initialReason) {
      setReason(initialReason);
    }
    setIsSuccess(false);
  }, [doctor, initialReason, open]);

  if (!doctor) return null;

  const currentSlotGroup = doctor.availableSlots.find((s) => s.date === selectedDate) || doctor.availableSlots[0];

  const handleConfirmBooking = () => {
    const newApt = bookAppointment({
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      doctorImage: doctor.image,
      doctorFee: doctor.fee,
      patientName: user?.name || 'Alex Rivera',
      patientEmail: user?.email || 'patient@example.com',
      date: selectedDate,
      time: selectedTime,
      type: consultType,
      reason: reason || 'General Medical Consultation',
    });

    setBookedAptId(newApt.id);
    setIsSuccess(true);

    // Fire celebratory confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#06B6D4', '#3B82F6', '#F59E0B'],
    });
  };

  const handleStartImmediateCall = () => {
    onClose();
    navigate(`/video-consult?room=${bookedAptId || 'room-live'}`);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          background: (theme) =>
            theme.palette.mode === 'dark' ? '#0F172A' : '#FFFFFF',
          border: '1px solid rgba(16, 185, 129, 0.2)',
        },
      }}
    >
      <Box className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5 flex items-center justify-between">
        <Box className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-200" />
          <Typography variant="h6" className="font-bold">
            {isSuccess ? 'Consultation Confirmed!' : 'Book Consultation'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <X className="w-5 h-5" />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 4 }}>
        {!isSuccess ? (
          <Box className="space-y-5">
            {/* Doctor Info Banner */}
            <Box className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
              <Avatar
                src={doctor.image}
                alt={doctor.name}
                sx={{ width: 64, height: 64, border: '2px solid #10B981' }}
              />
              <Box className="flex-1">
                <Typography variant="subtitle1" className="font-bold text-gray-900 dark:text-gray-100">
                  {doctor.name}
                </Typography>
                <Typography variant="caption" className="text-emerald-600 dark:text-emerald-400 font-semibold block">
                  {doctor.specialty}
                </Typography>
                <Box className="flex items-center gap-2 mt-1">
                  <Rating value={doctor.rating} precision={0.1} readOnly size="small" />
                  <Typography variant="caption" className="text-gray-500">
                    ({doctor.reviewsCount} reviews)
                  </Typography>
                  <Typography variant="caption" className="font-bold text-emerald-600 ml-auto">
                    ${doctor.fee} / consult
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Consultation Mode */}
            <Box>
              <Typography variant="subtitle2" className="font-bold text-gray-800 dark:text-gray-200 mb-2">
                Select Consultation Type:
              </Typography>
              <Grid container spacing={1.5}>
                {[
                  { type: 'video' as const, label: 'HD Video Call', icon: <Video className="w-4 h-4 text-emerald-500" />, desc: 'Face-to-face encrypted telehealth' },
                  { type: 'audio' as const, label: 'Audio Voice Call', icon: <Phone className="w-4 h-4 text-cyan-500" />, desc: 'Direct phone / VoIP consult' },
                  { type: 'in-person' as const, label: 'Hospital Visit', icon: <Building className="w-4 h-4 text-purple-500" />, desc: doctor.hospital.split(',')[0] },
                ].map((item) => (
                  <Grid item xs={12} sm={4} key={item.type}>
                    <Box
                      onClick={() => setConsultType(item.type)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                        consultType === item.type
                          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                          : 'border-gray-200 dark:border-gray-800 hover:border-emerald-300'
                      }`}
                    >
                      <Box className="flex items-center gap-1.5 font-bold text-xs mb-1 text-gray-900 dark:text-gray-100">
                        {item.icon} {item.label}
                      </Box>
                      <Typography variant="caption" className="text-gray-500 block leading-tight text-[11px]">
                        {item.desc}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Date Selection */}
            <Box>
              <Typography variant="subtitle2" className="font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-emerald-500" /> Choose Date:
              </Typography>
              <Box className="flex gap-2 overflow-x-auto pb-1">
                {doctor.availableSlots.map((slot) => (
                  <Button
                    key={slot.date}
                    variant={selectedDate === slot.date ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => {
                      setSelectedDate(slot.date);
                      setSelectedTime(slot.times[0]);
                    }}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      whiteSpace: 'nowrap',
                      backgroundColor: selectedDate === slot.date ? '#10B981' : undefined,
                      '&:hover': {
                        backgroundColor: selectedDate === slot.date ? '#059669' : undefined,
                      },
                    }}
                  >
                    {slot.date}
                  </Button>
                ))}
              </Box>
            </Box>

            {/* Time Slot Selection */}
            <Box>
              <Typography variant="subtitle2" className="font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-500" /> Select Available Time Slot:
              </Typography>
              <Grid container spacing={1}>
                {currentSlotGroup?.times.map((time) => (
                  <Grid item xs={3} sm={3} key={time}>
                    <Button
                      fullWidth
                      variant={selectedTime === time ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => setSelectedTime(time)}
                      sx={{
                        borderRadius: 2,
                        py: 0.8,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: selectedTime === time ? '#059669' : undefined,
                      }}
                    >
                      {time}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Reason / Symptoms */}
            <Box>
              <Typography variant="subtitle2" className="font-bold text-gray-800 dark:text-gray-200 mb-1">
                Reason for Visit / Symptoms:
              </Typography>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                placeholder="e.g. Cough, mild fever for 2 days, allergy check..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Box>

            {/* Confirm Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleConfirmBooking}
              sx={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: 'white',
                fontWeight: 'bold',
                py: 1.5,
                borderRadius: 2.5,
              }}
            >
              Confirm Appointment (${doctor.fee})
            </Button>
          </Box>
        ) : (
          /* Success Screen */
          <Box className="text-center py-6 space-y-4">
            <Box className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto text-emerald-600 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </Box>
            <Typography variant="h5" className="font-bold text-gray-900 dark:text-gray-100">
              Appointment Scheduled!
            </Typography>
            <Typography variant="body2" className="text-gray-600 dark:text-gray-300 max-w-sm mx-auto">
              Your consultation with <strong>{doctor.name}</strong> is confirmed for{' '}
              <strong>{selectedDate} at {selectedTime}</strong>.
            </Typography>

            <Box className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-left max-w-sm mx-auto space-y-1.5 text-xs">
              <Box className="flex justify-between">
                <span className="text-gray-500">Doctor:</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">{doctor.name}</span>
              </Box>
              <Box className="flex justify-between">
                <span className="text-gray-500">Mode:</span>
                <span className="font-bold uppercase text-emerald-600">{consultType} Telehealth</span>
              </Box>
              <Box className="flex justify-between">
                <span className="text-gray-500">Slot:</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">{selectedDate}, {selectedTime}</span>
              </Box>
              <Box className="flex justify-between">
                <span className="text-gray-500">Patient:</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">{user?.name || 'Alex Rivera'}</span>
              </Box>
            </Box>

            <Box className="flex flex-col sm:flex-row gap-2 pt-2 justify-center">
              <Button
                variant="contained"
                onClick={handleStartImmediateCall}
                startIcon={<Video className="w-4 h-4" />}
                sx={{
                  background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
                  borderRadius: 2,
                  px: 3,
                }}
              >
                Go to Video Room Now
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  onClose();
                  navigate('/profile');
                }}
                sx={{ borderRadius: 2 }}
              >
                View in Profile
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
