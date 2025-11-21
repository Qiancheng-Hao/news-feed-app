import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useUserStore from '../stores/useUserStore';

// check if JWT is expired
const isTokenExpired = (token) => {
    try {
        const base64Url = token.split('.')[1];

        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

        const jsonPayload = decodeURIComponent(
            window
                .atob(base64)
                .split('')
                .map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join('')
        );

        const { exp } = JSON.parse(jsonPayload);

        if (Date.now() >= exp * 1000) {
            return true;
        }
        return false;
    } catch {
        return true;
    }
};

export default function AuthRoute({ children }) {
    // Get Token from Zustand
    const { token, logout } = useUserStore();
    const location = useLocation();

    // if there is a Token, allow access (render children)
    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    //  Token exists but is expired
    if (isTokenExpired(token)) {
        // remove token
        logout();
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}
