// /backend/routes/busRoutes.js

import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// GET /api/buses - Lấy danh sách tất cả xe bus
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM buses");
    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching buses:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách xe bus",
      error: error.message,
    });
  }
});

// // GET /api/buses/:id - Lấy thông tin xe bus theo ID
// router.get("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const [rows] = await pool.execute("SELECT * FROM buses WHERE id = ?", [id]);

//     if (rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Không tìm thấy xe bus",
//       });
//     }

//     res.json({
//       success: true,
//       data: rows[0],
//     });
//   } catch (error) {
//     console.error("Error fetching bus:", error);
//     res.status(500).json({
//       success: false,
//       message: "Lỗi khi lấy thông tin xe bus",
//       error: error.message,
//     });
//   }
// });

// POST /api/buses - Tạo xe bus mới
router.post("/", async (req, res) => {
  try {
    const { bus_number, license_plate, status } = req.body;

    // Validation cơ bản
    if (!bus_number || !license_plate) {
      return res.status(400).json({
        success: false,
        message: "Mã xe và biển số xe là bắt buộc",
      });
    }

    const [result] = await pool.execute(
      "INSERT INTO buses (bus_number, license_plate, status) VALUES (?, ?, ?)",
      [bus_number, license_plate, status || "active"]
    );

    // Lấy thông tin xe vừa tạo
    const [newBus] = await pool.execute("SELECT * FROM buses WHERE id = ?", [
      result.insertId,
    ]);

    res.status(201).json({
      success: true,
      message: "Tạo xe bus thành công",
      data: newBus[0],
    });
  } catch (error) {
    console.error("Error creating bus:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo xe bus",
      error: error.message,
    });
  }
});

// PUT /api/buses/:id - Cập nhật thông tin xe bus
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { bus_number, license_plate, status } = req.body;

    if (!bus_number || !license_plate) {
      return res.status(400).json({
        success: false,
        message: "Mã xe và biển số xe là bắt buộc",
      });
    }

    const [result] = await pool.execute(
      "UPDATE buses SET bus_number = ?, license_plate = ?, status = ? WHERE id = ?",
      [bus_number, license_plate, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy xe bus để cập nhật",
      });
    }

    // Lấy thông tin xe đã cập nhật
    const [updatedBus] = await pool.execute(
      "SELECT * FROM buses WHERE id = ?",
      [id]
    );

    res.json({
      success: true,
      message: "Cập nhật xe bus thành công",
      data: updatedBus[0],
    });
  } catch (error) {
    console.error("Error updating bus:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật xe bus",
      error: error.message,
    });
  }
});

// DELETE /api/buses/:id - Xóa xe bus
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute("DELETE FROM buses WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy xe bus để xóa",
      });
    }

    res.json({
      success: true,
      message: "Xóa xe bus thành công",
    });
  } catch (error) {
    console.error("Error deleting bus:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa xe bus",
      error: error.message,
    });
  }
});

export default router;
