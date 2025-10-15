import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { authAxiosInstance } from "../api/authtAxios";

const AuthContext = createContext();
const authAxios = authAxiosInstance();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setAuthenticate] = useState(false);
    const [role, setRole] = useState(null);
    const [isLoading, setLoading] = useState(true);

    const isLoggedIn = async () => {
        try {
            const response = await authAxios.get('/auth/verify', { withCredentials: true });

            if (response.status === 200) {
                setAuthenticate(true);
                setRole(response.data.role);
            } else {
                setAuthenticate(false);
                setRole(null);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        isLoggedIn();
    }, []);

    const login = async ({ data }) => {
        try {
            const response = await api.post('/auth/login', data, { withCredentials: true });

            await isLoggedIn();

            return response.status === 200 ? true : false;
        } catch (error) {
            console.log(error);
        }
    }

    const value = {
        login,
        role,
        isLoading,
        isAuthenticated
    }

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}