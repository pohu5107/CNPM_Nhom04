import express from "express";
import pool from "../config/db.js";

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

        const [result] = await pool.query(
            "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
            [username, email, password, role || "parent"]
        );

        // Trả về created user data với timestamps
        const [createdRows] = await pool.query(
            "SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ?",
            [result.insertId]
        );

        res.json(createdRows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
});

// PUT /api/users/:id → Cập nhật user
router.put("/:id", async (req, res) => {
    try {
        let { username, email, password, role } = req.body;

        if (!password) {
            // giữ nguyên password cũ
            const [rows] = await pool.query("SELECT password FROM users WHERE id = ?", [req.params.id]);
            password = rows[0]?.password || "";
        }

        await pool.query(
            "UPDATE users SET username = ?, email = ?, role = ?, password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [username, email, role || "parent", password, req.params.id]
        );

        // Trả về updated user data
        const [updatedRows] = await pool.query(
            "SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ?", 
            [req.params.id]
        );

        res.json(updatedRows[0]);
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
