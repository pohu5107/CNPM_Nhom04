import React, { useEffect, useState } from "react";
import axios from "axios";
import UserTable from "../../components/admin/User/UserTable";
import UserForm from "../../components/admin/User/UserForm";
import Header from "../../components/admin/Header";
import Modal from "../../components/UI/Modal";
import ConfirmDialog from "../../components/UI/ConfirmDialog";
import boxDialog from "../../components/UI/BoxDialog";

function UserPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formMode, setFormMode] = useState("add"); // 'add', 'edit', 'view'

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get("http://localhost:5000/api/users");
            // Giả sử API trả về { success: true, data: [...] } hoặc chỉ [...]
            setUsers(res.data.data || res.data);
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Lỗi khi tải danh sách tài khoản.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAdd = () => {
        setFormMode("add");
        setSelectedUser(null);
        setShowForm(true);
    };

    const handleEdit = (user) => {
        setFormMode("edit");
        setSelectedUser(user);
        setShowForm(true);
    };

    const handleView = (user) => {
        setFormMode("view");
        setSelectedUser(user);
        setShowForm(true);
    };

    const handleDelete = (user) => {
        setSelectedUser(user);
        setShowConfirm(true);
    };

    const confirmDelete = async () => {
        if (!selectedUser) return;
        try {
            await axios.delete(`http://localhost:5000/api/users/${selectedUser.id}`);
            boxDialog("success", "Xóa tài khoản thành công!");
            setShowConfirm(false);
            setSelectedUser(null);
            fetchUsers(); // Tải lại danh sách
        } catch (err) {
            boxDialog("error", err.response?.data?.message || "Xóa thất bại.");
            console.error("Delete error:", err);
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (formMode === "add") {
                // Create new user
                await axios.post("http://localhost:5000/api/users", formData);
                boxDialog("success", "Thêm tài khoản thành công!");
            } else if (formMode === "edit") {
                // Update existing user
                await axios.put(
                    `http://localhost:5000/api/users/${selectedUser.id}`,
                    formData
                );
                boxDialog("success", "Cập nhật tài khoản thành công!");
            }

            setShowForm(false);
            setSelectedUser(null);
            fetchUsers(); // Tải lại danh sách
        } catch (err) {
            boxDialog("error", err.response?.data?.message || "Lưu thất bại.");
            console.error("Form submit error:", err);
            throw err; // Ném lỗi để form biết và không đóng
        }
    };

    return (
        <div className="space-y-6">
            <Header title="QUẢN LÝ TÀI KHOẢN" />

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">⚠️</span>
                        <span className="font-medium">{error}</span>
                    </div>
                </div>
            )}

            <UserTable
                users={users}
                loading={loading}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDelete}
            />

            {/* Form Modal */}
            <Modal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                title={
                    formMode === "add"
                        ? "Thêm tài khoản mới"
                        : formMode === "edit"
                            ? "Chỉnh sửa thông tin tài khoản"
                            : "Thông tin chi tiết tài khoản"
                }
                size="lg"
            >
                <UserForm
                    user={selectedUser}
                    mode={formMode}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setShowForm(false)}
                />
            </Modal>

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={confirmDelete}
                title="Xác nhận xóa"
                message={`Bạn có chắc chắn muốn xóa tài khoản "${selectedUser?.username}"? Hành động này không thể hoàn tác.`}
                confirmText="Xóa"
                cancelText="Hủy"
            />
        </div>
    );
}

export default UserPage;