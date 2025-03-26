import React from 'react';

const Login = () => {
    return ( <
        section className = "py-20" >
        <
        h2 className = "text-3xl font-bold text-center mb-8" > Login < /h2> <
        form className = "max-w-lg mx-auto" >
        <
        label className = "block mb-2"
        htmlFor = "email" > Email: < /label> <
        input className = "w-full p-2 mb-4 border rounded"
        type = "email"
        id = "email"
        name = "email"
        required / >
        <
        label className = "block mb-2"
        htmlFor = "password" > Password: < /label> <
        input className = "w-full p-2 mb-4 border rounded"
        type = "password"
        id = "password"
        name = "password"
        required / >
        <
        button className = "bg-blue-500 text-white px-4 py-2 rounded"
        type = "submit" > Login < /button> < /
        form > <
        /section>
    );
};

export default Login;