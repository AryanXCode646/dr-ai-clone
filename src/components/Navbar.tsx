import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

interface NavbarProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ toggleTheme, isDarkMode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
          MediConnect AI
        </Typography>
        <IconButton color="inherit" onClick={toggleTheme}>
          {isDarkMode ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
        <Button color="inherit" component={RouterLink} to="/chat">
          Chat
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 