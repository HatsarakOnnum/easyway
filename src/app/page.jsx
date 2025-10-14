"use client";
import React, { useState, useRef, useEffect } from 'react';

// --- Firebase Initialization ---
import { initializeApp } from "firebase/app";
// *** เพิ่ม import สำหรับ CRUD ***
import { getFirestore, collection, getDocs, onSnapshot, addDoc, doc, setDoc, deleteDoc } from "firebase/firestore";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkAJ0WxSm1NbgPMHXx6MByAryRQkRxqVA",
  authDomain: "easyway-40e1b.firebaseapp.com",
  projectId: "easyway-40e1b",
  storageBucket: "easyway-40e1b.firebasestorage.app",
  messagingSenderId: "371724947061",
  appId: "1:371724947061:web:a48a31d9cfe3138c84b23c",
  measurementId: "G-8P4JG1N4GC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Hello World

// --- SVG Icons ---
const GoogleIcon = () => (<svg className="w-5 h-5 mr-2" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.222 0-9.612-3.87-11.188-8.864l-6.571 4.819A20 20 0 0 0 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C43.021 36.697 44 34.09 44 31.5c0-3.756-.768-7.297-2.109-10.552z"></path></svg>);
const EyeIcon = ({ closed }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">{closed ? (<><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" x2="22" y1="2" y2="22"></line></>) : (<><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></>)}</svg>);
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const GpsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v.01M12 12v.01M12 16v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const MinusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" /></svg>;
const CarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14h-5v-4h5m2 4h-2m2 0l-1-4H8l-1 4m10 0v4a1 1 0 01-1 1H8a1 1 0 01-1-1v-4m10 0a2 2 0 100-4 2 2 0 000 4z" /></svg>;
const MotorcycleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16l-4-4m0 0l4-4m-4 4h12m-6 4a2 2 0 100-4 2 2 0 000 4z" /></svg>;


// --- Authentication Screens ---
function WelcomeScreen({ setView }) {
    return (
        <div className="relative w-full h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%D%3D')" }}>
            <div className="absolute inset-0 flex flex-col justify-center items-center p-8" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
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
function LoginScreen({ setView }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            setError("Failed to log in. Please check your email and password.");
            console.error(err);
        }
    };
    return (
        <div className="w-screen h-screen flex bg-white">
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-gradient-to-br from-sky-200 to-blue-300">
                <div className="w-full max-w-md">
                    <header className="flex justify-between items-center mb-10"><h1 className="text-2xl font-bold text-blue-800">EasyWay</h1><div><button onClick={() => setView('welcome')} className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-blue-800">Welcome</button><button onClick={() => setView('signup')} className="px-4 py-2 text-sm font-semibold bg-white text-blue-700 rounded-md shadow-sm hover:bg-gray-100">Create an Account</button></div></header>
                    <h2 className="text-3xl font-bold text-gray-800">Login</h2><p className="mt-2 text-gray-600">"Welcome back to the app EasyWay"</p>
                    {error && <p className="mt-4 text-red-500 bg-red-100 p-3 rounded">{error}</p>}
                    <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                        <div><label className="block text-sm font-semibold text-gray-700">Email (Username)</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50" placeholder="Enter your email"/></div>
                        <div className="relative"><label className="block text-sm font-semibold text-gray-700">Password</label><input type={passwordVisible ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50" placeholder="Enter your password"/><button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className="absolute inset-y-0 right-0 top-6 flex items-center px-4"><EyeIcon closed={passwordVisible} /></button></div>
                        <div><button type="submit" className="w-full bg-white text-gray-800 font-bold py-3 px-4 rounded-lg shadow-md hover:bg-gray-100 transition duration-300">Login</button></div>
                    </form>
                </div>
            </div>
            <div className="hidden lg:flex w-1/2 relative items-center justify-center"><img src="https://images.unsplash.com/photo-1533122250115-61328808de74?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%D%3D" alt="Driving with map" className="w-full h-full object-cover"/></div>
        </div>
    );
}
function SignUpScreen({ setView }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) {
            setError("Password should be at least 6 characters.");
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // After user is created, save user info to 'users' collection
            const user = userCredential.user;
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                createdAt: new Date()
            });
        } catch (err) {
            setError("Failed to create an account. The email may already be in use.");
            console.error(err);
        }
    };
    return (
        <div className="w-screen h-screen flex bg-white">
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-gradient-to-br from-sky-200 to-blue-300">
                <div className="w-full max-w-md">
                    <header className="flex justify-between items-center mb-10"><h1 className="text-2xl font-bold text-blue-800">EasyWay</h1><div><button onClick={() => setView('login')} className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-blue-800">Login</button><button onClick={() => setView('welcome')} className="px-4 py-2 text-sm font-semibold bg-white text-blue-700 rounded-md shadow-sm hover:bg-gray-100">Welcome</button></div></header>
                    <h2 className="text-3xl font-bold text-gray-800">Create Account</h2><p className="mt-2 text-gray-600">"Welcome to the app EasyWay"</p>
                     {error && <p className="mt-4 text-red-500 bg-red-100 p-3 rounded">{error}</p>}
                    <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
                        <div><label className="block text-sm font-semibold text-gray-700">Email (Username)</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50" placeholder="Enter your email"/></div>
                         <div><label className="block text-sm font-semibold text-gray-700">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50" placeholder="Create a password (min. 6 characters)"/></div>
                        <div><button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-300">Sign Up</button></div>
                    </form>
                </div>
            </div>
            <div className="hidden lg:flex w-1/2 relative items-center justify-center"><img src="https://images.unsplash.com/photo-1611702859239-401736b47c05?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%D%3D" alt="Person working on laptop" className="w-full h-full object-cover"/></div>
        </div>
    );
}

