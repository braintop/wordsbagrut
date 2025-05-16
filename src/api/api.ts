import { initializeApp } from 'firebase/app';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { User as FirebaseUser, UserCredential } from 'firebase/auth';

// Your Firebase configuration
// Replace these values with your actual Firebase project config
const firebaseConfig = {
    apiKey: "AIzaSyAHzu9NBBFXfy_OgxqycJ9gb8EvcctuSy8",
    authDomain: "wordsbagrut.firebaseapp.com",
    projectId: "wordsbagrut",
    storageBucket: "wordsbagrut.firebasestorage.app",
    messagingSenderId: "699714786495",
    appId: "1:699714786495:web:48c5fdb96719e28b58e20a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

// Types
export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface LoginData {
    email: string;
    password: string;
}

// Register new user
export const registerUser = async (data: RegisterData): Promise<UserCredential> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        // You could save additional user data like firstName and lastName to Firestore here
        // This example only handles Firebase Authentication
        return userCredential;
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
};

// Login user
export const loginUser = async (data: LoginData): Promise<UserCredential> => {
    try {
        return await signInWithEmailAndPassword(auth, data.email, data.password);
    } catch (error) {
        console.error('Error logging in user:', error);
        throw error;
    }
};

// Logout user
export const logoutUser = async (): Promise<void> => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Error logging out user:', error);
        throw error;
    }
};

// Get current user
export const getCurrentUser = (): FirebaseUser | null => {
    return auth.currentUser;
};

// Auth state listener
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void): (() => void) => {
    return onAuthStateChanged(auth, callback);
};

// Export auth for direct access if needed
export { auth, firestore };
