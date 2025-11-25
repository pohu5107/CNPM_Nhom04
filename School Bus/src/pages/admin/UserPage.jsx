import React, { useEffect, useState } from "react";
import UserTable from "../../components/admin/User/UserTable";
import UserForm from "../../components/admin/User/UserForm";

function UserPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("http://localhost:5000/api/users"); // dùng URL đầy đủ
            if (!res.ok) throw new Error(`Server returned ${res.status}`);
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreate = () => {
        setEditingUser(null);
        setIsFormOpen(true);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setIsFormOpen(true);
    };

    const handleDelete = async (user) => {
        if (!window.confirm(`Xác nhận xóa user "${user.username}"?`)) return;
        try {
            const res = await fetch(`http://localhost:5000/api/users/${user.id}`, { 
                method: "DELETE" 
            });
            
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || `Delete failed: ${res.status}`);
            }
            
            setUsers((prev) => prev.filter((u) => u.id !== user.id));
        } catch (err) {
            console.error('Delete error:', err);
            alert("Xóa thất bại: " + err.message);
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            const isEdit = Boolean(formData.id);
            
            if (isEdit) {
                // Update existing user
                const res = await fetch(`http://localhost:5000/api/users/${formData.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.message || `Update failed: ${res.status}`);
                }
                const updated = await res.json();
                setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
            } else {
                // Create new user
                const res = await fetch("http://localhost:5000/api/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.message || `Create failed: ${res.status}`);
                }
                const created = await res.json();
                setUsers((prev) => [created, ...prev]);
            }
            
            setIsFormOpen(false);
            setEditingUser(null);
        } catch (err) {
            console.error('Form submit error:', err);
            alert("Lưu thất bại: " + err.message);
        }
    };

    return (
        <div className="h-full bg-gray-50">
            <div className="p-6 h-full">
                <header className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Quản lý Tài Khoản</h1>
                    <div className="space-x-2">
                        {/* Có thể thêm nút thao tác ở đây nếu cần */}
                    </div>
                </header>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        Lỗi khi tải: {error}
                    </div>
                )}

                <div className="bg-white shadow-xl rounded-lg h-[calc(100vh-180px)] flex flex-col">
                    <div className="flex-1 overflow-hidden">
                        <UserTable
                            users={users}
                            loading={loading}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onView={(user) =>
                                alert(`Username: ${user.username}\nEmail: ${user.email}\nRole: ${user.role}`)
                            }
                            onAdd={handleCreate}
                        />
                    </div>
                </div>

                {isFormOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white shadow-2xl rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <UserForm
                                user={editingUser}
                                mode={editingUser ? 'edit' : 'create'}
                                onCancel={() => setIsFormOpen(false)}
                                onSubmit={handleFormSubmit}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserPage;