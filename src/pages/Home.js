import React from 'react';

const Home = () => {
    return ( <
        section id = "hero" >
        <
        h1 className = "animated-text" > Welcome to AI Doctor < /h1> <
        p > Your health, our priority.Powered by AI. < /p> <
        button className = "cta-button"
        onClick = {
            () => alert('Welcome to AI Doctor!')
        } > Get Started < /button> < /
        section >
    );
};

export default Home;