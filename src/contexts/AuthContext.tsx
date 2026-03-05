import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getSubscriptionStatus } from '@/data/api';

interface User {
    id: number;
    nom: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isSubscribed: boolean;
    subscriptionLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem('user_data');
        return stored ? JSON.parse(stored) : null;
    });
    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem('user_token');
    });
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscriptionLoading, setSubscriptionLoading] = useState(false);

    const login = (newToken: string, newUser: User) => {
        localStorage.setItem('user_token', newToken);
        localStorage.setItem('user_data', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
    };

    const logout = () => {
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_data');
        setToken(null);
        setUser(null);
        setIsSubscribed(false);
    };

    const refreshSubscription = async () => {
        if (!token) {
            setIsSubscribed(false);
            return;
        }
        setSubscriptionLoading(true);
        try {
            const status = await getSubscriptionStatus();
            setIsSubscribed(status.subscribed);
        } catch {
            setIsSubscribed(false);
        } finally {
            setSubscriptionLoading(false);
        }
    };

    // Check subscription on mount and when token changes
    useEffect(() => {
        if (token) {
            refreshSubscription();
        }
    }, [token]);

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isSubscribed,
            subscriptionLoading,
            login,
            logout,
            refreshSubscription,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