// --- Admin Dashboard Components ---
const DashboardHome = () => (
    <>
        <h2 className="text-3xl font-bold mb-5">Dashboard</h2>
        <p>Welcome to the admin dashboard. Here you can manage users, locations, and view reports.</p>
    </>
);

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
            const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(usersData);
        });
        return () => unsubscribe();
    }, []);
    
    const handleOpenModal = (user = null) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleDelete = async (user) => {
        if (window.confirm(`Are you sure you want to delete user ${user.email}?`)) {
            // Deleting from Firestore 'users' collection
            await deleteDoc(doc(db, "users", user.id));
            alert(`User ${user.email} deleted from Firestore. Auth user must be deleted from the Firebase Console or a backend function.`);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-3xl font-bold">Manage Users</h2>
                <button onClick={() => handleOpenModal()} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Add User</button>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User ID</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created At</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{user.email}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{user.uid}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{user.createdAt?.toDate().toLocaleString()}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                    <button onClick={() => handleOpenModal(user)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                    <button onClick={() => handleDelete(user)} className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <UserFormModal currentUser={editingUser} onClose={handleCloseModal} />}
        </div>
    );
};

const UserFormModal = ({ currentUser, onClose }) => {
    const [email, setEmail] = useState(currentUser?.email || '');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (currentUser) {
            // Edit mode
            const userRef = doc(db, "users", currentUser.id);
            await setDoc(userRef, { ...currentUser, email: email });
            onClose();
        } else {
            // Add mode
            if (password.length < 6) {
                setError("Password should be at least 6 characters.");
                return;
            }
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    email: user.email,
                    createdAt: new Date()
                });
                onClose();
            } catch (err) {
                setError("Failed to create user. Email might already exist.");
                console.error(err);
            }
        }
    };
    
    return (
         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                <form onSubmit={handleSubmit}>
                    <h3 className="text-xl font-bold mb-4">{currentUser ? 'Edit User' : 'Add New User'}</h3>
                    {error && <p className="mb-4 text-red-500">{error}</p>}
                    <div className="space-y-4">
                        <div>
                            <label className="block">Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded" required />
                        </div>
                        <div>
                            <label className="block">Password</label>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                className="w-full px-3 py-2 border rounded disabled:bg-gray-200" 
                                placeholder={currentUser ? "Password can't be changed here" : ""}
                                required={!currentUser} 
                                disabled={!!currentUser} 
                            />
                        </div>
                    </div>
                    <div className="flex justify-end mt-6">
                        <button type="button" onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2">Cancel</button>
                        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Save</button>
                    </div>
                </form>
            </div>
        </div>
    )
};


