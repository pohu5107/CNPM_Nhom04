import { useState, useEffect } from 'react';

/**
 * Hook tùy chỉnh để lấy thông tin xác thực của người dùng từ sessionStorage.
 * Nó đảm bảo rằng dữ liệu người dùng được phân tích cú pháp một cách an toàn.
 * @returns {{user: object | null, token: string | null, role: string | null, isAuthenticated: boolean}}
 */
export const useAuth = () => {
    const [auth, setAuth] = useState({ user: null, token: null, role: null, isAuthenticated: false });

    useEffect(() => {
        const token = sessionStorage.getItem('authToken');
        const userString = sessionStorage.getItem('user');

        if (token && userString) {
            const user = JSON.parse(userString);
            setAuth({ user, token, role: user?.role, isAuthenticated: true });
        }
    }, []);

    return auth;
};