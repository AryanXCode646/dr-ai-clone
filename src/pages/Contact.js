import React from 'react';

const Contact = () => {
    return ( <
        section className = "py-20" >
        <
        h2 className = "text-3xl font-bold text-center mb-8" > Contact Us < /h2> <
        form className = "max-w-lg mx-auto" >
        <
        label className = "block mb-2"
        htmlFor = "name" > Name: < /label> <
        input className = "w-full p-2 mb-4 border rounded"
        type = "text"
        id = "name"
        name = "name"
        required / >
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
        htmlFor = "message" > Message: < /label> <
        textarea className = "w-full p-2 mb-4 border rounded"
        id = "message"
        name = "message"
        required > < /textarea> <
        button className = "bg-blue-500 text-white px-4 py-2 rounded"
        type = "submit" > Send < /button> <
        /form> <
        /section>
    );
};

export default Contact;