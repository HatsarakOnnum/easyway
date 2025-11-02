"use client";
import React from 'react';

export default function WelcomeScreen({ setView }) {
    return (
        <div className="relative w-full h-screen bg-cover bg-center text-white dark:text-gray-200" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}>
            <div className="absolute inset-0 flex flex-col justify-center items-center p-8 bg-black/50">
                <div className="text-center"><h1 className="text-6xl md:text-8xl font-bold tracking-wider">EW</h1><p className="text-2xl md:text-3xl font-light tracking-widest mt-2">EASYWAY</p></div>
                <div className="mt-16 text-center"><h2 className="text-3xl md:text-4xl font-semibold">Welcome To The App EasyWay</h2><p className="mt-4 text-lg md:text-xl italic text-gray-300">"Every Journey Starts With A Single Pin."</p></div>
                <div className="mt-16 flex flex-col items-center w-full max-w-xs">
                    <button onClick={() => setView('login')} className="w-full bg-white text-black font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-gray-200 transition duration-300">Login</button>
                    <button onClick={() => setView('map')} className="w-full mt-4 bg-transparent border-2 border-white text-white font-bold py-3 px-6 rounded-lg hover:bg-white hover:text-black transition duration-300">Continue As Guest</button>
                    <button onClick={() => setView('signup')} className="mt-8 text-white underline hover:text-gray-300 transition">Create an Account</button>
                </div>
            </div>
        </div>
    );
}