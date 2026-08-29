import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  User,
  Heart,
  Calendar,
  Pill,
  Shield,
  Phone,
  Mail,
  MapPin,
  Edit,
  Plus,
  Trash2,
  Video,
  Download,
  AlertCircle,
  Clock,
  X,
  Check,
  Building,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppointments } from '../context/AppointmentContext';
import { VitalsChart } from '../components/VitalsChart';
import { PrescriptionModal } from '../components/PrescriptionModal';

export const Profile: React.FC = () => {
  const { user, updateProfile, switchDemoUser } = useAuth();
  const { appointments, cancelAppointment } = useAppointments();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddAllergyOpen, setIsAddAllergyOpen] = useState(false);
  const [newAllergy, setNewAllergy] = useState('');
  const [selectedRx, setSelectedRx] = useState<any>(null);
  const [rxModalOpen, setRxModalOpen] = useState(false);

  // Edit profile form state
  const [editForm, setEditForm] = useState({
    name: user?.name || 'Alex Rivera',
    email: user?.email || 'alex.rivera@example.com',
    phone: user?.phone || '+1 (555) 234-5678',
    location: user?.location || 'San Francisco, CA',
    bloodGroup: user?.bloodGroup || 'A+',
    height: user?.height || '178 cm',
    weight: user?.weight || '72 kg',
  });

  const handleSaveProfile = () => {
    updateProfile(editForm);
    setIsEditProfileOpen(false);
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      const current = user?.allergies || [];
      updateProfile({ allergies: [...current, newAllergy.trim()] });
      setNewAllergy('');
      setIsAddAllergyOpen(false);
    }
  };

  const handleRemoveAllergy = (allergy: string) => {
    const current = user?.allergies || [];
    updateProfile({ allergies: current.filter((a) => a !== allergy) });
  };

  const upcomingApts = appointments.filter((a) => a.status === 'upcoming');
  const pastApts = appointments.filter((a) => a.status === 'completed');

  return (
    <Container maxWidth="xl" className="py-8 space-y-8">
      {/* Patient Header Card */}
      <Paper
        elevation={0}
        className="glass-card rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-emerald-500/15 via-teal-500/10 to-transparent rounded-full blur-3xl -z-10" />

        <Box className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <Box className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <Avatar
              src={user?.avatar}
              alt={user?.name}
              sx={{
                width: 96,
                height: 96,
                border: '4px solid #10B981',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
              }}
            />
            <Box className="space-y-1">
              <Box className="flex items-center gap-2">
                <Typography variant="h4" className="font-black text-gray-900 dark:text-white">
                  {user?.name || 'Alex Rivera'}
                </Typography>
                <Chip
                  label={user?.role === 'doctor' ? 'Verified Physician' : 'Patient ID: DR-84920'}
                  size="small"
                  sx={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#059669', fontWeight: 700 }}
                />
              </Box>
              <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                {user?.role === 'doctor' ? user?.specialty : 'Member since 2023 • Comprehensive Health Plan'}
              </Typography>
              <Box className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400 pt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-emerald-500" /> {user?.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-cyan-500" /> {user?.phone || '+1 (555) 234-5678'}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" /> {user?.location || 'San Francisco, CA'}
                </span>
              </Box>
            </Box>
          </Box>

          <Box className="flex flex-wrap items-center gap-2">
            <Button
              variant="outlined"
              onClick={() => setIsEditProfileOpen(true)}
              startIcon={<Edit className="w-4 h-4" />}
              sx={{ borderRadius: 2.5, fontWeight: 600 }}
            >
              Edit Profile
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate('/video-consult')}
              startIcon={<Video className="w-4 h-4" />}
              sx={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                borderRadius: 2.5,
                fontWeight: 700,
              }}
            >
              Consult Doctor
            </Button>
          </Box>
        </Box>

        {/* Quick Health Stats Pills */}
        <Grid container spacing={2} className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          {[
            { label: 'Blood Group', value: user?.bloodGroup || 'A+', sub: 'Rh Positive' },
            { label: 'Height / Weight', value: `${user?.height || '178 cm'} / ${user?.weight || '72 kg'}`, sub: 'BMI: 22.7 (Normal)' },
            { label: 'Chronic Conditions', value: user?.chronicConditions?.join(', ') || 'Mild Asthma', sub: 'Managed' },
            {
              label: 'Emergency Contact',
              value: user?.emergencyContact?.name || 'Elena Rivera',
              sub: user?.emergencyContact?.phone || '+1 (555) 987-6543',
            },
          ].map((stat, idx) => (
            <Grid item xs={6} md={3} key={idx}>
              <Box className="p-3 rounded-2xl bg-gray-50/80 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <Typography variant="caption" className="text-gray-400 font-bold uppercase text-[10px] block">
                  {stat.label}
                </Typography>
                <Typography variant="subtitle2" className="font-extrabold text-gray-800 dark:text-gray-200 truncate">
                  {stat.value}
                </Typography>
                <Typography variant="caption" className="text-emerald-600 dark:text-emerald-400 text-[11px] block">
                  {stat.sub}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Tabs Navigation: Vitals, Appointments, Health Records & Prescriptions */}
      <Box className="border-b border-gray-200 dark:border-gray-800">
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
            },
            '& .Mui-selected': {
              color: '#10B981',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#10B981',
              height: 3,
              borderRadius: 3,
            },
          }}
        >
          <Tab icon={<Heart className="w-4 h-4" />} iconPosition="start" label="Health Vitals & Trends" />
          <Tab
            icon={<Calendar className="w-4 h-4" />}
            iconPosition="start"
            label={`Appointments (${upcomingApts.length})`}
          />
          <Tab icon={<Pill className="w-4 h-4" />} iconPosition="start" label="Prescriptions & Meds" />
          <Tab icon={<Shield className="w-4 h-4" />} iconPosition="start" label="Allergies & Medical History" />
        </Tabs>
      </Box>

      {/* TAB 0: Vitals Dashboard */}
      {activeTab === 0 && (
        <Box className="space-y-6">
          <VitalsChart />
        </Box>
      )}

      {/* TAB 1: Appointments Manager */}
      {activeTab === 1 && (
        <Box className="space-y-6">
          <Box className="flex justify-between items-center">
            <Typography variant="h5" className="font-extrabold text-gray-900 dark:text-white">
              Upcoming Telehealth Appointments
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/video-consult')}
              startIcon={<Plus className="w-4 h-4" />}
              sx={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                fontWeight: 'bold',
                borderRadius: 2,
              }}
            >
              Book New Appointment
            </Button>
          </Box>

          {upcomingApts.length > 0 ? (
            <Grid container spacing={3}>
              {upcomingApts.map((apt) => (
                <Grid item xs={12} md={6} key={apt.id}>
                  <Card
                    elevation={0}
                    className="glass-card rounded-3xl p-5 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all"
                  >
                    <Box className="flex items-start gap-4 mb-4">
                      <Avatar
                        src={apt.doctorImage}
                        alt={apt.doctorName}
                        sx={{ width: 64, height: 64, border: '2px solid #10B981' }}
                      />
                      <Box className="flex-1">
                        <Box className="flex justify-between items-start">
                          <Typography variant="subtitle1" className="font-bold text-gray-900 dark:text-white">
                            {apt.doctorName}
                          </Typography>
                          <Chip
                            label="Upcoming"
                            size="small"
                            sx={{ backgroundColor: '#10B981', color: 'white', fontWeight: 'bold' }}
                          />
                        </Box>
                        <Typography variant="caption" className="text-emerald-600 font-semibold block">
                          {apt.doctorSpecialty}
                        </Typography>
                        <Box className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1 font-semibold text-gray-800 dark:text-gray-200">
                            <Clock className="w-3.5 h-3.5 text-emerald-500" /> {apt.date} at {apt.time}
                          </span>
                          <span>•</span>
                          <span className="uppercase font-bold text-cyan-600">{apt.type} Consult</span>
                        </Box>
                      </Box>
                    </Box>

                    <Box className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-xs text-gray-600 dark:text-gray-300 mb-4">
                      <strong>Reason:</strong> {apt.reason}
                    </Box>

                    <Box className="flex items-center gap-2">
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => navigate(`/video-consult?room=${apt.meetingRoomId}`)}
                        startIcon={<Video className="w-4 h-4" />}
                        sx={{
                          background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
                          borderRadius: 2,
                          fontWeight: 'bold',
                        }}
                      >
                        Join Video Room
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => cancelAppointment(apt.id)}
                        sx={{ borderRadius: 2, fontWeight: 600 }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper elevation={0} className="glass-card rounded-3xl p-12 text-center text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <Typography variant="h6" className="font-bold text-gray-700 dark:text-gray-300">
                No Upcoming Appointments
              </Typography>
              <Typography variant="body2" className="text-gray-400 max-w-sm mx-auto mt-1 mb-4">
                Schedule a consultation with our verified medical staff whenever you need care.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/video-consult')}
                startIcon={<Video className="w-4 h-4" />}
                sx={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  borderRadius: 2,
                  fontWeight: 'bold',
                }}
              >
                Find a Doctor
              </Button>
            </Paper>
          )}

          {/* Past Appointments */}
          {pastApts.length > 0 && (
            <Box className="mt-8 space-y-4">
              <Typography variant="h6" className="font-bold text-gray-800 dark:text-gray-200">
                Past Consultations & Medical Summaries
              </Typography>
              <Grid container spacing={3}>
                {pastApts.map((apt) => (
                  <Grid item xs={12} md={6} key={apt.id}>
                    <Card elevation={0} className="glass-card rounded-3xl p-4 border border-gray-200 dark:border-gray-800">
                      <Box className="flex justify-between items-start mb-2">
                        <Box>
                          <Typography variant="subtitle2" className="font-bold">
                            {apt.doctorName}
                          </Typography>
                          <Typography variant="caption" className="text-gray-400">
                            {apt.doctorSpecialty} • {apt.date}
                          </Typography>
                        </Box>
                        <Chip label="Completed" size="small" color="default" />
                      </Box>
                      {apt.notes && (
                        <Typography variant="body2" className="text-xs text-gray-600 dark:text-gray-300 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 mb-3">
                          {apt.notes}
                        </Typography>
                      )}
                      {apt.prescription && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setSelectedRx({
                              doctorName: apt.doctorName,
                              doctorSpecialty: apt.doctorSpecialty,
                              patientName: user?.name || 'Alex Rivera',
                              date: apt.date,
                              diagnosis: apt.prescription?.diagnosis || 'General Clinical Review',
                              medicines: apt.prescription?.medicines || [],
                              advice: apt.prescription?.advice || '',
                            });
                            setRxModalOpen(true);
                          }}
                          startIcon={<Download className="w-3.5 h-3.5" />}
                          sx={{ borderRadius: 2 }}
                        >
                          View Prescription PDF
                        </Button>
                      )}
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      )}

      {/* TAB 2: Prescriptions & Meds */}
      {activeTab === 2 && (
        <Box className="space-y-6">
          <Box className="flex justify-between items-center">
            <Typography variant="h5" className="font-extrabold text-gray-900 dark:text-white">
              Active Prescriptions & Medication Wallet
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {user?.medications?.map((med) => (
              <Grid item xs={12} md={6} key={med.id}>
                <Card elevation={0} className="glass-card rounded-3xl p-5 border border-gray-200 dark:border-gray-800">
                  <Box className="flex items-start justify-between mb-3">
                    <Box className="flex items-center gap-3">
                      <Box className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                        <Pill className="w-6 h-6" />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" className="font-bold text-gray-900 dark:text-white">
                          {med.name}
                        </Typography>
                        <Typography variant="caption" className="text-emerald-600 font-semibold block">
                          Dosage: {med.dosage}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip label="Active" size="small" sx={{ backgroundColor: '#10B981', color: 'white', fontWeight: 700 }} />
                  </Box>

                  <Box className="space-y-1 text-xs text-gray-600 dark:text-gray-300 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40">
                    <Box className="flex justify-between">
                      <span className="text-gray-400">Frequency:</span>
                      <span className="font-semibold">{med.frequency}</span>
                    </Box>
                    <Box className="flex justify-between">
                      <span className="text-gray-400">Prescribing MD:</span>
                      <span className="font-semibold">{med.prescribedBy}</span>
                    </Box>
                    <Box className="flex justify-between">
                      <span className="text-gray-400">Prescribed On:</span>
                      <span className="font-semibold">{med.startDate}</span>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* TAB 3: Allergies & History */}
      {activeTab === 3 && (
        <Box className="space-y-6">
          <Paper elevation={0} className="glass-card rounded-3xl p-6 border border-gray-200 dark:border-gray-800 space-y-4">
            <Box className="flex justify-between items-center">
              <Box>
                <Typography variant="h6" className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-500" /> Recorded Allergies & Sensitivities
                </Typography>
                <Typography variant="caption" className="text-gray-400">
                  Shared securely with consulting physicians during triage and prescription writing.
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setIsAddAllergyOpen(true)}
                startIcon={<Plus className="w-4 h-4" />}
                sx={{ borderRadius: 2 }}
              >
                Add Allergy
              </Button>
            </Box>

            <Box className="flex flex-wrap gap-2 pt-2">
              {user?.allergies?.map((allergy) => (
                <Chip
                  key={allergy}
                  label={allergy}
                  onDelete={() => handleRemoveAllergy(allergy)}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 700,
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    color: '#EF4444',
                  }}
                />
              ))}
            </Box>
          </Paper>
        </Box>
      )}

      {/* Edit Profile Modal */}
      <Dialog
        open={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: (theme) => (theme.palette.mode === 'dark' ? '#0F172A' : '#FFFFFF'),
          },
        }}
      >
        <DialogTitle className="font-bold flex justify-between items-center">
          Edit Personal Medical Profile
          <IconButton size="small" onClick={() => setIsEditProfileOpen(false)}>
            <X className="w-5 h-5" />
          </IconButton>
        </DialogTitle>
        <DialogContent className="space-y-4 pt-2">
          <TextField
            fullWidth
            label="Full Name"
            size="small"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />
          <TextField
            fullWidth
            label="Email"
            size="small"
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
          />
          <TextField
            fullWidth
            label="Phone"
            size="small"
            value={editForm.phone}
            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
          />
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Blood Group"
                size="small"
                value={editForm.bloodGroup}
                onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Height"
                size="small"
                value={editForm.height}
                onChange={(e) => setEditForm({ ...editForm, height: e.target.value })}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Weight"
                size="small"
                value={editForm.weight}
                onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
              />
            </Grid>
          </Grid>
          <TextField
            fullWidth
            label="City / Location"
            size="small"
            value={editForm.location}
            onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleSaveProfile}
            startIcon={<Check className="w-4 h-4" />}
            sx={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              fontWeight: 'bold',
              borderRadius: 2,
              mt: 2,
            }}
          >
            Save Profile Changes
          </Button>
        </DialogContent>
      </Dialog>

      {/* Add Allergy Modal */}
      <Dialog
        open={isAddAllergyOpen}
        onClose={() => setIsAddAllergyOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: (theme) => (theme.palette.mode === 'dark' ? '#0F172A' : '#FFFFFF'),
          },
        }}
      >
        <DialogTitle className="font-bold">Add Known Allergy</DialogTitle>
        <DialogContent className="space-y-4 pt-2">
          <TextField
            fullWidth
            label="Allergen Name"
            placeholder="e.g. Sulfa drugs, Latex, Shellfish..."
            size="small"
            value={newAllergy}
            onChange={(e) => setNewAllergy(e.target.value)}
          />
          <Button
            fullWidth
            variant="contained"
            onClick={handleAddAllergy}
            sx={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              fontWeight: 'bold',
              borderRadius: 2,
            }}
          >
            Add to Medical Record
          </Button>
        </DialogContent>
      </Dialog>

      {/* Prescription PDF Modal */}
      {selectedRx && (
        <PrescriptionModal
          open={rxModalOpen}
          onClose={() => setRxModalOpen(false)}
          data={selectedRx}
        />
      )}
    </Container>
  );
};

export default Profile;