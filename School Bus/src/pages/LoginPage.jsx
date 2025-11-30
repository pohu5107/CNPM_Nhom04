import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!username || !password) {
            setError('Vui lòng nhập đầy đủ thông tin.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                username,
                password,
            });

            // Lưu token vào sessionStorage để có thể login nhiều tab cùng lúc
            sessionStorage.setItem('authToken', response.data.token);
            sessionStorage.setItem('user', JSON.stringify(response.data.user));

            // **Kiểm tra vai trò và chuyển hướng dựa trên vai trò**
            const userRole = response.data.user.role;

            if (userRole === 'admin') {
                navigate('/admin/mapview'); // Chuyển đến trang bản đồ của admin
            } else if (userRole === 'driver') {
                navigate('/driver/schedule'); // Chuyển đến trang lịch trình của tài xế
            } else if (userRole === 'parent') {
                navigate('/parent'); // Chuyển đến trang của phụ huynh
            } else {
                // Nếu không có vai trò hoặc vai trò không xác định, quay về trang login
                // và hiển thị lỗi.
                setError('Vai trò người dùng không hợp lệ. Vui lòng liên hệ quản trị viên.');
                sessionStorage.removeItem('authToken');
                sessionStorage.removeItem('user');
            }

        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <img
                        src="https://www.shutterstock.com/image-vector/illustration-yellow-school-bus-flat-600nw-2246845245.jpg"
                        alt="Logo"
                        className="w-24 h-24 mx-auto rounded-full object-cover border"
                    />
                    <h1 className="mt-4 text-3xl font-bold text-gray-800">
                        Đăng nhập hệ thống
                    </h1>
                    <p className="text-gray-600">Quản lý xe buýt trường học</p>
                </div>

                <form className="space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Tên đăng nhập
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Nhập tên đăng nhập"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Mật khẩu
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Nhập mật khẩu"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                        >
                            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}