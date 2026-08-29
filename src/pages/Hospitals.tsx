import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  TextField,
  MenuItem,
  Paper,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import {
  Hospital,
  MapPin,
  PhoneCall,
  Navigation,
  Clock,
  ShieldAlert,
  Search,
  CheckCircle,
  Activity,
  AlertTriangle,
  X,
} from 'lucide-react';
import { EmergencyModal } from '../components/EmergencyModal';

interface HospitalFacility {
  id: string;
  name: string;
  type: 'Trauma Center Level 1' | 'General Hospital' | 'Pediatric ER' | 'Urgent Care';
  address: string;
  distance: string;
  driveTime: string;
  erWaitTime: string;
  phone: string;
  emergencyOpen247: boolean;
  departments: string[];
  rating: number;
}

const HOSPITALS_DATA: HospitalFacility[] = [
  {
    id: 'hosp-1',
    name: 'UCSF Medical Center - Parnassus Emergency Department',
    type: 'Trauma Center Level 1',
    address: '505 Parnassus Ave, San Francisco, CA 94143',
    distance: '1.8 miles away',
    driveTime: '6 mins',
    erWaitTime: '12 mins wait',
    phone: '+1 (415) 353-1037',
    emergencyOpen247: true,
    departments: ['Emergency Trauma', 'Comprehensive Stroke Center', 'Cardiovascular ICU', 'Burn Unit'],
    rating: 4.9,
  },
  {
    id: 'hosp-2',
    name: 'Zuckerberg San Francisco General Hospital and Trauma Center',
    type: 'Trauma Center Level 1',
    address: '1001 Potrero Ave, San Francisco, CA 94110',
    distance: '2.4 miles away',
    driveTime: '9 mins',
    erWaitTime: '18 mins wait',
    phone: '+1 (628) 206-8000',
    emergencyOpen247: true,
    departments: ['24/7 Level 1 Trauma', 'Pediatric Emergency', 'Psychiatric Emergency', 'Orthopedic Surgery'],
    rating: 4.8,
  },
  {
    id: 'hosp-3',
    name: 'California Pacific Medical Center (CPMC) - Van Ness Campus',
    type: 'General Hospital',
    address: '1101 Van Ness Ave, San Francisco, CA 94109',
    distance: '3.1 miles away',
    driveTime: '11 mins',
    erWaitTime: '8 mins wait',
    phone: '+1 (415) 600-6000',
    emergencyOpen247: true,
    departments: ['Adult Emergency', 'Interventional Cardiology', 'Neurology', 'Maternity Care'],
    rating: 4.85,
  },
  {
    id: 'hosp-4',
    name: 'UCSF Benioff Children’s Hospital Emergency Room',
    type: 'Pediatric ER',
    address: '1975 4th St, San Francisco, CA 94158',
    distance: '4.0 miles away',
    driveTime: '14 mins',
    erWaitTime: '5 mins wait',
    phone: '+1 (415) 476-1000',
    emergencyOpen247: true,
    departments: ['Pediatric Trauma', 'Pediatric ICU', 'Neonatal Emergency', 'Child Neurology'],
    rating: 4.95,
  },
  {
    id: 'hosp-5',
    name: 'Carbon Health Urgent Care & Walk-in Clinic',
    type: 'Urgent Care',
    address: '55 Francisco St, San Francisco, CA 94133',
    distance: '2.0 miles away',
    driveTime: '7 mins',
    erWaitTime: '0 mins wait',
    phone: '+1 (415) 612-3278',
    emergencyOpen247: false,
    departments: ['Minor Trauma & Stitches', 'X-Ray & Lab Tests', 'Flu & Covid Triage', 'Prescription Refills'],
    rating: 4.7,
  },
];

