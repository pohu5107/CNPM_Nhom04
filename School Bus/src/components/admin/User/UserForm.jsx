import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
// ĐÃ SỬA LỖI ĐƯỜNG DẪN. Sử dụng đường dẫn 3 cấp đúng nhất theo cấu trúc: 
// src/components/admin/User/UserForm.jsx -> src/common/
import FormInput from '../../common/FormInput';
import Button from '../../common/Button';

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

        // Password logic
        if (!isEdit && !form.password) e.password = "Password bắt buộc khi tạo mới";
        if (form.password && form.password.length < 6) e.password = "Password ít nhất 6 ký tự";

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' })); // Xóa lỗi khi người dùng thay đổi
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isView) {
            onCancel(); // Nếu ở chế độ xem, nút Submit đóng modal
            return;
        }

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

            // onSubmit(payload) sẽ được handleFormSubmit trong UserPage gọi
            await onSubmit(payload);
        } finally {
            setSaving(false);
        }
    };

    // Định nghĩa hàm dịch vai trò để hiển thị trong dropdown (tương tự như ScheduleTable)
    // const translateRole = (role) => {
    //     switch (role) {
    //         case 'admin': return 'Quản trị viên';
    //         case 'driver': return 'Tài xế';
    //         case 'parent': return 'Phụ huynh';
    //         default: return role;
    //     }
    // };

    // Cấu hình options cho select role
    const roleOptions = [
        { value: 'admin', label: 'Quản trị viên' },
        { value: 'driver', label: 'Tài xế' },
        { value: 'parent', label: 'Phụ huynh' },
    ];


    return (
        <form onSubmit={handleSubmit} className="p-6">

            {/* Loại bỏ h2 tùy chỉnh, để Modal component cha handle tiêu đề */}

            {/* BỐ CỤC 2 CỘT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* 1. Username */}
                <FormInput
                    label="Username"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    error={errors.username}
                    required
                    readOnly={isView}
                />

                {/* 2. Email */}
                <FormInput
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    error={errors.email}
                    required
                    readOnly={isView}
                />

                {/* 3. Role (Full width for better look) */}
                <div className="md:col-span-2">
                    <FormInput
                        label="Vai trò (Role)"
                        name="role"
                        type="select"
                        value={form.role}
                        onChange={handleChange}
                        error={errors.role}
                        options={roleOptions}
                        required
                        readOnly={isView}
                    />
                </div>


                {/* 4. Password (Chỉ hiển thị khi không ở chế độ Xem, kéo dài 2 cột) */}
                {!isView && (
                    <div className="md:col-span-2">
                        <FormInput
                            label={`Mật khẩu (Password) ${isEdit ? "(Để trống nếu không đổi)" : ""}`}
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            error={errors.password}
                            required={!isEdit} // Bắt buộc khi tạo mới
                        />
                    </div>
                )}
            </div>

            {/* CHÂN FORM VÀ NÚT BẤM (Căn phải) */}
            <div className="flex gap-3 justify-end pt-6 mt-6 border-t border-slate-200">
                {/* Nút Hủy / Đóng */}
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    disabled={saving}
                >
                    {isView ? 'Đóng' : 'Hủy'}
                </Button>

                {/* Nút Submit / Cập nhật / Tạo */}
                {!isView && (
                    <Button
                        type="submit"
                        loading={saving}
                    >
                        {isEdit ? "Cập nhật" : "Tạo"}
                    </Button>
                )}
            </div>
        </form>
    );
}

UserForm.propTypes = {
    user: PropTypes.object,
    mode: PropTypes.oneOf(['add', 'edit', 'view']).isRequired,
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
};

export default UserForm;