import React from 'react';
import { Link } from 'react-router-dom';
import DarkModeToggle from './DarkModeToggle';

const Navbar = () => {
    return ( <
        nav className = "bg-white dark:bg-gray-800 shadow" >
        <
        div className = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" >
        <
        div className = "flex justify-between h-16" >
        <
        div className = "flex" >
        <
        div className = "flex-shrink-0" >
        <
        Link to = "/"
        className = "text-2xl font-bold text-gray-900 dark:text-white" > AI Doctor < /Link> <
        /div> <
        div className = "hidden sm:ml-6 sm:flex sm:space-x-8" >
        <
        Link to = "/"
        className = "text-gray-900 dark:text-white" > Home < /Link> <
        Link to = "/features"
        className = "text-gray-900 dark:text-white" > Features < /Link> <
        Link to = "/about"
        className = "text-gray-900 dark:text-white" > About < /Link> <
        Link to = "/contact"
        className = "text-gray-900 dark:text-white" > Contact < /Link> <
        /div> <
        /div> <
        div className = "flex items-center" >
        <
        DarkModeToggle / >
        <
        Link to = "/login"
        className = "ml-4 text-gray-900 dark:text-white" > Login < /Link> <
        Link to = "/signup"
        className = "ml-4 text-gray-900 dark:text-white" > Signup < /Link> <
        /div> <
        /div> <
        /div> <
        /nav>
    );
};

export default Navbar;