"use client";
import React, { useState } from 'react';
import { auth } from '@/app/firebase/firebase';
import { signOut } from "firebase/auth";
import ManageUsers from './ManageUsers';
import ManageLocations from './ManageLocations';
import ManageReports from './ManageReports';
import LocationMapView from './LocationMapView';

export default function AdminDashboard() {
    const [view, setView] = useState('users');
    const [viewingLocation, setViewingLocation] = useState(null);

    const handleSignOut = async () => {
        try { await signOut(auth); } catch (error) { console.error("Sign out error: ", error); }
    };

    const renderView = () => {
        if (viewingLocation) {
            return <LocationMapView location={viewingLocation} onBack={() => setViewingLocation(null)} />;
        }
        switch (view) {
            case 'users': return <ManageUsers />;
            case 'locations': return <ManageLocations onViewLocation={setViewingLocation} />;
            case 'reports': return <ManageReports />;
            default: return <ManageUsers />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-64 bg-gray-800 dark:bg-gray-950 text-white p-5 flex flex-col">
                <h1 className="text-2xl font-bold mb-10">Admin Panel</h1>
                <nav className="flex flex-col space-y-2">
                    <a href="#" onClick={(e) => { e.preventDefault(); setView('users'); setViewingLocation(null);}} className={`p-2 rounded ${view === 'users' && !viewingLocation ? 'bg-gray-700 dark:bg-gray-800' : 'hover:bg-gray-700 dark:hover:bg-gray-800'}`}>Manage Users</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setView('locations'); setViewingLocation(null);}} className={`p-2 rounded ${view === 'locations' && !viewingLocation ? 'bg-gray-700 dark:bg-gray-800' : 'hover:bg-gray-700 dark:hover:bg-gray-800'}`}>Manage Locations</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setView('reports'); setViewingLocation(null);}} className={`p-2 rounded ${view === 'reports' && !viewingLocation ? 'bg-gray-700 dark:bg-gray-800' : 'hover:bg-gray-700 dark:hover:bg-gray-800'}`}>Manage Reports</a>
                </nav>
                <button onClick={handleSignOut} className="mt-auto w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                    Sign Out
                </button>
            </div>
            <div className="flex-1 p-10 overflow-y-auto">
                {renderView()}
            </div>
        </div>
    );
}