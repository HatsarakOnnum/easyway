"use client";
import React, { useState, useRef, useEffect } from 'react';

// --- Firebase Initialization ---
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, onSnapshot, addDoc, doc, setDoc, deleteDoc, where, query, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "firebase/auth";

// ***** ⬇️⬇️⬇️ สำคัญมาก! คัดลอก Config ที่ถูกต้องจาก Firebase Console มาวางทับตรงนี้ทั้งหมด ⬇️⬇️⬇️ *****
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
// ***** ⬆️⬆️⬆️ สำคัญมาก! คัดลอก Config ที่ถูกต้องจาก Firebase Console มาวางทับตรงนี้ทั้งหมด ⬆️⬆️⬆️ *****

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);


// --- SVG Icons ---
const GoogleIcon = () => (<svg className="w-5 h-5 mr-2" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.222 0-9.612-3.87-11.188-8.864l-6.571 4.819A20 20 0 0 0 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C43.021 36.697 44 34.09 44 31.5c0-3.756-.768-7.297-2.109-10.552z"></path></svg>);
const EyeIcon = ({ closed }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">{closed ? (<><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" x2="22" y1="2" y2="22"></line></>) : (<><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></>)}</svg>);
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const GpsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v.01M12 12v.01M12 16v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const MinusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" /></svg>;
const MotorcycleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="5.5" cy="17.5" r="2.5"/><circle cx="18.5" cy="17.5" r="2.5"/>
        <path d="M15 17.5V9.5l-3.6-4.2c-.2-.2-.5-.3-.8-.3H5.5"/>
        <path d="m8 17.5 4-4"/><path d="M8 13h4.5"/>
    </svg>
);
const BusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
        <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
);
const AddPinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>
        <line x1="12" y1="7" x2="12" y2="13"></line><line x1="9" y1="10" x2="15" y2="10"></line>
    </svg>
);
const LikeIcon = ({ isLiked }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isLiked ? 'text-blue-600' : 'text-gray-700'}`} viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
    </svg>
);
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>;
const PriceIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 7h5a3 3 0 0 1 0 6H8V7z"></path>
        <path d="M8 13h5a3 3 0 0 1 0 6H8v-6z"></path>
        <path d="M12 4v16"></path>
    </svg>
);
const ReviewIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const StarIcon = ({ className, filled, half }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} viewBox="0 0 20 20" fill="currentColor">
        <defs><linearGradient id="half_grad"><stop offset="50%" stopColor="currentColor" /><stop offset="50%" stopColor="#d1d5db" stopOpacity="1" /></linearGradient></defs>
        <path fill={half ? "url(#half_grad)" : (filled ? "currentColor" : "none")} stroke="currentColor" strokeWidth="1" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);
const ReportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ImageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;


// --- Authentication Screens ---
function WelcomeScreen({ setView }) {
    return (
        <div className="relative w-full h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}>
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
            <div className="hidden lg:flex w-1/2 relative items-center justify-center"><img src="https://images.unsplash.com/photo-1562953510-621350a4d34f?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Driving with map" className="w-full h-full object-cover"/></div>
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
            const user = userCredential.user;
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                createdAt: new Date(),
                status: 'active'
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
            <div className="hidden lg:flex w-1/2 relative items-center justify-center"><img src="https://images.unsplash.com/photo-1611702859239-401736b47c05?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Person working on laptop" className="w-full h-full object-cover"/></div>
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
    const [searchTerm, setSearchTerm] = useState('');

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

    const handleToggleUserStatus = async (user) => {
        const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
        const actionVerb = newStatus === 'active' ? 'activate' : 'suspend';

        if (window.confirm(`Are you sure you want to ${actionVerb} user ${user.email}?`)) {
            const userRef = doc(db, "users", user.id);
            await updateDoc(userRef, { status: newStatus });
            alert(`User status changed in Firestore. IMPORTANT: This does NOT prevent the user from logging in. To fully ${actionVerb} a user, you must disable their account in the Firebase Authentication console or using the Admin SDK.`);
        }
    };

    const filteredUsers = users.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-3xl font-bold">Manage Users</h2>
                <div className="flex items-center space-x-4">
                    <input 
                        type="text"
                        placeholder="Search by email..."
                        className="px-4 py-2 border rounded-lg"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button onClick={() => handleOpenModal()} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Add User</button>
                </div>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created At</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{user.email}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{user.createdAt?.toDate().toLocaleString()}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {user.status || 'active'}
                                    </span>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                    <button onClick={() => handleOpenModal(user)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                    <button 
                                        onClick={() => handleToggleUserStatus(user)} 
                                        className={user.status === 'suspended' ? 'text-green-600 hover:text-green-900' : 'text-red-600 hover:text-red-900'}
                                    >
                                        {user.status === 'suspended' ? 'Activate' : 'Suspend'}
                                    </button>
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
            // Edit mode - Firestore only
            const userRef = doc(db, "users", currentUser.id);
            await updateDoc(userRef, { email: email });
            onClose();
        } else {
            // Add mode - Auth and Firestore
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
                    createdAt: new Date(),
                    status: 'active'
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
                                placeholder={currentUser ? "Password cannot be changed here" : ""}
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
    const [currentLocation, setCurrentLocation] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('approved');
    
    useEffect(() => {
        const q = query(collection(db, "locations"), where("status", "==", statusFilter));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const locsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setLocations(locsData);
        });
        return () => unsubscribe();
    }, [statusFilter]);

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
    
    const handleApprove = async (id) => {
        const locRef = doc(db, "locations", id);
        await setDoc(locRef, { status: 'approved' }, { merge: true });
    };

    const filteredLocations = locations.filter(loc => 
        loc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-3xl font-bold">Manage Locations</h2>
                <div className="flex items-center space-x-4">
                     <input 
                        type="text"
                        placeholder="Search by name..."
                        className="px-4 py-2 border rounded-lg"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button onClick={() => handleOpenModal()} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Add Location</button>
                </div>
            </div>
            
            <div className="mb-4 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setStatusFilter('approved')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${statusFilter === 'approved' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        Approved Locations
                    </button>
                    <button onClick={() => setStatusFilter('pending')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${statusFilter === 'pending' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        Pending Requests
                    </button>
                </nav>
            </div>


            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                     <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pin Name</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLocations.map(loc => (
                            <tr key={loc.id}>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{loc.name}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm capitalize">{loc.type}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                    <button onClick={() => onViewLocation(loc)} className="text-blue-600 hover:text-blue-900 mr-4">View</button>
                                    {statusFilter === 'pending' && (
                                         <button onClick={() => handleApprove(loc.id)} className="text-green-600 hover:text-green-900 mr-4">Approve</button>
                                    )}
                                    <button onClick={() => handleOpenModal(loc)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                    <button onClick={() => handleDelete(loc.id)} className="text-red-600 hover:text-red-900">Reject</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {isModalOpen && <LocationFormModal currentLocation={currentLocation} onClose={handleCloseModal} onSuccess={handleCloseModal}/>}
        </div>
    );
};

const ManageReports = () => {
    const [reports, setReports] = useState([]);

    useEffect(() => {
        const q = query(collection(db, "reports"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reportsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setReports(reportsData);
        });
        return () => unsubscribe();
    }, []);

    const handleStatusChange = async (reportId, newStatus) => {
        const reportRef = doc(db, "reports", reportId);
        await updateDoc(reportRef, { status: newStatus });
    };

    const handleDelete = async (reportId) => {
        if (window.confirm("Are you sure you want to delete this report?")) {
            await deleteDoc(doc(db, "reports", reportId));
        }
    };
    
    return (
        <div>
            <h2 className="text-3xl font-bold mb-5">Manage Reports</h2>
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location Name</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Report Details</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reported By</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map(report => (
                            <tr key={report.id}>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{report.locationName}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm max-w-xs break-words">{report.reportText}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{report.userEmail}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{report.createdAt?.toDate().toLocaleString()}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                    <select 
                                        value={report.status}
                                        onChange={(e) => handleStatusChange(report.id, e.target.value)}
                                        className={`p-1 rounded text-xs ${report.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="resolved">Resolved</option>
                                    </select>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                    <button onClick={() => handleDelete(report.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
            case 'reports':
                return <ManageReports />;
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
                    <a href="#" onClick={(e) => { e.preventDefault(); setView('reports'); setViewingLocation(null);}} className={`p-2 rounded ${view === 'reports' && !viewingLocation ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>Manage Reports</a>
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

const LocationFormModal = ({ currentLocation, onClose, initialCoords, onSuccess }) => {
    const [name, setName] = useState(currentLocation?.name || '');
    const [lat, setLat] = useState(currentLocation?.lat || initialCoords?.lat || '');
    const [lng, setLng] = useState(currentLocation?.lng || initialCoords?.lng || '');
    const [type, setType] = useState(currentLocation?.type || 'motorcycle');
    const [routes, setRoutes] = useState(currentLocation?.routes || [{ destination: '', price: '' }]);
    const [imageFile, setImageFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    
    const handleRouteChange = (index, field, value) => {
        const newRoutes = [...routes];
        newRoutes[index][field] = field === 'price' ? Number(value) : value;
        setRoutes(newRoutes);
    };

    const addRoute = () => setRoutes([...routes, { destination: '', price: '' }]);
    const removeRoute = (index) => setRoutes(routes.filter((_, i) => i !== index));
    
    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!imageFile && !currentLocation?.imageUrl) {
            setError("Please upload an image for the location.");
            return;
        }

        setUploading(true);
        let imageUrl = currentLocation?.imageUrl || '';

        try {
            if (imageFile) {
                const storageRef = ref(storage, `locations/${Date.now()}-${imageFile.name}`);
                const snapshot = await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(snapshot.ref);
            }

            const locationData = { 
                name, 
                lat: Number(lat), 
                lng: Number(lng), 
                type, 
                routes, 
                imageUrl,
                status: currentLocation?.status || 'pending', 
                submittedBy: auth.currentUser.uid 
            };
            
            if (currentLocation) {
                await setDoc(doc(db, "locations", currentLocation.id), locationData, { merge: true });
            } else {
                await addDoc(collection(db, "locations"), locationData);
            }

            onSuccess();
        } catch (err) {
            console.error("Error submitting location:", err);
            setError("Failed to submit location. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="relative mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white"
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit}>
                    <h3 className="text-xl font-bold mb-4">{currentLocation ? 'Edit Location' : 'Add New Location'}</h3>
                    {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                    <div className="space-y-4">
                        <div>
                            <label className="block">Pin Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded" required />
                        </div>
                        <div className="flex space-x-4">
                            <div className="w-1/2">
                                <label className="block">Latitude</label>
                                <input type="number" step="any" value={lat} onChange={e => setLat(e.target.value)} className="w-full px-3 py-2 border rounded bg-gray-100" readOnly required />
                            </div>
                            <div className="w-1/2">
                                <label className="block">Longitude</label>
                                <input type="number" step="any" value={lng} onChange={e => setLng(e.target.value)} className="w-full px-3 py-2 border rounded bg-gray-100" readOnly required />
                            </div>
                        </div>
                        <div>
                            <label className="block">Type</label>
                            <select value={type} onChange={e => setType(e.target.value)} className="w-full px-3 py-2 border rounded bg-white">
                                <option value="motorcycle">วินมอเตอร์ไซค์</option>
                                <option value="songthaew">สองแถว</option>
                            </select>
                        </div>
                        <div>
                           <label className="block">Location Image</label>
                           <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                           {imageFile && <p className="text-xs text-gray-500 mt-1">Selected: {imageFile.name}</p>}
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
                        <button type="submit" disabled={uploading} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-blue-300">
                            {uploading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

//--- ⭐⭐ Feature Components ⭐⭐ ---
const StarRatingDisplay = ({ rating = 0, count = 0 }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars.push(<StarIcon key={i} className="text-yellow-400" filled />);
        } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
            stars.push(<StarIcon key={i} className="text-yellow-400" half />);
        } else {
            stars.push(<StarIcon key={i} className="text-gray-300" filled />);
        }
    }
    return <div className="flex items-center">{stars} <span className="ml-2 text-sm text-gray-500">({count || 0} reviews)</span></div>;
};

const StarRatingInput = ({ rating, setRating }) => {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex space-x-1">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <label key={index}>
                        <input type="radio" name="rating" value={ratingValue} onClick={() => setRating(ratingValue)} className="hidden" />
                        <StarIcon 
                            className={`cursor-pointer transition-colors duration-200 ${ratingValue <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                            onMouseEnter={() => setHover(ratingValue)}
                            onMouseLeave={() => setHover(0)}
                            filled
                        />
                    </label>
                );
            })}
        </div>
    );
};

