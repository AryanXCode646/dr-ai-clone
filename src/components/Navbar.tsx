import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Menu, 
  MenuItem, 
  Box,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Language as LanguageIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ toggleTheme, isDarkMode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsMenu, setProductsMenu] = useState<null | HTMLElement>(null);
  const [languageMenu, setLanguageMenu] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProductsMenu = (event: React.MouseEvent<HTMLElement>) => {
    setProductsMenu(event.currentTarget);
  };

  const handleProductsClose = () => {
    setProductsMenu(null);
  };

  const handleLanguageMenu = (event: React.MouseEvent<HTMLElement>) => {
    setLanguageMenu(event.currentTarget);
  };

  const handleLanguageClose = () => {
    setLanguageMenu(null);
  };

  const products = [
    { title: 'Professionals', items: ['Admission Note', 'Progress Note', 'Pharmacotherapy', 'Cancer Strategy'] },
    { title: 'Individuals', items: ['Health Platform', 'Symptom Advice', 'Medication Guidance', 'Health Plans'] },
    { title: 'MedExam Pro', items: ['Diagnosis', 'Reports', 'Multilingual', 'Layout Options'] }
  ];

  const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'];

  const renderDesktopMenu = () => (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
        <Button 
          color="inherit" 
          onClick={handleProductsMenu}
          endIcon={<ExpandMoreIcon />}
        >
          Products
        </Button>
        <Menu
          anchorEl={productsMenu}
          open={Boolean(productsMenu)}
          onClose={handleProductsClose}
          PaperProps={{
            sx: { minWidth: 200 }
          }}
        >
          {products.map((product) => (
            <Box key={product.title}>
              <MenuItem sx={{ fontWeight: 'bold' }}>{product.title}</MenuItem>
              {product.items.map((item) => (
                <MenuItem key={item} sx={{ pl: 4 }}>{item}</MenuItem>
              ))}
              <Divider />
            </Box>
          ))}
        </Menu>
      </Box>
      <Box sx={{ flexGrow: 1 }} />
      <IconButton color="inherit" onClick={handleLanguageMenu}>
        <LanguageIcon />
      </IconButton>
      <Menu
        anchorEl={languageMenu}
        open={Boolean(languageMenu)}
        onClose={handleLanguageClose}
      >
        {languages.map((lang) => (
          <MenuItem key={lang} onClick={handleLanguageClose}>{lang}</MenuItem>
        ))}
      </Menu>
      <IconButton color="inherit" onClick={toggleTheme}>
        {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
      <Button color="inherit" onClick={() => navigate('/login')}>Sign In</Button>
      <Button 
        variant="contained" 
        color="secondary" 
        sx={{ ml: 2 }}
        onClick={() => navigate('/register')}
      >
        Free Start
      </Button>
    </>
  );

  const renderMobileMenu = () => (
    <>
      <IconButton
        color="inherit"
        edge="start"
        onClick={() => setMobileMenuOpen(true)}
      >
        <MenuIcon />
      </IconButton>
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <List sx={{ width: 250 }}>
          <ListItem>
            <Typography variant="h6">Menu</Typography>
          </ListItem>
          <Divider />
          {products.map((product) => (
            <React.Fragment key={product.title}>
              <ListItem>
                <ListItemText primary={product.title} />
              </ListItem>
              {product.items.map((item) => (
                <ListItem key={item} sx={{ pl: 4 }}>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
              <Divider />
            </React.Fragment>
          ))}
          <ListItem>
            <ListItemText primary="Language" />
          </ListItem>
          {languages.map((lang) => (
            <ListItem key={lang} onClick={handleLanguageClose}>
              <ListItemText primary={lang} />
            </ListItem>
          ))}
          <Divider />
          <ListItem>
            <ListItemText 
              primary={isDarkMode ? "Light Mode" : "Dark Mode"} 
              onClick={toggleTheme}
            />
          </ListItem>
          <ListItem>
            <ListItemText primary="Sign In" onClick={() => navigate('/login')} />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Free Start" 
              onClick={() => navigate('/register')}
              sx={{ color: 'primary.main', fontWeight: 'bold' }}
            />
          </ListItem>
        </List>
      </Drawer>
    </>
  );

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 0, 
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/')}
        >
          Dr.AI
        </Typography>
        {isMobile ? renderMobileMenu() : renderDesktopMenu()}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 