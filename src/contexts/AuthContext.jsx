import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendEmailVerification,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

// Admin emails - users with these emails automatically get admin role
const ADMIN_EMAILS = ['rehan@gmail.com'];

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                try {
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        // Auto-promote admin emails if not already admin
                        if (ADMIN_EMAILS.includes(firebaseUser.email?.toLowerCase()) && data.role !== 'admin') {
                            await setDoc(doc(db, 'users', firebaseUser.uid), { ...data, role: 'admin' }, { merge: true });
                            setUserRole('admin');
                        } else {
                            setUserRole(data.role);
                        }
                    } else {
                        // First-time login: create user doc with proper role
                        const role = ADMIN_EMAILS.includes(firebaseUser.email?.toLowerCase()) ? 'admin' : 'client';
                        await setDoc(doc(db, 'users', firebaseUser.uid), {
                            name: firebaseUser.displayName || '',
                            email: firebaseUser.email,
                            role,
                            emailVerified: firebaseUser.emailVerified,
                            createdAt: new Date().toISOString(),
                        });
                        setUserRole(role);
                    }
                } catch {
                    setUserRole('client');
                }
            } else {
                setUser(null);
                setUserRole(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const signup = async (email, password, name) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const role = ADMIN_EMAILS.includes(email.toLowerCase()) ? 'admin' : 'client';
        await setDoc(doc(db, 'users', cred.user.uid), {
            name,
            email,
            role,
            emailVerified: false,
            createdAt: new Date().toISOString(),
        });
        await sendEmailVerification(cred.user);
        return cred.user;
    };

    const login = async (email, password) => {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        return cred.user;
    };

    const logout = () => signOut(auth);

    const resendVerification = async () => {
        if (user && !user.emailVerified) {
            await sendEmailVerification(user);
        }
    };

    const value = {
        user,
        userRole,
        loading,
        signup,
        login,
        logout,
        resendVerification,
        isAdmin: userRole === 'admin',
        isVerified: user?.emailVerified || false,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
