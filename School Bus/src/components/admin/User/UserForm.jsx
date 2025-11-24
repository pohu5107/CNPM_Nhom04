import React, { useState, useEffect } from "react";

function UserForm({ user, mode, onCancel, onSubmit }) {
    const isEdit = mode === 'edit';
    const isView = mode === 'view';

    const [form, setForm] = useState({
        id: user?.id || null,
        username: user?.username || "",
        email: user?.email || "",
        password: "",
        role: user?.role || "parent",
    });

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (user) {
            setForm({
                id: user.id || null,
                username: user.username || "",
                email: user.email || "",
                password: "",
                role: user.role || "parent",
            });
        }
        setErrors({});
    }, [user]);

    const validate = () => {
        const e = {};

        if (!form.username.trim()) e.username = "Username không được rỗng";

        if (!form.email.trim()) e.email = "Email không được rỗng";
        else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = "Email không hợp lệ";

        if (!isEdit && !form.password) e.password = "Password bắt buộc khi tạo mới";
        if (form.password && form.password.length < 6) e.password = "Password ít nhất 6 ký tự";

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;
        setSaving(true);

        try {
            const payload = {
                id: form.id,
                username: form.username.trim(),
                email: form.email.trim(),
                role: form.role,
            };

            // only send password if creating or user typed something
            if (!isEdit || (isEdit && form.password)) payload.password = form.password;

            await onSubmit(payload, isEdit ? "edit" : "create");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="text-3xl font-semibold mb-6 ml-[2%] mt-5">{isEdit ? "Sửa Tài Khoản" : "Thêm Tài Khoản"}</h2>

            <div className="space-y-4">
                <div className="block">
                    <div className="text-lg font-medium mb-4 ml-[2%]">Username</div>                    <input
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        className="mx-auto block w-29/30 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={saving || isView}
                        readOnly={isView}
                    />
                    {errors.username && <div className="text-red-600 text-sm mt-1">{errors.username}</div>}
                </div>

                <div className="block">
                    <div className="text-lg font-medium mb-1 ml-[2%]">Email</div>
                    <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        className="mx-auto block w-29/30 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={saving || isView}
                        readOnly={isView}
                    />
                    {errors.email && <div className="text-red-600 text-sm mt-1">{errors.email}</div>}
                </div>

                {!isView && (
                    <div className="block">
                        <div className="text-lg font-medium mb-1 ml-[2%]">Password {isEdit ? "(để trống nếu không đổi)" : ""}</div>
                        <input
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            className="mx-auto block w-29/30 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={saving}
                        />
                        {errors.password && <div className="text-red-600 text-sm mt-1">{errors.password}</div>}
                    </div>
                )}

                <div className="block">
                    <div className="text-lg font-medium mb-1 ml-[2%]">Role</div>
                    <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        className="mx-auto block w-29/30 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={saving || isView}
                    >
                        <option value="admin">Admin</option>
                        <option value="driver">Driver</option>
                        <option value="parent">Parent</option>
                    </select>
                </div>
            </div>

            <div className="flex gap-3 justify-center pt-6 mt-6 border-t border-slate-200">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 mb-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={saving}
                >
                    {isView ? 'Đóng' : 'Hủy'}
                </button>

                {!isView && (
                    <button
                        type="submit"
                        className="px-4 mb-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        disabled={saving}
                    >
                        {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo"}
                    </button>
                )}
            </div>
        </form>
    );
}

export default UserForm;