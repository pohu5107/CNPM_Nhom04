import { Link, useNavigate } from 'react-router-dom';

export default function UnauthorizedPage() {
    const navigate = useNavigate();

    const goBack = () => navigate(-1); // Quay lại trang trước đó

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center p-8 bg-white rounded-lg shadow-xl max-w-md">
                <h1 className="text-6xl font-bold text-red-500">403</h1>
                <h2 className="mt-4 text-2xl font-semibold text-gray-800">Truy cập bị từ chối</h2>
                <p className="mt-2 text-gray-600">
                    Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ với quản trị viên nếu bạn cho rằng đây là một sự nhầm lẫn.
                </p>
                <div className="mt-6 flex justify-center gap-4">
                    <button
                        onClick={goBack}
                        className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Quay lại
                    </button>
                    <Link to="/login" className="px-4 py-2 font-semibold text-blue-600 bg-transparent border border-blue-600 rounded-md hover:bg-blue-100">
                        Về trang đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
}