const ManageLocations = ({ onViewLocation }) => {
    const [locations, setLocations] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null); // For editing
    
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "locations"), (snapshot) => {
            const locsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setLocations(locsData);
        });
        return () => unsubscribe();
    }, []);

    const handleOpenModal = (loc = null) => {
        setCurrentLocation(loc);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentLocation(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this location?")) {
            await deleteDoc(doc(db, "locations", id));
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-3xl font-bold">Manage Locations</h2>
                <button onClick={() => handleOpenModal()} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Add Location</button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                     <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pin Name</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Latitude</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Longitude</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {locations.map(loc => (
                            <tr key={loc.id}>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{loc.name}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{loc.lat}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{loc.lng}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                    <button onClick={() => onViewLocation(loc)} className="text-blue-600 hover:text-blue-900 mr-4">View</button>
                                    <button onClick={() => handleOpenModal(loc)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                    <button onClick={() => handleDelete(loc.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {isModalOpen && <LocationFormModal currentLocation={currentLocation} onClose={handleCloseModal} />}
        </div>
    );
};

const LocationFormModal = ({ currentLocation, onClose }) => {
    const [name, setName] = useState(currentLocation?.name || '');
    const [lat, setLat] = useState(currentLocation?.lat || '');
    const [lng, setLng] = useState(currentLocation?.lng || '');
    const [routes, setRoutes] = useState(currentLocation?.routes || [{ destination: '', price: '' }]);
    
    const handleRouteChange = (index, field, value) => {
        const newRoutes = [...routes];
        if (field === 'price') {
             newRoutes[index][field] = Number(value);
        } else {
            newRoutes[index][field] = value;
        }
        setRoutes(newRoutes);
    };

    const addRoute = () => {
        setRoutes([...routes, { destination: '', price: '' }]);
    };
    
    const removeRoute = (index) => {
        const newRoutes = routes.filter((_, i) => i !== index);
        setRoutes(newRoutes);
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const locationData = { name, lat: Number(lat), lng: Number(lng), routes };
        
        if (currentLocation) {
            // Update
            await setDoc(doc(db, "locations", currentLocation.id), locationData);
        } else {
            // Add new
            await addDoc(collection(db, "locations"), locationData);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                <form onSubmit={handleSubmit}>
                    <h3 className="text-xl font-bold mb-4">{currentLocation ? 'Edit Location' : 'Add New Location'}</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block">Pin Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded" required />
                        </div>
                        <div className="flex space-x-4">
                            <div className="w-1/2">
                                <label className="block">Latitude</label>
                                <input type="number" step="any" value={lat} onChange={e => setLat(e.target.value)} className="w-full px-3 py-2 border rounded" required />
                            </div>
                            <div className="w-1/2">
                                <label className="block">Longitude</label>
                                <input type="number" step="any" value={lng} onChange={e => setLng(e.target.value)} className="w-full px-3 py-2 border rounded" required />
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold mt-4">Places & Prices</h4>
                            {routes.map((route, index) => (
                                <div key={index} className="flex items-center space-x-2 mt-2">
                                    <input type="text" placeholder="Place (e.g., Plum phase 1)" value={route.destination} onChange={e => handleRouteChange(index, 'destination', e.target.value)} className="w-1/2 px-3 py-2 border rounded" />
                                    <input type="number" placeholder="Price" value={route.price} onChange={e => handleRouteChange(index, 'price', e.target.value)} className="w-1/3 px-3 py-2 border rounded" />
                                    <button type="button" onClick={() => removeRoute(index)} className="bg-red-500 text-white p-2 rounded">-</button>
                                </div>
                            ))}
                            <button type="button" onClick={addRoute} className="mt-2 bg-gray-200 px-4 py-2 rounded text-sm">+ Add Route</button>
                        </div>
                    </div>
                    <div className="flex justify-end mt-6">
                        <button type="button" onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2">Cancel</button>
                        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const LocationMapView = ({ location, onBack }) => {
    const mapRef = useRef(null);
    const isLoaded = window.google && window.google.maps;

    useEffect(() => {
        if (isLoaded && mapRef.current) {
            const map = new window.google.maps.Map(mapRef.current, {
                center: { lat: location.lat, lng: location.lng },
                zoom: 17,
                disableDefaultUI: true,
            });
            new window.google.maps.Marker({
                position: { lat: location.lat, lng: location.lng },
                map: map,
                title: location.name,
            });
        }
    }, [isLoaded, location]);

    return (
        <div>
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-3xl font-bold">Viewing: {location.name}</h2>
                <button onClick={onBack} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Back to List</button>
            </div>
            <div ref={mapRef} className="w-full h-[600px] rounded-lg shadow-md">
                {!isLoaded && "Loading map..."}
            </div>
        </div>
    );
};


function AdminDashboard() {
    const [view, setView] = useState('dashboard');
    const [viewingLocation, setViewingLocation] = useState(null);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    const renderView = () => {
        if (viewingLocation) {
            return <LocationMapView location={viewingLocation} onBack={() => setViewingLocation(null)} />;
        }

        switch (view) {
            case 'users':
                return <ManageUsers />;
            case 'locations':
                return <ManageLocations onViewLocation={setViewingLocation} />;
            case 'dashboard':
            default:
                return <DashboardHome />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <div className="w-64 bg-gray-800 text-white p-5 flex flex-col">
                <h1 className="text-2xl font-bold mb-10">Admin Panel</h1>
                <nav className="flex flex-col space-y-2">
                    <a href="#" onClick={(e) => { e.preventDefault(); setView('dashboard'); setViewingLocation(null);}} className={`p-2 rounded ${view === 'dashboard' && !viewingLocation ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>Dashboard</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setView('users'); setViewingLocation(null);}} className={`p-2 rounded ${view === 'users' && !viewingLocation ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>Manage Users</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setView('locations'); setViewingLocation(null);}} className={`p-2 rounded ${view === 'locations' && !viewingLocation ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>Manage Locations</a>
                    <a href="#" className="p-2 rounded hover:bg-gray-700">Reports</a>
                </nav>
                <button 
                    onClick={handleSignOut} 
                    className="mt-auto w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                    Sign Out
                </button>
            </div>
            <div className="flex-1 p-10 overflow-y-auto">
                {renderView()}
            </div>
        </div>
    );
}


// --- Main App Screen (Map View) ---
function MapScreen() {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const [locations, setLocations] = useState([]);
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const userMarkerRef = useRef(null);
    const searchInputRef = useRef(null);
    const searchMarkerRef = useRef(null);
    const isScriptInjected = useRef(false);
    const markersRef = useRef([]); // Ref to hold the location markers

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };
    
    useEffect(() => {
        const loadMap = () => {
            if (window.google && window.google.maps) {
                setIsLoaded(true);
                return;
            }
            if (isScriptInjected.current) return;
            isScriptInjected.current = true;
            const script = document.createElement('script');
            script.id = 'google-maps-script';
            script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA2ndedv2-QOZ5mlwQRVaPxzhwrmpZrLrw`;
            script.async = true;
            script.defer = true;
            window.initMap = () => setIsLoaded(true);
            script.src += `&callback=initMap`;
            script.onerror = () => {
                setLoadError(new Error('Could not load Google Maps script.'));
                delete window.initMap;
            };
            document.head.appendChild(script);
        };
        loadMap();
    }, []);

    useEffect(() => {
        if (isLoaded && mapRef.current && !mapInstanceRef.current) {
            const center = { lat: 13.7563, lng: 100.5018 };
            const map = new window.google.maps.Map(mapRef.current, {
                center: center,
                zoom: 12,
                disableDefaultUI: true,
            });
            mapInstanceRef.current = map;
        }
    }, [isLoaded]);

    useEffect(() => {
        if (isLoaded && db) {
            const unsubscribe = onSnapshot(collection(db, "locations"), (snapshot) => {
                const locationsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setLocations(locationsData);
            });
            return () => unsubscribe();
        }
    }, [isLoaded]);


    useEffect(() => {
        if (isLoaded && mapInstanceRef.current) {
            // Clear existing markers
            markersRef.current.forEach(marker => marker.setMap(null));
            markersRef.current = [];

            // Add new markers
            locations.forEach(location => {
                const marker = new window.google.maps.Marker({
                    position: { lat: location.lat, lng: location.lng },
                    map: mapInstanceRef.current,
                    title: location.name,
                });
                markersRef.current.push(marker);
            });
        }
    }, [isLoaded, locations]);

    useEffect(() => {
        if (isLoaded && mapInstanceRef.current && searchInputRef.current && window.google && window.google.maps.places) {
            const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current);
            autocomplete.bindTo("bounds", mapInstanceRef.current);
            autocomplete.addListener("place_changed", () => {
                const place = autocomplete.getPlace();
                if (!place.geometry || !place.geometry.location) {
                    console.log("Returned place contains no geometry");
                    return;
                }
                const map = mapInstanceRef.current;
                if (place.geometry.viewport) {
                    map.fitBounds(place.geometry.viewport);
                } else {
                    map.setCenter(place.geometry.location);
                    map.setZoom(17);
                }
                if (searchMarkerRef.current) {
                    searchMarkerRef.current.setMap(null);
                }
                searchMarkerRef.current = new window.google.maps.Marker({
                    map,
                    position: place.geometry.location,
                    title: place.name,
                });
            });
        }
    }, [isLoaded]);

    const moveToCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                const currentLocation = { lat: latitude, lng: longitude };
                const map = mapInstanceRef.current;
                if (map) {
                    map.setCenter(currentLocation);
                    map.setZoom(16);
                    if (userMarkerRef.current) {
                        userMarkerRef.current.setMap(null);
                    }
                    userMarkerRef.current = new window.google.maps.Marker({
                        position: currentLocation,
                        map: map,
                        title: "Your Location",
                        icon: {
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: 8,
                            fillColor: "#4285F4",
                            fillOpacity: 1,
                            strokeColor: "white",
                            strokeWeight: 2,
                        },
                    });
                }
            }, (error) => {
                console.error("Error getting user location:", error);
                alert("ไม่สามารถเข้าถึงตำแหน่งปัจจุบันได้ กรุณาตรวจสอบการตั้งค่าเบราว์เซอร์");
            });
        } else {
            alert("เบราว์เซอร์ของคุณไม่รองรับ Geolocation");
        }
    };

    if (loadError) return <div className="flex items-center justify-center h-screen">{loadError.message}</div>;

    return (
        <div className="relative w-screen h-screen overflow-hidden">
            <div ref={mapRef} className="w-full h-full">
                {!isLoaded && <div className="flex items-center justify-center h-full">Loading Maps...</div>}
            </div>

            <div className={`absolute top-0 left-0 h-full bg-white shadow-lg z-30 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} w-80 p-6`}>
                 <div className="flex items-center space-x-4"><img src="https://placehold.co/50x50/E2E8F0/4A5568?text=AV" alt="User Avatar" className="w-14 h-14 rounded-full" /><div><h3 className="font-bold text-lg">ธันวา บุญสูงเนิน</h3><p className="text-sm text-gray-500">Joined 1 months ago</p></div></div>
                <p className="text-sm text-gray-600 mt-4">thetoyzinwza@gmail.com</p><div className="border-t my-6"></div>
                <nav className="space-y-4">
                    <div className="flex justify-between items-center"><label htmlFor="dark-mode" className="text-gray-700">Dark mode</label><div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in"><input type="checkbox" name="toggle" id="dark-mode" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/><label htmlFor="dark-mode" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label></div></div>
                    <a href="#" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg><span>Profile details</span></a>
                    <a href="#" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg><span>Settings</span></a>
                    <button onClick={handleSignOut} className="w-full flex items-center space-x-3 text-red-500 hover:text-red-700"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg><span>Log out</span></button>
                </nav>
            </div>
            {isMenuOpen && <div onClick={() => setMenuOpen(false)} className="absolute inset-0 bg-black bg-opacity-50 z-20"></div>}
            
            <div className="absolute inset-0 p-4 md:p-6 flex flex-col pointer-events-none">
                <div className="w-full flex justify-between items-start pointer-events-auto">
                    <button onClick={() => setMenuOpen(true)} className="bg-white p-3 rounded-full shadow-md text-gray-700 hover:bg-gray-100"><MenuIcon /></button>
                    <div className="text-center"><h1 className="text-4xl font-bold text-blue-600" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>EasyWay</h1></div>
                    <div className="w-12"></div>
                </div>
                <div className="mt-4 w-full max-w-lg mx-auto pointer-events-auto">
                    <div className="relative flex items-center bg-white rounded-full shadow-lg">
                        <input ref={searchInputRef} type="text" placeholder="Search..." className="w-full py-3 pl-5 pr-12 rounded-full focus:outline-none"/>
                        <button className="absolute right-2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"><SearchIcon /></button>
                    </div>
                </div>
                <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 flex flex-col space-y-2 pointer-events-auto">
                    <button onClick={moveToCurrentLocation} className="bg-white p-3 rounded-full shadow-md text-gray-700 hover:bg-gray-100"><GpsIcon /></button>
                    <div className="bg-white rounded-full shadow-md">
                        <button className="p-3 block text-gray-700 hover:bg-gray-100 rounded-t-full"><PlusIcon /></button><hr/>
                        <button className="p-3 block text-gray-700 hover:bg-gray-100 rounded-b-full"><MinusIcon /></button>
                    </div>
                     <div className="bg-white rounded-full shadow-md flex flex-col">
                        <button className="p-3 text-gray-700 hover:bg-blue-100"><CarIcon /></button><hr/>
                        <button className="p-3 text-blue-500 bg-blue-100"><MotorcycleIcon /></button>
                    </div>
                </div>
                <div className="absolute bottom-4 left-4 pointer-events-auto"><img src="https://placehold.co/120x80/ffffff/9CA3AF?text=Preview" alt="Map Preview" className="rounded-lg shadow-lg border-2 border-white" /></div>
            </div>
        </div>
    );
}

// --- App Main Component ---
export default function App() {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [view, setView] = useState('welcome');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                currentUser.getIdTokenResult()
                    .then((idTokenResult) => {
                        // Check for admin custom claim
                        setIsAdmin(!!idTokenResult.claims.admin);
                        setLoading(false);
                    })
                    .catch((error) => {
                        console.error("Error getting token claims: ", error);
                        setIsAdmin(false);
                        setLoading(false);
                    });
            } else {
                // User is signed out
                setIsAdmin(false);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    // Main routing logic
    if (user) {
        return isAdmin ? <AdminDashboard /> : <MapScreen />;
    }

    if (view === 'map') {
        return <MapScreen />;
    }

    switch (view) {
        case 'login':
            return <LoginScreen setView={setView} />;
        case 'signup':
            return <SignUpScreen setView={setView} />;
        case 'welcome':
        default:
            return <WelcomeScreen setView={setView} />;
    }
}

