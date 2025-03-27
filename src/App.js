import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Features from './pages/Features';
import About from './pages/About';
import Contact from './pages/Contact';
import Testimonials from './pages/Testimonials';
import Pricing from './pages/Pricing';
import Dashboard from './pages/Dashboard';
import Footer from './components/Footer';

function App() {
    return ( <
        div className = "App" >
        <
        Navbar / >
        <
        Switch >
        <
        Route path = "/"
        exact component = { Home }
        /> <
        Route path = "/features"
        component = { Features }
        /> <
        Route path = "/about"
        component = { About }
        /> <
        Route path = "/contact"
        component = { Contact }
        /> <
        Route path = "/testimonials"
        component = { Testimonials }
        /> <
        Route path = "/pricing"
        component = { Pricing }
        /> <
        Route path = "/dashboard"
        component = { Dashboard }
        /> < /
        Switch > <
        Footer / >
        <
        /div>
    );
}

export default App;