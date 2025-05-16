import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChange } from '../api/api';

// Define the context type
interface AuthContextType {
    currentUser: FirebaseUser | null;
    loading: boolean;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
    currentUser: null,
    loading: true
});

// Custom hook for using the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Set up authentication state observer
        const unsubscribe = onAuthStateChange((user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        // Clean up observer on component unmount
        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 