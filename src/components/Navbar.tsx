import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Container,
  Menu,
  MenuItem,
  Avatar,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Tooltip,
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  Bot,
  Video,
  Hospital,
  Stethoscope,
  Info,
  Mail,
  User,
  Moon,
  Sun,
  Menu as MenuIcon,
  X,
  Bell,
  PhoneCall,
  ShieldAlert,
  Calendar,
  LogOut,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { useAppTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useAppointments } from '../context/AppointmentContext';
import { EmergencyModal } from './EmergencyModal';

export const Navbar: React.FC = () => {
  const { mode, toggleTheme } = useAppTheme();
  const { user, logout, switchDemoUser } = useAuth();
  const { appointments } = useAppointments();
  const location = useLocation();
  const navigate = useNavigate();

  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  const upcomingAppointments = appointments.filter((a) => a.status === 'upcoming');

  const navLinks = [
    { label: 'Home', path: '/', icon: <Activity className="w-4 h-4" /> },
    { label: 'AI Health Doctor', path: '/chat', badge: 'AI 2.0', icon: <Bot className="w-4 h-4 text-emerald-500" /> },
    { label: 'Video Consult', path: '/video-consult', icon: <Video className="w-4 h-4 text-cyan-500" /> },
    { label: 'Services', path: '/services', icon: <Stethoscope className="w-4 h-4" /> },
    { label: 'ER & Hospitals', path: '/hospitals', icon: <Hospital className="w-4 h-4 text-rose-500" /> },
    { label: 'About', path: '/about', icon: <Info className="w-4 h-4" /> },
    { label: 'Contact', path: '/contact', icon: <Mail className="w-4 h-4" /> },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileOpen(false);
    setProfileAnchor(null);
    setNotifAnchor(null);
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        className="glass-nav sticky top-0 z-50 transition-all duration-300"
        sx={{
          color: (theme) => theme.palette.text.primary,
          backgroundImage: 'none',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters className="min-h-[72px] flex items-center justify-between">
            {/* Brand Logo */}
            <Box className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2.5 text-decoration-none group">
                <Box className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
                  <Activity className="w-6 h-6 text-white animate-pulse-slow" />
                </Box>
                <Box>
                  <Box className="flex items-center gap-1.5">
                    <Typography variant="h6" className="font-extrabold tracking-tight text-gray-900 dark:text-white leading-none">
                      Dr.<span className="text-emerald-500">AI</span>
                    </Typography>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      Telehealth
                    </span>
                  </Box>
                  <Typography variant="caption" className="text-gray-400 font-medium text-[11px] block leading-tight">
                    Next-Gen Healthcare
                  </Typography>
                </Box>
              </Link>
            </Box>

            {/* Desktop Navigation Links */}
            <Box className="hidden lg:flex items-center gap-1 bg-gray-100/60 dark:bg-gray-800/40 p-1 rounded-2xl border border-gray-200/60 dark:border-gray-700/50">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Button
                    key={link.path}
                    onClick={() => handleNavigate(link.path)}
                    startIcon={link.icon}
                    sx={{
                      borderRadius: 2.5,
                      px: 2,
                      py: 0.8,
                      fontSize: '0.85rem',
                      fontWeight: isActive ? 700 : 600,
                      color: isActive
                        ? '#10B981'
                        : (theme) => (theme.palette.mode === 'dark' ? '#CBD5E1' : '#475569'),
                      backgroundColor: isActive
                        ? (theme) => (theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.15)' : '#FFFFFF')
                        : 'transparent',
                      boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                      '&:hover': {
                        color: '#10B981',
                        backgroundColor: (theme) =>
                          theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                      },
                    }}
                  >
                    {link.label}
                    {link.badge && (
                      <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-white font-bold">
                        {link.badge}
                      </span>
                    )}
                  </Button>
                );
              })}
            </Box>

            {/* Right Action Controls */}
            <Box className="flex items-center gap-2">
              {/* Emergency Alert Button */}
              <Tooltip title="Emergency Medical Hotlines & Nearest ER">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setEmergencyOpen(true)}
                  startIcon={<PhoneCall className="w-4 h-4 text-red-500 animate-bounce" />}
                  sx={{
                    borderColor: 'rgba(239, 68, 68, 0.5)',
                    color: '#EF4444',
                    fontWeight: 700,
                    borderRadius: 2,
                    display: { xs: 'none', sm: 'inline-flex' },
                    '&:hover': {
                      backgroundColor: 'rgba(239, 68, 68, 0.08)',
                      borderColor: '#EF4444',
                    },
                  }}
                >
                  911 ER
                </Button>
              </Tooltip>

              {/* Theme Toggle Button */}
              <Tooltip title={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} Mode`}>
                <IconButton
                  onClick={toggleTheme}
                  sx={{
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: (theme) => (theme.palette.mode === 'dark' ? '#334155' : '#E2E8F0'),
                    p: 1,
                  }}
                >
                  {mode === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
                </IconButton>
              </Tooltip>

              {/* Notification Popover */}
              <Tooltip title="Notifications">
                <IconButton
                  onClick={(e) => setNotifAnchor(e.currentTarget)}
                  sx={{
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: (theme) => (theme.palette.mode === 'dark' ? '#334155' : '#E2E8F0'),
                    p: 1,
                  }}
                >
                  <Badge badgeContent={upcomingAppointments.length} color="primary">
                    <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* Notifications Menu */}
              <Menu
                anchorEl={notifAnchor}
                open={Boolean(notifAnchor)}
                onClose={() => setNotifAnchor(null)}
                PaperProps={{
                  sx: {
                    borderRadius: 3,
                    width: 320,
                    p: 1,
                    background: (theme) => (theme.palette.mode === 'dark' ? '#0F172A' : '#FFFFFF'),
                    border: '1px solid rgba(226, 232, 240, 0.2)',
                  },
                }}
              >
                <Box className="p-2 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <Typography variant="subtitle2" className="font-bold">
                    Notifications
                  </Typography>
                  <Chip label={`${upcomingAppointments.length} Active`} size="small" color="primary" />
                </Box>
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((apt) => (
                    <MenuItem
                      key={apt.id}
                      onClick={() => handleNavigate('/profile')}
                      className="p-3 my-1 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                    >
                      <Box className="flex gap-2.5 items-start">
                        <Box className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-600">
                          <Calendar className="w-4 h-4" />
                        </Box>
                        <Box>
                          <Typography variant="caption" className="font-bold text-gray-900 dark:text-gray-100 block">
                            Upcoming with {apt.doctorName}
                          </Typography>
                          <Typography variant="caption" className="text-gray-500 block">
                            {apt.date} at {apt.time} ({apt.type})
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))
                ) : (
                  <Box className="p-4 text-center text-gray-400 text-xs">
                    No new medical alerts. All systems healthy.
                  </Box>
                )}
              </Menu>

              {/* User Profile Avatar / Menu */}
              {user ? (
                <>
                  <Box
                    onClick={(e) => setProfileAnchor(e.currentTarget)}
                    className="flex items-center gap-2 cursor-pointer p-1.5 pr-3 rounded-2xl bg-gray-100/80 dark:bg-gray-800/80 hover:ring-2 hover:ring-emerald-500/40 transition-all"
                  >
                    <Avatar
                      src={user.avatar}
                      alt={user.name}
                      sx={{ width: 34, height: 34, border: '2px solid #10B981' }}
                    />
                    <Box className="hidden sm:block text-left">
                      <Typography variant="caption" className="font-bold leading-tight block text-gray-800 dark:text-gray-200">
                        {user.name.split(' ')[0]}
                      </Typography>
                      <Typography variant="caption" className="text-[10px] text-emerald-600 dark:text-emerald-400 capitalize block leading-none font-semibold">
                        {user.role}
                      </Typography>
                    </Box>
                  </Box>

                  <Menu
                    anchorEl={profileAnchor}
                    open={Boolean(profileAnchor)}
                    onClose={() => setProfileAnchor(null)}
                    PaperProps={{
                      sx: {
                        borderRadius: 3,
                        minWidth: 240,
                        p: 1,
                        background: (theme) => (theme.palette.mode === 'dark' ? '#0F172A' : '#FFFFFF'),
                        border: '1px solid rgba(226, 232, 240, 0.2)',
                      },
                    }}
                  >
                    <Box className="p-3 border-b border-gray-100 dark:border-gray-800 mb-1">
                      <Typography variant="subtitle2" className="font-bold">
                        {user.name}
                      </Typography>
                      <Typography variant="caption" className="text-gray-400">
                        {user.email}
                      </Typography>
                    </Box>

                    <MenuItem onClick={() => handleNavigate('/profile')} className="rounded-lg">
                      <ListItemIcon>
                        <User className="w-4 h-4 text-emerald-500" />
                      </ListItemIcon>
                      <ListItemText primary="My Health Profile & Vitals" />
                    </MenuItem>

                    <MenuItem onClick={() => handleNavigate('/chat')} className="rounded-lg">
                      <ListItemIcon>
                        <Bot className="w-4 h-4 text-cyan-500" />
                      </ListItemIcon>
                      <ListItemText primary="AI Medical Assistant" />
                    </MenuItem>

                    <MenuItem onClick={() => handleNavigate('/video-consult')} className="rounded-lg">
                      <ListItemIcon>
                        <Video className="w-4 h-4 text-blue-500" />
                      </ListItemIcon>
                      <ListItemText primary="Video Telehealth Rooms" />
                    </MenuItem>

                    <Divider sx={{ my: 1 }} />

                    {/* Switch Demo Profiles */}
                    <Box className="px-3 py-1">
                      <Typography variant="caption" className="font-bold text-gray-400 uppercase text-[10px]">
                        Switch Demo Role:
                      </Typography>
                    </Box>

                    <MenuItem
                      onClick={() => {
                        switchDemoUser('patient');
                        setProfileAnchor(null);
                      }}
                      className="rounded-lg"
                    >
                      <ListItemIcon>
                        <CheckCircle className={`w-4 h-4 ${user.role === 'patient' ? 'text-emerald-500' : 'text-gray-400'}`} />
                      </ListItemIcon>
                      <ListItemText primary="Patient (Alex Rivera)" />
                    </MenuItem>

                    <MenuItem
                      onClick={() => {
                        switchDemoUser('doctor');
                        setProfileAnchor(null);
                      }}
                      className="rounded-lg"
                    >
                      <ListItemIcon>
                        <CheckCircle className={`w-4 h-4 ${user.role === 'doctor' ? 'text-emerald-500' : 'text-gray-400'}`} />
                      </ListItemIcon>
                      <ListItemText primary="Doctor (Dr. Sarah Johnson, MD)" />
                    </MenuItem>

                    <Divider sx={{ my: 1 }} />

                    <MenuItem
                      onClick={() => {
                        logout();
                        setProfileAnchor(null);
                        navigate('/login');
                      }}
                      className="rounded-lg text-rose-500"
                    >
                      <ListItemIcon>
                        <LogOut className="w-4 h-4 text-rose-500" />
                      </ListItemIcon>
                      <ListItemText primary="Sign Out" />
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box className="flex items-center gap-2">
                  <Button
                    variant="text"
                    onClick={() => handleNavigate('/login')}
                    sx={{ fontWeight: 600 }}
                  >
                    Log In
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => handleNavigate('/signup')}
                    sx={{
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      fontWeight: 700,
                      borderRadius: 2,
                    }}
                  >
                    Get Started
                  </Button>
                </Box>
              )}

              {/* Mobile Menu Button */}
              <IconButton
                onClick={() => setMobileOpen(true)}
                sx={{
                  display: { lg: 'none' },
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: (theme) => (theme.palette.mode === 'dark' ? '#334155' : '#E2E8F0'),
                }}
              >
                <MenuIcon className="w-6 h-6" />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            width: 300,
            background: (theme) => (theme.palette.mode === 'dark' ? '#0F172A' : '#FFFFFF'),
            p: 2,
          },
        }}
      >
        <Box className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-2">
          <Box className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-500" />
            <Typography variant="h6" className="font-extrabold">
              Dr.<span className="text-emerald-500">AI</span>
            </Typography>
          </Box>
          <IconButton onClick={() => setMobileOpen(false)}>
            <X className="w-5 h-5" />
          </IconButton>
        </Box>

        <List className="space-y-1">
          {navLinks.map((link) => (
            <ListItem key={link.path} disablePadding>
              <ListItemButton
                onClick={() => handleNavigate(link.path)}
                sx={{
                  borderRadius: 2,
                  backgroundColor: location.pathname === link.path ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                  color: location.pathname === link.path ? '#10B981' : undefined,
                  fontWeight: location.pathname === link.path ? 700 : 500,
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>{link.icon}</ListItemIcon>
                <ListItemText primary={link.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <Button
            fullWidth
            variant="contained"
            color="error"
            startIcon={<PhoneCall className="w-4 h-4" />}
            onClick={() => {
              setMobileOpen(false);
              setEmergencyOpen(true);
            }}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Emergency 911 Hotline
          </Button>

          {user ? (
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleNavigate('/profile')}
              startIcon={<User className="w-4 h-4" />}
              sx={{ borderRadius: 2 }}
            >
              My Profile
            </Button>
          ) : (
            <Button
              fullWidth
              variant="contained"
              onClick={() => handleNavigate('/login')}
              sx={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                borderRadius: 2,
              }}
            >
              Sign In
            </Button>
          )}
        </Box>
      </Drawer>

      {/* Global Emergency Modal */}
      <EmergencyModal open={emergencyOpen} onClose={() => setEmergencyOpen(false)} />
    </>
  );
};

export default Navbar;