export const Hospitals: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [routeModalHospital, setRouteModalHospital] = useState<HospitalFacility | null>(null);

  const filtered = HOSPITALS_DATA.filter((hosp) => {
    const matchesSearch =
      hosp.name.toLowerCase().includes(search.toLowerCase()) ||
      hosp.address.toLowerCase().includes(search.toLowerCase()) ||
      hosp.departments.some((d) => d.toLowerCase().includes(search.toLowerCase()));

    const matchesType = filterType === 'All' || hosp.type === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <Container maxWidth="xl" className="py-8 space-y-8">
      {/* Page Header */}
      <Box className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Box className="space-y-1">
          <Box className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
            <ShieldAlert className="w-3.5 h-3.5" /> Emergency Care Locator
          </Box>
          <Typography variant="h3" component="h1" className="font-black text-gray-900 dark:text-white tracking-tight">
            Nearest Emergency Rooms & Hospitals
          </Typography>
          <Typography variant="body1" className="text-gray-500 dark:text-gray-400">
            Live simulated ER wait times, specialty trauma capabilities, and one-click emergency dispatch directions.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="error"
          size="large"
          onClick={() => setEmergencyOpen(true)}
          startIcon={<PhoneCall className="w-5 h-5 animate-bounce" />}
          sx={{ borderRadius: 2.5, fontWeight: 700, px: 3, py: 1.4 }}
        >
          Call 911 Emergency
        </Button>
      </Box>

      {/* Search & Filter Toolbar */}
      <Paper elevation={0} className="glass-card rounded-3xl p-5 border border-gray-200 dark:border-gray-800">
        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            <Box className="flex items-center gap-2 p-2 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <Search className="w-5 h-5 text-gray-400 ml-2" />
              <input
                type="text"
                placeholder="Search hospital by name, department (e.g. Stroke, Burn, Pediatric)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white"
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={5}>
            <TextField
              select
              fullWidth
              size="small"
              label="Facility Type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="All">All Facilities</MenuItem>
              <MenuItem value="Trauma Center Level 1">Trauma Center Level 1 (Severe Emergencies)</MenuItem>
              <MenuItem value="Pediatric ER">Pediatric Emergency Rooms</MenuItem>
              <MenuItem value="General Hospital">General Hospitals</MenuItem>
              <MenuItem value="Urgent Care">Urgent Care & Walk-In</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Hospitals Grid */}
      <Grid container spacing={3}>
        {filtered.map((hosp) => (
          <Grid item xs={12} lg={6} key={hosp.id}>
            <Card
              elevation={0}
              className="h-full glass-card rounded-3xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <Box className="space-y-4">
                <Box className="flex items-start justify-between gap-4">
                  <Box className="flex items-start gap-3">
                    <Box className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex-shrink-0">
                      <Hospital className="w-7 h-7" />
                    </Box>
                    <Box>
                      <Typography variant="h6" className="font-bold text-gray-900 dark:text-white leading-snug">
                        {hosp.name}
                      </Typography>
                      <Typography variant="caption" className="text-rose-600 dark:text-rose-400 font-bold block mt-0.5">
                        {hosp.type}
                      </Typography>
                    </Box>
                  </Box>

                  <Chip
                    icon={<Clock className="w-3.5 h-3.5 text-emerald-500" />}
                    label={hosp.erWaitTime}
                    size="small"
                    sx={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#059669', fontWeight: 800 }}
                  />
                </Box>

                <Box className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>{hosp.address}</span>
                </Box>

                <Box className="flex items-center gap-4 text-xs font-semibold">
                  <span className="text-gray-800 dark:text-gray-200">
                    📍 {hosp.distance} ({hosp.driveTime} drive)
                  </span>
                  <span>•</span>
                  <span className="text-emerald-600 font-bold">
                    {hosp.emergencyOpen247 ? '🟢 24/7 ER Open' : '🟡 Walk-In Hours 8AM - 8PM'}
                  </span>
                </Box>

                {/* Specialty Departments */}
                <Box>
                  <Typography variant="caption" className="text-gray-400 font-bold uppercase text-[10px] block mb-1.5">
                    Specialized Emergency Capabilities:
                  </Typography>
                  <Box className="flex flex-wrap gap-1.5">
                    {hosp.departments.map((dept, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      >
                        {dept}
                      </span>
                    ))}
                  </Box>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                <Button
                  fullWidth
                  variant="contained"
                  href={`tel:${hosp.phone.replace(/[^0-9+]/g, '')}`}
                  startIcon={<PhoneCall className="w-4 h-4" />}
                  sx={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    borderRadius: 2,
                    fontWeight: 'bold',
                  }}
                >
                  Call ER Desk
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setRouteModalHospital(hosp)}
                  startIcon={<Navigation className="w-4 h-4 text-cyan-500" />}
                  sx={{ borderRadius: 2, fontWeight: 600 }}
                >
                  Get Route Directions
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Emergency Modal */}
      <EmergencyModal open={emergencyOpen} onClose={() => setEmergencyOpen(false)} />

      {/* Route Directions Modal */}
      {routeModalHospital && (
        <Dialog
          open={!!routeModalHospital}
          onClose={() => setRouteModalHospital(null)}
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
            Directions to Emergency Center
            <IconButton size="small" onClick={() => setRouteModalHospital(null)}>
              <X className="w-5 h-5" />
            </IconButton>
          </DialogTitle>
          <DialogContent className="space-y-4 pt-2">
            <Box className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
              <Typography variant="subtitle1" className="font-bold text-emerald-800 dark:text-emerald-200">
                {routeModalHospital.name}
              </Typography>
              <Typography variant="body2" className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                {routeModalHospital.address}
              </Typography>
              <Typography variant="caption" className="font-bold text-emerald-600 block mt-2">
                Estimated Transit: {routeModalHospital.driveTime} ({routeModalHospital.distance}) via fastest route.
              </Typography>
            </Box>

            <Box className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 space-y-2 text-xs">
              <Typography variant="subtitle2" className="font-bold">
                Emergency Transit Checklist:
              </Typography>
              <p>• Have your ID and insurance card accessible if possible.</p>
              <p>• If patient is unstable or in severe respiratory distress, pull over and call 911 immediately.</p>
              <p>• Emergency Department drop-off bays are located at the main ambulance pavilion.</p>
            </Box>

            <Button
              fullWidth
              variant="contained"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(routeModalHospital.name + ' ' + routeModalHospital.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<Navigation className="w-4 h-4" />}
              sx={{
                background: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
                borderRadius: 2,
                fontWeight: 'bold',
                py: 1.2,
              }}
            >
              Open in Google Maps / Apple Maps
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </Container>
  );
};

export default Hospitals;
