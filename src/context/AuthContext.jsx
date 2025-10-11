import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setAuthenticate] = useState(false);
    const [role, setRole] = useState(null);

    const login = async ({ data }) => {

        console.log(data);

        if (data.email === 'peter' && data.password === 'parker') {
            setAuthenticate(true);
            setRole('user');
            return true;
        }

        else {
            setAuthenticate(false);
            setRole(null);
            return false;
        }
    }

    const value = {
        login,
        role,
        isAuthenticated
    }

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}