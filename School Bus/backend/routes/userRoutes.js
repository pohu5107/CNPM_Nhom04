import express from "express";
import pool from "../config/db.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// GET /api/users → Lấy danh sách user
router.get("/", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT id, username, email, role, created_at, updated_at FROM users ORDER BY id DESC");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
});

// GET /api/users/:id → Lấy 1 user
router.get("/:id", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ?", [req.params.id]);
        res.json(rows[0] || null);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
});

// POST /api/users → Thêm user mới
router.post("/", async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Username, email và password bắt buộc" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
            [username, email, hashedPassword, role || "parent"]
        );

        res.json({ id: result.insertId, username, email, role });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
});

// PUT /api/users/:id → Cập nhật user
router.put("/:id", async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        let hashedPassword;

        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        } else {
            // giữ nguyên password cũ
            const [rows] = await pool.query("SELECT password FROM users WHERE id = ?", [req.params.id]);
            hashedPassword = rows[0]?.password || "";
        }

        await pool.query(
            "UPDATE users SET username = ?, email = ?, role = ?, password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [username, email, role || "parent", hashedPassword, req.params.id]
        );

        res.json({ message: "Cập nhật thành công" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
});

// DELETE /api/users/:id → Xóa user
router.delete("/:id", async (req, res) => {
    try {
        await pool.query("DELETE FROM users WHERE id = ?", [req.params.id]);
        res.json({ message: "Xóa thành công" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
});

export default router;