const ReviewsModal = ({ location, user, onClose }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newReviewText, setNewReviewText] = useState('');
    const [newRating, setNewRating] = useState(0);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!location) return;
        setLoading(true);
        const q = query(collection(db, "reviews"), where("locationId", "==", location.id));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reviewsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setReviews(reviewsData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [location]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!user) {
            setError("Please log in to submit a review.");
            return;
        }
        if (newRating === 0) {
            setError("Please select a star rating.");
            return;
        }
        if (newReviewText.trim() === '') {
            setError("Please write a review.");
            return;
        }

        setError('');

        const reviewData = {
            locationId: location.id,
            userId: user.uid,
            userEmail: user.email,
            rating: newRating,
            text: newReviewText,
            createdAt: new Date(),
        };
        await addDoc(collection(db, "reviews"), reviewData);

        const locationRef = doc(db, "locations", location.id);
        const newReviewCount = (location.reviewCount || 0) + 1;
        const newAvgRating = ((location.avgRating || 0) * (location.reviewCount || 0) + newRating) / newReviewCount;
        
        await setDoc(locationRef, {
            reviewCount: newReviewCount,
            avgRating: newAvgRating,
        }, { merge: true });

        setNewReviewText('');
        setNewRating(0);
    };

    return (
        <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Reviews for {location.name}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl font-bold">&times;</button>
                </div>
                <div className="p-4 overflow-y-auto">
                    {loading && <p>Loading reviews...</p>}
                    {!loading && reviews.length === 0 && <p className="text-gray-500">No reviews yet. Be the first to write one!</p>}
                    <div className="space-y-4">
                        {reviews.map(review => (
                            <div key={review.id} className="border-b pb-3 last:border-b-0">
                                <div className="flex items-center mb-1">
                                    <StarRatingDisplay rating={review.rating} />
                                    <p className="ml-auto text-sm text-gray-500">{review.createdAt.toDate().toLocaleDateString()}</p>
                                </div>
                                <p className="font-semibold text-sm">{review.userEmail.split('@')[0]}</p>
                                <p className="text-gray-700 mt-1">{review.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-4 border-t bg-gray-50">
                    <h3 className="font-bold text-lg mb-2">Write a Review</h3>
                    {user ? (
                        <form onSubmit={handleSubmitReview}>
                            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                            <div className="mb-2">
                                <StarRatingInput rating={newRating} setRating={setNewRating} />
                            </div>
                            <textarea
                                value={newReviewText}
                                onChange={(e) => setNewReviewText(e.target.value)}
                                className="w-full p-2 border rounded-md"
                                rows="3"
                                placeholder="Share your experience..."
                            ></textarea>
                            <button type="submit" className="mt-2 bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600">
                                Submit Review
                            </button>
                        </form>
                    ) : (
                        <p className="text-gray-600">You must be logged in to write a review.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const ReportModal = ({ location, user, onClose }) => {
    const [reportText, setReportText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        if (reportText.trim() === '') {
            setError('Please describe the issue.');
            return;
        }
        setError('');
        setIsSubmitting(true);

        try {
            await addDoc(collection(db, 'reports'), {
                locationId: location.id,
                locationName: location.name,
                reportText: reportText,
                userId: user.uid,
                userEmail: user.email,
                createdAt: serverTimestamp(),
                status: 'pending', // pending, resolved
            });
            alert('Report submitted successfully. Thank you!');
            onClose();
        } catch (err) {
            console.error('Error submitting report:', err);
            setError('Failed to submit report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Report an Issue</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl font-bold">&times;</button>
                </div>
                <form onSubmit={handleReportSubmit} className="p-4">
                    <p className="text-sm text-gray-600 mb-2">You are reporting an issue for: <span className="font-semibold">{location.name}</span></p>
                    <textarea
                        value={reportText}
                        onChange={(e) => setReportText(e.target.value)}
                        className="w-full p-2 border rounded-md"
                        rows="4"
                        placeholder="Please describe the problem (e.g., incorrect price, location closed, etc.)..."
                        required
                    ></textarea>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    <div className="flex justify-end mt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-300 mr-2">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600 disabled:bg-red-300">
                            {isSubmitting ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Main App Screen (Map View) ---
function MapScreen({ user }) {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const [locations, setLocations] = useState([]);
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const userMarkerRef = useRef(null);
    const isScriptInjected = useRef(false);
    const markersRef = useRef([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    
    const [pinningMode, setPinningMode] = useState(false);
    const [tempPin, setTempPin] = useState(null);
    const tempMarkerRef = useRef(null);
    const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState('');
    
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [showPrices, setShowPrices] = useState(false);
    const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [userLikes, setUserLikes] = useState(new Set());

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    useEffect(() => {
        if (!user) {
            setUserLikes(new Set());
            return;
        }
        const likesRef = collection(db, "users", user.uid, "likes");
        const unsubscribe = onSnapshot(likesRef, (snapshot) => {
            const likedIds = snapshot.docs.map(doc => doc.id);
            setUserLikes(new Set(likedIds));
        });
        return () => unsubscribe();
    }, [user]);

    const handleLike = async (location) => {
        if (!user) {
            alert("Please log in to like a location.");
            return;
        }
        const locationId = location.id;
        const locationRef = doc(db, "locations", locationId);
        const likeRef = doc(db, "users", user.uid, "likes", locationId);

        const isLiked = userLikes.has(locationId);
        
        // Optimistic UI updates
        const newLikes = new Set(userLikes);
        const currentLikeCount = location.likeCount || 0;
        
        if (isLiked) {
            newLikes.delete(locationId);
            setSelectedLocation({...location, likeCount: currentLikeCount - 1 });
        } else {
            newLikes.add(locationId);
            setSelectedLocation({...location, likeCount: currentLikeCount + 1 });
        }
        setUserLikes(newLikes);

        // Firestore updates
        if (isLiked) {
            await deleteDoc(likeRef);
            await updateDoc(locationRef, { likeCount: increment(-1) });
        } else {
            await setDoc(likeRef, { createdAt: new Date() });
            await updateDoc(locationRef, { likeCount: increment(1) });
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
            script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDCOw5hM4WqkOfqKElOqrZag0QAiJO68HY`;
            script.async = true;
            window.initMap = () => setIsLoaded(true);
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
            const map = new window.google.maps.Map(mapRef.current, {
                center: { lat: 13.7563, lng: 100.5018 },
                zoom: 12,
                disableDefaultUI: true,
                clickableIcons: !pinningMode,
                draggableCursor: pinningMode ? 'crosshair' : 'grab'
            });
            mapInstanceRef.current = map;
        } else if (mapInstanceRef.current) {
             mapInstanceRef.current.setOptions({
                clickableIcons: !pinningMode,
                draggableCursor: pinningMode ? 'crosshair' : 'grab'
            });
        }
    }, [isLoaded, pinningMode]);

    useEffect(() => {
        if (pinningMode && mapInstanceRef.current) {
            const listener = mapInstanceRef.current.addListener('click', (e) => {
                setTempPin({ lat: e.latLng.lat(), lng: e.latLng.lng() });
            });
            return () => window.google.maps.event.removeListener(listener);
        }
    }, [pinningMode, isLoaded]);

    useEffect(() => {
        if (tempMarkerRef.current) tempMarkerRef.current.setMap(null);
        if (tempPin && mapInstanceRef.current) {
            tempMarkerRef.current = new window.google.maps.Marker({
                position: tempPin,
                map: mapInstanceRef.current,
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: "#FF0000",
                    fillOpacity: 1,
                    strokeColor: "white",
                    strokeWeight: 2,
                },
            });
        }
    }, [tempPin]);

    useEffect(() => {
        if (!isLoaded) return;
        const q = query(collection(db, "locations"), where("status", "==", "approved"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const locationsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setLocations(locationsData);
        });
        return () => unsubscribe();
    }, [isLoaded]);

    useEffect(() => {
        if (!isLoaded || !mapInstanceRef.current) return;
        
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
        
        const filteredLocations = locations.filter(loc => filterType === 'all' || loc.type === filterType);

        filteredLocations.forEach(location => {
            const marker = new window.google.maps.Marker({
                position: { lat: location.lat, lng: location.lng },
                map: mapInstanceRef.current,
                title: location.name,
            });
            marker.addListener('click', () => {
                setSelectedLocation(location);
                setShowPrices(false);
            });
            markersRef.current.push(marker);
        });
    }, [isLoaded, locations, filterType]);
    
    const moveToCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                const currentLocation = { lat: latitude, lng: longitude };
                if (!mapInstanceRef.current) return;
                mapInstanceRef.current.setCenter(currentLocation);
                mapInstanceRef.current.setZoom(16);
                if (userMarkerRef.current) userMarkerRef.current.setMap(null);
                userMarkerRef.current = new window.google.maps.Marker({
                    position: currentLocation,
                    map: mapInstanceRef.current,
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
            }, (error) => alert("ไม่สามารถเข้าถึงตำแหน่งปัจจุบันได้"));
        } else {
            alert("เบราว์เซอร์ของคุณไม่รองรับ Geolocation");
        }
    };
    
    const handleSearchResultClick = (location) => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter({ lat: location.lat, lng: location.lng });
            mapInstanceRef.current.setZoom(17);
        }
        setSearchQuery('');
    };
    
    const searchResults = searchQuery ? locations.filter(loc => loc.name.toLowerCase().includes(searchQuery.toLowerCase())) : [];

    const handleConfirmPin = () => {
        setIsAddLocationModalOpen(true);
        setPinningMode(false);
        if (tempMarkerRef.current) tempMarkerRef.current.setMap(null);
    }
    
    const handleCancelPin = () => {
        setPinningMode(false);
        setTempPin(null);
        if (tempMarkerRef.current) tempMarkerRef.current.setMap(null);
    }

    const handleSubmissionSuccess = () => {
        setIsAddLocationModalOpen(false);
        setTempPin(null);
        setSubmissionStatus('waiting');
        setTimeout(() => setSubmissionStatus(''), 4000);
    };

    if (loadError) return <div className="flex items-center justify-center h-screen">{loadError.message}</div>;

    return (
        <div className="relative w-screen h-screen overflow-hidden">
            <div ref={mapRef} className="w-full h-full">
                {!isLoaded && <div className="flex items-center justify-center h-full">Loading Maps...</div>}
            </div>
            
            {selectedLocation && (
                <div className="absolute inset-0 z-40 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="p-5 border-b">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-bold">{selectedLocation.name}</h3>
                                    <StarRatingDisplay rating={selectedLocation.avgRating} count={selectedLocation.reviewCount} />
                                </div>
                                <button onClick={() => setSelectedLocation(null)} className="text-gray-500 hover:text-gray-800">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        </div>
                        
                        {showPrices ? (
                             <div className="p-5 max-h-64 h-64 overflow-y-auto">
                                <h4 className="font-semibold text-lg mb-3">Destinations & Prices</h4>
                                <ul>
                                    {selectedLocation.routes?.map((route, index) => (
                                        <li key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                                            <span>{route.destination}</span>
                                            <span className="font-semibold">{route.price} บาท</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                             <div className="w-full h-64 bg-gray-200">
                                 <img 
                                    src={selectedLocation.imageUrl || "https://placehold.co/600x400/cccccc/666666?text=Location+Image"} 
                                    alt={selectedLocation.name} 
                                    className="w-full h-full object-cover"
                                 />
                            </div>
                        )}

                        <div className="p-3 grid grid-cols-4 gap-2 border-t bg-gray-50">
                            <button 
                                onClick={() => handleLike(selectedLocation)}
                                className="flex flex-col items-center justify-center hover:bg-gray-200 rounded-md p-1 transition-colors"
                            >
                                <LikeIcon isLiked={userLikes.has(selectedLocation.id)} />
                                <span className={`text-xs font-semibold ${userLikes.has(selectedLocation.id) ? 'text-blue-600' : 'text-gray-700'}`}>
                                    {selectedLocation.likeCount || 0}
                                </span>
                            </button>
                            <button onClick={() => setIsReviewsModalOpen(true)} className="flex flex-col items-center justify-center text-gray-700 hover:bg-gray-200 rounded-md p-1 transition-colors">
                                <ReviewIcon /> 
                                <span className="text-xs">Review</span>
                            </button>
                             <button onClick={() => setShowPrices(prev => !prev)} className="flex flex-col items-center justify-center text-gray-700 hover:bg-gray-200 rounded-md p-1 transition-colors">
                                {showPrices ? <ImageIcon /> : <PriceIcon />}
                                <span className="text-xs">{showPrices ? 'Info' : 'Prices'}</span>
                            </button>
                            <button onClick={() => {if (user) {setIsReportModalOpen(true)} else {alert('Please log in to report.')}}} className="flex flex-col items-center justify-center text-gray-700 hover:bg-gray-200 rounded-md p-1 transition-colors">
                                <ReportIcon />
                                <span className="text-xs">Report</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isReviewsModalOpen && selectedLocation && (
                <ReviewsModal 
                    location={selectedLocation} 
                    user={user} 
                    onClose={() => setIsReviewsModalOpen(false)} 
                />
            )}

             {isReportModalOpen && selectedLocation && (
                <ReportModal
                    location={selectedLocation}
                    user={user}
                    onClose={() => setIsReportModalOpen(false)}
                />
            )}

            {pinningMode && (
                <div className="absolute top-0 left-0 right-0 p-4 bg-blue-600 text-white text-center z-20 flex justify-center items-center shadow-lg">
                    <p className="font-semibold text-lg">
                        {tempPin ? 'You have selected a location. Confirm or Cancel below.' : 'Click on the map to place a new pin.'}
                    </p>
                    <button onClick={handleCancelPin} className="ml-6 bg-white text-blue-600 font-bold py-1 px-4 rounded-full text-sm hover:bg-blue-100">Cancel</button>
                </div>
            )}
            
            {tempPin && (
                 <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex space-x-4">
                    <button onClick={handleConfirmPin} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 text-lg rounded-full shadow-lg">Confirm Pin</button>
                    <button onClick={handleCancelPin} className="bg-white hover:bg-gray-100 text-gray-700 font-bold py-3 px-8 text-lg rounded-full shadow-lg">Cancel</button>
                </div>
            )}
            
            {isAddLocationModalOpen && (
                <LocationFormModal 
                    initialCoords={tempPin}
                    onSuccess={handleSubmissionSuccess}
                    onClose={() => {
                        setIsAddLocationModalOpen(false);
                        setTempPin(null);
                    }} 
                />
            )}

            {submissionStatus === 'waiting' && (
                <div className="absolute inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center">
                    <div className="text-center p-8">
                        <h2 className="text-2xl font-bold text-gray-800">Waiting for approval</h2>
                        <p className="text-gray-600 mt-2">Your new location has been submitted and is waiting for an admin to approve it.</p>
                    </div>
                </div>
            )}
            
             {searchQuery.length > 0 && (
                <div className="absolute top-0 right-0 h-full w-96 bg-white z-40 shadow-lg p-6 flex flex-col">
                    <div className="relative flex items-center mb-4">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon/></span>
                        <input
                            type="text"
                            className="w-full pl-10 pr-10 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                         <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <ul className="space-y-2">
                        {searchResults.map((loc) => (
                            <li 
                                key={loc.id} 
                                className="flex items-center p-3 hover:bg-gray-100 cursor-pointer rounded-lg"
                                onClick={() => handleSearchResultClick(loc)}
                            >
                                <div className="mr-3 text-gray-400">
                                    {loc.type === 'motorcycle' ? <MotorcycleIcon/> : <BusIcon/>}
                                </div>
                                <span className="text-gray-700">{loc.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}


            <div className={`absolute top-0 left-0 h-full bg-white shadow-lg z-30 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} w-80 p-6`}>
                 <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl font-bold">
                        {user ? user.email.charAt(0).toUpperCase() : 'G'}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{user?.displayName || user?.email.split('@')[0] || "Guest"}</h3>
                        <p className="text-sm text-gray-500">
                             {user?.metadata?.creationTime ? `Joined ${new Date(user.metadata.creationTime).toLocaleDateString()}` : ''}
                        </p>
                    </div>
                </div>
                <p className="text-sm text-gray-600 mt-4 break-words">{user?.email}</p>
                <div className="border-t my-6"></div>
                <nav className="space-y-4">
                    <div className="flex justify-between items-center"><label htmlFor="dark-mode" className="text-gray-700">Dark mode</label><div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in"><input type="checkbox" name="toggle" id="dark-mode" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/><label htmlFor="dark-mode" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label></div></div>
                    <a href="#" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg><span>Profile details</span></a>
                    <a href="#" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg><span>Settings</span></a>
                    <button onClick={handleSignOut} className="w-full flex items-center space-x-3 text-red-500 hover:text-red-700"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg><span>Log out</span></button>
                </nav>
            </div>
            {isMenuOpen && <div onClick={() => setMenuOpen(false)} className="absolute inset-0 z-20" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}></div>}
            
            <div className="absolute inset-0 p-4 md:p-6 flex flex-col pointer-events-none">
                <div className="w-full flex justify-between items-start pointer-events-auto">
                    <button onClick={() => setMenuOpen(true)} className="bg-white p-3 rounded-full shadow-md text-gray-700 hover:bg-gray-100"><MenuIcon /></button>
                    <div className="text-center"><h1 className="text-4xl font-bold text-blue-600" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>EasyWay</h1></div>
                    <div className="w-12"></div>
                </div>
                <div className="mt-4 w-full max-w-lg mx-auto pointer-events-auto">
                    <div className="relative flex items-center bg-white rounded-full shadow-lg">
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            className="w-full py-3 pl-5 pr-12 rounded-full focus:outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                         />
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
                        <button onClick={() => setFilterType(prev => prev === 'songthaew' ? 'all' : 'songthaew')} className={`p-3 rounded-t-full ${filterType === 'songthaew' ? 'bg-blue-100 text-blue-500' : 'text-gray-700 hover:bg-gray-100'}`}><BusIcon /></button><hr/>
                        <button onClick={() => setFilterType(prev => prev === 'motorcycle' ? 'all' : 'motorcycle')} className={`p-3 rounded-b-full ${filterType === 'motorcycle' ? 'bg-blue-100 text-blue-500' : 'text-gray-700 hover:bg-gray-100'}`}><MotorcycleIcon /></button>
                    </div>
                </div>
                <div className="absolute bottom-4 left-4 pointer-events-auto">
                    {user && !pinningMode && (
                        <button onClick={() => setPinningMode(true)} className="bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600">
                            <AddPinIcon />
                        </button>
                    )}
                </div>
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
                        setIsAdmin(!!idTokenResult.claims.admin);
                        setLoading(false);
                    })
                    .catch((error) => {
                        console.error("Error getting token claims: ", error);
                        setIsAdmin(false);
                        setLoading(false);
                    });
            } else {
                setIsAdmin(false);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (user) {
        return isAdmin ? <AdminDashboard /> : <MapScreen user={user} />;
    }

    if (view === 'map') {
        return <MapScreen user={null} />;
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