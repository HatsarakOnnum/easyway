"use client";
import React, { useState, useRef, useEffect } from 'react';

// --- 1. Import Firebase Services ---
// (ใช้ @/app/firebase/firebase หรือ path ตรงก็ได้ ถ้า @/ ใช้ไม่ได้จากไฟล์นี้)
import { auth, db } from '@/app/firebase/firebase'; 
import { signOut } from "firebase/auth";
import { 
    collection, query, where, onSnapshot, 
    doc, updateDoc, deleteDoc, setDoc, 
    increment, serverTimestamp 
} from "firebase/firestore";

// --- 2. Import Icons (จากไฟล์ Icons.jsx) ---
import {
    TargetIcon, FullScreenIcon, MenuIcon, SearchIcon, PlusIcon, MinusIcon,
    MotorcycleIcon, BusIcon, AddPinIcon, LikeIcon, PriceIcon, ReviewIcon, 
    ImageIcon, ReportIcon
} from '@/app/components/ui/Icons';

// --- 3. Import Modals & Components (จากไฟล์ย่อย) ---
import ReviewsModal from '@/app/components/reviews/ReviewsModal';
import ReportModal from '@/app/components/locations/ReportModal';
import ImageModal from '@/app/components/ui/ImageModal';
import ProfileModal from '@/app/components/profile/ProfileModal';
import LocationFormModal from '@/app/components/locations/LocationFormModal';
import { StarRatingDisplay } from '@/app/components/reviews/StarRating';

