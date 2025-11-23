import React, { useState, useEffect } from "react";

function UserForm({ initialData, onCancel, onSubmit }) {
  const isEdit = Boolean(initialData);

  const [form, setForm] = useState({
    id: initialData?.id || null,
    username: initialData?.username || "",
    email: initialData?.email || "",
    password: "",
    role: initialData?.role || "parent",
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm({
      id: initialData?.id || null,
      username: initialData?.username || "",
      email: initialData?.email || "",
      password: "",
      role: initialData?.role || "parent",
    });
    setErrors({});
  }, [initialData]);

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
      <h2 className="text-xl font-semibold mb-3">{isEdit ? "Sửa user" : "Thêm user"}</h2>

      <div className="grid grid-cols-1 gap-3">
        <label className="block">
          <div className="text-sm">Username</div>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            disabled={saving}
          />
          {errors.username && <div className="text-red-600 text-sm">{errors.username}</div>}
        </label>

        <label className="block">
          <div className="text-sm">Email</div>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            disabled={saving}
          />
          {errors.email && <div className="text-red-600 text-sm">{errors.email}</div>}
        </label>

        <label className="block">
          <div className="text-sm">Password {isEdit ? "(để trống nếu không đổi)" : ""}</div>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            disabled={saving}
          />
          {errors.password && <div className="text-red-600 text-sm">{errors.password}</div>}
        </label>

        <label className="block">
          <div className="text-sm">Role</div>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          >
            <option value="admin">admin</option>
            <option value="driver">driver</option>
            <option value="parent">parent</option>
          </select>
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1 border rounded"
            disabled={saving}
          >
            Hủy
          </button>

          <button
            type="submit"
            className="px-3 py-1 bg-green-600 text-white rounded"
            disabled={saving}
          >
            {saving ? "Đang lưu..." : isEdit ? "Lưu" : "Tạo"}
          </button>
        </div>
      </div>
    </form>
  );
}

export default UserForm;
