"use client";
import React, { useState, useEffect } from 'react';
import { db } from '@/app/firebase/firebase';
import { collection, query, onSnapshot, doc, updateDoc } from "firebase/firestore";
import UserFormModal from './UserFormModal'; // (คุณต้องสร้างไฟล์นี้ด้วย)

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const q = query(collection(db, "users"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
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

        if (window.confirm(`Are you sure you want to ${actionVerb} user ${user.email}? This only changes status in DB.`)) {
            const userRef = doc(db, "users", user.id);
            try {
                await updateDoc(userRef, { status: newStatus });
                alert(`User status updated to '${newStatus}' in Firestore.`);
            } catch (error) {
                console.error("Error updating user status:", error);
                alert(`Failed to update status. See console.`);
            }
        }
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="dark:text-gray-200">
            {/* ... (JSX ของ ManageUsers) ... */}
        </div>
    );
};