// --- 4. โค้ด MapScreen Component ---
export default function MapScreen({ user, setView, darkMode, toggleDarkMode }) {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const [locations, setLocations] = useState([]);
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const userMarkerRef = useRef(null);
    const markersRef = useRef([]);
    const isScriptInjected = useRef(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [pinningMode, setPinningMode] = useState(false);
    const [tempPin, setTempPin] = useState(null);
    const tempMarkerRef = useRef(null);
    const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState('');
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [localSelectedLocation, setLocalSelectedLocation] = useState(null);
    const [showPrices, setShowPrices] = useState(false);
    const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [fullImageUrl, setFullImageUrl] = useState('');
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [userLikes, setUserLikes] = useState(new Set());

    // --- 5. โค้ด Logic ทั้งหมด (useEffects, handleFunctions) ---
    // (คัดลอกโค้ด Logic เดิมทั้งหมดของ MapScreen มาวางที่นี่)
    
    useEffect(() => { 
        // อัปเดต localSelectedLocation เมื่อ selectedLocation เปลี่ยน
        // (เราใช้ onSnapshot ด้านล่างมาอัปเดตแทนแล้ว อาจจะไม่จำเป็น)
        // setLocalSelectedLocation(selectedLocation); 
    }, [selectedLocation]);

    const handleSignOut = async () => { try { await signOut(auth); } catch (error) { console.error("Sign out error: ", error); } };
    
    useEffect(() => { 
        if (!user) { 
            setUserLikes(new Set()); 
            return; 
        } 
        const likesRef = collection(db, "users", user.uid, "likes"); 
        const unsubscribe = onSnapshot(likesRef, (snapshot) => { 
            setUserLikes(new Set(snapshot.docs.map(doc => doc.id))); 
        }); 
        return () => unsubscribe(); 
    }, [user]);

    const handleLike = async (location) => { 
        if (!user) { alert("Log in to like."); return; } 
        if (!location || !location.id) return; 
        const locationId = location.id; 
        const locationRef = doc(db, "locations", locationId); 
        const likeRef = doc(db, "users", user.uid, "likes", locationId); 
        const isLiked = userLikes.has(locationId); 
        const newLikes = new Set(userLikes); 
        const currentCount = localSelectedLocation?.likeCount || locations.find(l => l.id === locationId)?.likeCount || 0; 
        
        let updatedCount; 
        if (isLiked) { 
            newLikes.delete(locationId); 
            updatedCount = Math.max(0, currentCount - 1); // ป้องกันติดลบ
        } else { 
            newLikes.add(locationId); 
            updatedCount = currentCount + 1; 
        } 
        
        // อัปเดต UI ทันที
        setLocalSelectedLocation(prev => prev ? { ...prev, likeCount: updatedCount } : null); 
        setUserLikes(newLikes); 
        
        // อัปเดต Firestore
        try { 
            if (isLiked) { 
                await deleteDoc(likeRef); 
                await updateDoc(locationRef, { likeCount: increment(-1) }); 
            } else { 
                await setDoc(likeRef, { createdAt: serverTimestamp() }); 
                await updateDoc(locationRef, { likeCount: increment(1) }); 
            } 
        } catch (error) { 
            console.error("Like error:", error); 
            // ย้อน State กลับถ้า Error
            setUserLikes(userLikes); 
            setLocalSelectedLocation(location); 
            alert("Failed to update like."); 
        } 
    };

    // --- Map Loading Logic ---
    useEffect(() => {
        const loadMapScript = () => {
            if (window.google?.maps || isScriptInjected.current) {
                if (window.google?.maps) setIsLoaded(true);
                return;
            }

            console.log("Injecting Google Maps script...");
            isScriptInjected.current = true;
            const script = document.createElement('script');
            script.id = 'google-maps-script';
            script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDCOw5hM4WqkOfqKElOqrZag0QAiJO68HY&libraries=places&callback=initMap`;
            script.async = true;
            script.defer = true;

            window.initMap = () => {
                console.log("window.initMap called.");
                setIsLoaded(true);
            };

            script.onerror = (e) => {
                console.error("Google Maps script failed to load:", e);
                setLoadError(new Error('Could not load Google Maps script.'));
                delete window.initMap;
                isScriptInjected.current = false;
            };
            document.head.appendChild(script);
        };

        loadMapScript();
    }, []); 

    // --- Map Initialization ---
    useEffect(() => {
        if (isLoaded && mapRef.current && !mapInstanceRef.current) {
            console.log("Initializing map instance...");
            try {
                const map = new window.google.maps.Map(mapRef.current, {
                    center: { lat: 13.7563, lng: 100.5018 },
                    zoom: 12,
                    disableDefaultUI: true,
                    clickableIcons: !pinningMode,
                    draggableCursor: pinningMode ? 'crosshair' : 'grab'
                });
                mapInstanceRef.current = map;
            } catch (error) {
                console.error("Error creating map instance:", error);
                setLoadError(new Error("Failed to create map instance."));
            }
        }
        return () => { mapInstanceRef.current = null; };
    }, [isLoaded, pinningMode]);

    // --- Fetching Locations ---
    useEffect(() => {
        if (!isLoaded) return;
        const q = query(collection(db, "locations"), where("status", "==", "approved"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setLocations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => { console.error("Error fetching locations: ", error); setLoadError(new Error("Could not fetch locations.")) });
        return () => unsubscribe();
    }, [isLoaded]);

    // --- Drawing Markers ---
    useEffect(() => {
        if (!isLoaded || !mapInstanceRef.current) return;
        console.log("Marker Drawing Effect: RUNNING. Pinning Mode:", pinningMode, "Filter:", filterType);
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
        const filtered = locations.filter(loc => filterType === 'all' || loc.type === filterType);
        filtered.forEach(location => {
            const marker = new window.google.maps.Marker({
                position: { lat: location.lat, lng: location.lng },
                map: mapInstanceRef.current,
                title: location.name,
            });
            marker.addListener('click', () => { setSelectedLocation(location); setShowPrices(false); });
            markersRef.current.push(marker);
        });
        console.log(`Marker Drawing Effect: Added ${filtered.length} markers.`);
        return () => { markersRef.current.forEach(marker => marker?.setMap(null)); };
    }, [isLoaded, locations, filterType, pinningMode]);

    // --- Pinning Click Listener ---
    useEffect(() => {
        let listener = null;
        if (pinningMode && mapInstanceRef.current) {
            listener = mapInstanceRef.current.addListener('click', (e) => {
                if (e.placeId) return;
                setTempPin({ lat: e.latLng.lat(), lng: e.latLng.lng() });
            });
        }
        return () => { if (listener && window.google?.maps) google.maps.event.removeListener(listener); };
    }, [pinningMode, isLoaded]); // (isLoaded อาจจะไม่จำเป็น แต่ใส่ไว้กันพลาด)

    // --- TempPin Marker Display ---
    useEffect(() => {
        if (tempPin && mapInstanceRef.current && window.google?.maps) { // เพิ่ม check google.maps
            if (!tempMarkerRef.current) {
                tempMarkerRef.current = new window.google.maps.Marker({
                    position: tempPin, 
                    map: mapInstanceRef.current, 
                    icon: { 
                        path: window.google.maps.SymbolPath.CIRCLE, 
                        scale: 10, 
                        fillColor: "#FF0000", 
                        fillOpacity: 1, 
                        strokeColor: "white", 
                        strokeWeight: 2 
                    },
                });
            } else {
                tempMarkerRef.current.setPosition(tempPin);
                tempMarkerRef.current.setMap(mapInstanceRef.current);
            }
        } else if (tempMarkerRef.current) {
            tempMarkerRef.current.setMap(null);
        }
        return () => { tempMarkerRef.current?.setMap(null); };
    }, [tempPin, isLoaded]); // เพิ่ม isLoaded

    // --- Real-time Update for Selected Location ---
    useEffect(() => {
        let unsubscribe = null;
        if (!selectedLocation?.id || !isLoaded) {
            setLocalSelectedLocation(null); // เคลียร์ modal ถ้าไม่มีการเลือก
            return;
        }
        
        const locationRef = doc(db, "locations", selectedLocation.id);
        unsubscribe = onSnapshot(locationRef, (docSnap) => {
            if (docSnap.exists()) {
                const updatedData = { id: docSnap.id, ...docSnap.data() };
                setLocalSelectedLocation(updatedData); // อัปเดต Modal
                // setSelectedLocation(updatedData); // *** ระวัง: บรรทัดนี้อาจทำให้เกิด Loop ถ้า selectedLocation.id อยู่ใน deps
            } else {
                setSelectedLocation(null); // ปิด Modal ถ้าเอกสารถูกลบ
                setLocalSelectedLocation(null);
            }
        }, (error) => {
            console.error("Error reading selected location:", error);
        });
    
        return () => { if (unsubscribe) unsubscribe(); };
        
    }, [isLoaded, selectedLocation?.id]); // ทำงานเมื่อ ID เปลี่ยน


    // --- Other Functions ---
    const moveToCurrentLocation = () => { /* ... (โค้ดเดิม) ... */ };
    const handleSearchResultClick = (location) => { /* ... (โค้ดเดิม) ... */ };
    const searchResults = searchQuery ? locations.filter(loc => loc.name.toLowerCase().includes(searchQuery.toLowerCase())) : [];
    const handleConfirmPin = () => { setIsAddLocationModalOpen(true); setPinningMode(false); tempMarkerRef.current?.setMap(null); }
    
    const handleCancelPin = () => {
        if (tempPin) {
            console.log("handleCancelPin: Removing temp pin, staying in pinning mode.");
            setTempPin(null);
        } else {
            console.log("handleCancelPin: Exiting pinning mode.");
            setPinningMode(false);
        }
    };

    const handleSubmissionSuccess = () => { setIsAddLocationModalOpen(false); setTempPin(null); setSubmissionStatus('waiting'); setTimeout(() => setSubmissionStatus(''), 4000); };
    const handleZoomIn = () => { if (mapInstanceRef.current) { mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + 1); } };
    const handleZoomOut = () => { if (mapInstanceRef.current) { mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() - 1); } };
    const openImageModal = (url) => { if (!url) return; setFullImageUrl(url); setIsImageModalOpen(true); };

    if (loadError) return <div className="flex items-center justify-center h-screen dark:bg-gray-900 text-red-500 dark:text-red-400 p-4 text-center">{loadError.message}</div>;

    // --- 6. JSX Return ---
    return (
        <div className="relative w-screen h-screen overflow-hidden">
            {/* Map Container */}
            <div ref={mapRef} className="w-full h-full bg-gray-300 dark:bg-gray-700">
                {!isLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-400/50 dark:bg-gray-900/50 z-10">
                        <span className="text-white dark:text-gray-200 text-lg font-semibold animate-pulse">Loading Map Script...</span>
                    </div>
                 )}
            </div>

            {/* Selected Location Modal */}
            {localSelectedLocation && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => {setSelectedLocation(null); /* setLocalSelectedLocation(null); */ }}> {/* setLocalSelectedLocation ถูกจัดการโดย onSnapshot แล้ว */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="p-5 border-b dark:border-gray-700">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-bold dark:text-white">{localSelectedLocation.name}</h3>
                                    <StarRatingDisplay rating={localSelectedLocation.avgRating} count={localSelectedLocation.reviewCount} />
                                </div>
                                <button onClick={() => {setSelectedLocation(null); /* setLocalSelectedLocation(null); */}} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        </div>
                        {showPrices ? (
                            <div className="p-5 max-h-64 h-64 overflow-y-auto dark:text-gray-300">
                                <h4 className="font-semibold text-lg mb-3 dark:text-white">Prices</h4>
                                <ul>
                                    {localSelectedLocation.routes?.map((route, index) => (
                                        <li key={index} className="flex justify-between items-center py-2 border-b dark:border-gray-700 last:border-b-0">
                                            <span>{route.destination}</span>
                                            <span className="font-semibold">{route.price} บาท</span>
                                        </li>
                                    ))}
                                    {(!localSelectedLocation.routes || localSelectedLocation.routes.length === 0) && <p className="text-gray-500 dark:text-gray-400">No prices.</p>}
                                </ul>
                            </div>
                        ) : (
                            <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 relative">
                                <img src={localSelectedLocation.imageUrl || "https://placehold.co/600x400?text=Image"} alt={localSelectedLocation.name} className="w-full h-full object-cover cursor-pointer" onClick={() => openImageModal(localSelectedLocation.imageUrl)} />
                                {localSelectedLocation.imageUrl && (
                                    <button onClick={() => openImageModal(localSelectedLocation.imageUrl)} className="absolute bottom-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70" title="View full screen">
                                        <FullScreenIcon />
                                    </button>
                                )}
                            </div>
                        )}
                        <div className="p-3 grid grid-cols-4 gap-2 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                            <button onClick={() => handleLike(localSelectedLocation)} className="flex flex-col items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md p-1">
                                <LikeIcon isLiked={userLikes.has(localSelectedLocation.id)} />
                                <span className={`text-xs font-semibold ${userLikes.has(localSelectedLocation.id) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>{localSelectedLocation.likeCount || 0}</span>
                            </button>
                            <button onClick={() => setIsReviewsModalOpen(true)} className="flex flex-col items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md p-1">
                                <ReviewIcon /><span className="text-xs">Review</span>
                            </button>
                            <button onClick={() => setShowPrices(prev => !prev)} className="flex flex-col items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md p-1">
                                {showPrices ? <ImageIcon /> : <PriceIcon />}
                                <span className="text-xs">{showPrices ? 'Info' : 'Prices'}</span>
                            </button>
                            <button onClick={() => {if (user) {setIsReportModalOpen(true)} else {alert('Log in to report.')}}} className="flex flex-col items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md p-1">
                                <ReportIcon /><span className="text-xs">Report</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Other Modals */}
            {isReviewsModalOpen && selectedLocation && (<ReviewsModal location={selectedLocation} user={user} onClose={() => setIsReviewsModalOpen(false)} />)}
            {isReportModalOpen && selectedLocation && user && (<ReportModal location={selectedLocation} user={user} onClose={() => setIsReportModalOpen(false)} />)}
            {isImageModalOpen && (<ImageModal imageUrl={fullImageUrl} onClose={() => setIsImageModalOpen(false)} />)}
            {isProfileModalOpen && user && (<ProfileModal user={user} onClose={() => setIsProfileModalOpen(false)} />)}

            {/* Pinning UI */}
            {pinningMode && (<div className="absolute top-0 left-0 right-0 p-4 bg-blue-600 text-white text-center z-20 flex justify-center items-center shadow-lg"><p className="font-semibold text-lg">{tempPin ? 'Location selected. Confirm or Cancel.' : 'Click map to place pin.'}</p><button onClick={handleCancelPin} className="ml-6 bg-white text-blue-600 font-bold py-1 px-4 rounded-full text-sm hover:bg-blue-100">Cancel</button></div>)}
            {tempPin && (<div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex space-x-4"><button onClick={handleConfirmPin} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 text-lg rounded-full shadow-lg">Confirm Pin</button><button onClick={handleCancelPin} className="bg-white hover:bg-gray-100 text-gray-700 font-bold py-3 px-8 text-lg rounded-full shadow-lg">Cancel</button></div>)}
            {isAddLocationModalOpen && (<LocationFormModal initialCoords={tempPin} onSuccess={handleSubmissionSuccess} onClose={() => { setIsAddLocationModalOpen(false); setTempPin(null); }} />)}
            {submissionStatus === 'waiting' && (<div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 z-50 flex items-center justify-center" onClick={() => setSubmissionStatus('')}><div className="text-center p-8"><h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Waiting for approval</h2><p className="text-gray-600 dark:text-gray-400 mt-2">Submitted, waiting for admin approval.</p></div></div>)}

            {/* Search Results Panel */}
            {searchQuery.length > 0 && (
                <div className="absolute top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-gray-800 z-30 shadow-lg p-6 flex flex-col">
                    <div className="relative flex items-center mb-4">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"><SearchIcon/></span>
                        <input type="text" className="w-full pl-10 pr-10 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none dark:bg-gray-700 dark:text-gray-100" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." autoFocus />
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <ul className="space-y-2 overflow-y-auto">
                        {searchResults.map((loc) => (
                            <li key={loc.id} className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-lg" onClick={() => handleSearchResultClick(loc)}>
                                <div className="mr-3 text-gray-400 dark:text-gray-500">{loc.type === 'motorcycle' ? <MotorcycleIcon/> : <BusIcon/>}</div>
                                <span className="text-gray-700 dark:text-gray-200">{loc.name}</span>
                            </li>
                        ))}
                        {searchResults.length === 0 && <p className="text-gray-500 dark:text-gray-400 text-center py-4">No results.</p>}
                    </ul>
                </div>
            )}

            {/* User Menu Panel */}
            <div className={`absolute top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-lg z-30 transform transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} w-80 p-6`}>
                <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-2xl font-bold">
                        {user ? (user.displayName || user.email)?.charAt(0).toUpperCase() : 'G'}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg dark:text-white">{user?.displayName || user?.email?.split('@')[0] || "Guest"}</h3>
                        {user && <p className="text-sm text-gray-500 dark:text-gray-400">Joined {new Date(user.metadata.creationTime).toLocaleDateString()}</p>}
                    </div>
                </div>
                {user && <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 break-words">{user.email}</p>}
                <div className="border-t dark:border-gray-700 my-6"></div>
                <nav className="space-y-4">
                    {/* Dark Mode Toggle */}
                    <div className="flex justify-between items-center">
                        <label htmlFor="dark-mode" className="text-gray-700 dark:text-gray-300">Dark mode</label>
                        <div className="relative inline-block w-10 mr-2 align-middle select-none">
                            <input type="checkbox" name="toggle" id="dark-mode" checked={darkMode} onChange={toggleDarkMode} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white dark:bg-gray-900 border-4 dark:border-gray-700 appearance-none cursor-pointer checked:right-0 checked:border-blue-600 dark:checked:border-blue-400"/>
                            <label htmlFor="dark-mode" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 dark:bg-gray-700 cursor-pointer"></label>
                        </div>
                    </div>
                    {/* Profile Button */}
                    {user && (
                        <button onClick={() => {setIsProfileModalOpen(true); setMenuOpen(false);}} className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 w-full text-left">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            <span>Profile</span>
                        </button>
                    )}
                    {/* Logout / Login Button */}
                    {user ? (
                        <button onClick={handleSignOut} className="w-full flex items-center space-x-3 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            <span>Log out</span>
                        </button>
                    ) : (
                        <button onClick={() => setView('welcome')} className="w-full flex items-center space-x-3 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                            <span>Login / Sign Up</span>
                        </button>
                    )}
                </nav>
            </div>
            {isMenuOpen && <div onClick={() => setMenuOpen(false)} className="absolute inset-0 z-20 bg-black/40"></div>}

            {/* Map Controls Overlay */}
            <div className="absolute inset-0 p-4 md:p-6 flex flex-col pointer-events-none">
                <div className="w-full flex justify-between items-start pointer-events-auto">
                    <button onClick={() => setMenuOpen(true)} className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"><MenuIcon /></button>
                    <div className="text-center"><h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.3)' }}>EasyWay</h1></div>
                    <div className="w-12"></div>
                </div>
                <div className="mt-4 w-full max-w-lg mx-auto pointer-events-auto">
                    <div className="relative flex items-center bg-white dark:bg-gray-800 rounded-full shadow-lg">
                        <input type="text" placeholder="Search..." className="w-full py-3 pl-5 pr-12 rounded-full focus:outline-none dark:bg-gray-800 dark:text-gray-100" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        <button className="absolute right-2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"><SearchIcon /></button>
                    </div>
                </div>
                <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 flex flex-col space-y-2 pointer-events-auto">
                    <button onClick={moveToCurrentLocation} className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"><TargetIcon /></button>
                    <div className="bg-white dark:bg-gray-800 rounded-full shadow-md">
                        <button onClick={handleZoomIn} className="p-3 block text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-full"><PlusIcon /></button>
                        <hr className="dark:border-gray-600"/>
                        <button onClick={handleZoomOut} className="p-3 block text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-full"><MinusIcon /></button>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-full shadow-md flex flex-col">
                        <button onClick={() => setFilterType(prev => prev === 'songthaew' ? 'all' : 'songthaew')} className={`p-3 rounded-t-full ${filterType === 'songthaew' ? 'bg-blue-100 dark:bg-blue-900 text-blue-500 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}><BusIcon /></button>
                        <hr className="dark:border-gray-600"/>
                        <button onClick={() => setFilterType(prev => prev === 'motorcycle' ? 'all' : 'motorcycle')} className={`p-3 rounded-b-full ${filterType === 'motorcycle' ? 'bg-blue-100 dark:bg-blue-900 text-blue-500 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}><MotorcycleIcon /></button>
                    </div>
                </div>
                <div className="absolute bottom-4 left-4 pointer-events-auto">
                    {user && !pinningMode && (
                        <button onClick={() => setPinningMode(true)} className="bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600"><AddPinIcon /></button>
                    )}
                </div>
            </div>
        </div>
    );
}