import React from 'react';

const Features = () => {
    return ( <
        section className = "py-20" >
        <
        h2 className = "text-3xl font-bold text-center mb-8" > Features < /h2> <
        div className = "grid grid-cols-1 md:grid-cols-3 gap-8" >
        <
        div className = "bg-white dark:bg-gray-800 p-6 rounded shadow" >
        <
        h3 className = "text-xl font-bold mb-2" > 24 / 7 Virtual Consultations < /h3> <
        p > Get medical advice anytime, anywhere. < /p> < /
        div > <
        div className = "bg-white dark:bg-gray-800 p-6 rounded shadow" >
        <
        h3 className = "text-xl font-bold mb-2" > AI - Powered Diagnostics < /h3> <
        p > Accurate and fast diagnosis using AI technology. < /p> < /
        div > <
        div className = "bg-white dark:bg-gray-800 p-6 rounded shadow" >
        <
        h3 className = "text-xl font-bold mb-2" > Personalized Health Plans < /h3> <
        p > Customized health plans tailored to your needs. < /p> < /
        div > <
        /div> < /
        section >
    );
};

export default Features;