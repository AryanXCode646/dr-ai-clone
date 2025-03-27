import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const [darkMode, setDarkMode] = useState(false);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.documentElement.classList.toggle('dark');
    };

    return ( <
        nav className = "navbar" >
        <
        div className = "logo" > AI Doctor < /div> <
        div className = "nav-links" >
        <
        Link to = "/" > Home < /Link> <
        Link to = "/features" > Features < /Link> <
        Link to = "/about" > About < /Link> <
        Link to = "/contact" > Contact < /Link> <
        Link to = "/testimonials" > Testimonials < /Link> <
        Link to = "/pricing" > Pricing < /Link> <
        Link to = "/dashboard" > Dashboard < /Link> <
        button onClick = { toggleDarkMode } > { darkMode ? 'Light Mode' : 'Dark Mode' } <
        /button> < /
        div > <
        /nav>
    );
};

export default Navbar;