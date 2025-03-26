import React, { useState, useEffect } from 'react';

const DarkModeToggle = () => {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    return ( <
        button onClick = {
            () => setDarkMode(!darkMode)
        }
        className = "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded" > { darkMode ? 'Light Mode' : 'Dark Mode' } <
        /button>
    );
};

export default DarkModeToggle;