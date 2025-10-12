import React, { useState } from "react";
import "./CreateSchelude.css";

export default function CreateSchedule({ onBack }) {
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    fromLocation: "",
    toLocation: "",
    bus: "",
    driver: "",
    notes: "",
  });


  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Xử lý logic lưu dữ liệu ở đây
    onBack(); // Quay về trang lịch trình sau khi lưu
  };

  return (
    <div className="schedule-container">
      <aside className="sidebar">
        <div className="School_Bus">School Bus</div>
        <nav>
          <ul>
            <li>Tổng quan</li>
            <li>Quản lý chuyến</li>
            <li>Lập lịch & Phân công</li>
            <li>Quản lý xe</li>
            <li>Quản lý tài xế</li>
          </ul>
        </nav>
      </aside>
      <main className="main-content">
        <header className="header">
          <button className="back-btn" onClick={onBack}>
            ← Trở về Lập lịch & Phân công
          </button>
          <span>Người dùng</span>
        </header>
        <section className="schedule-section">
          <h2>Tạo Lịch Trình Mới</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Ngày đi:</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Giờ khởi hành:</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Điểm đi:</label>
              <input
                type="text"
                name="fromLocation"
                value={formData.fromLocation}
                onChange={(e) => setFormData({...formData, fromLocation: e.target.value})}
                placeholder="Ví dụ: Kho A"
                required
              />
            </div>

            <div className="form-group">
              <label>Điểm đến:</label>
              <input
                type="text"
                name="toLocation"
                value={formData.toLocation}
                onChange={(e) => setFormData({...formData, toLocation: e.target.value})}
                placeholder="Ví dụ: Quận 7"
                required
              />
            </div>

            <div className="form-group">
              <label>Chọn xe:</label>
              <input
                type="text"
                name="bus"
                value={formData.bus}
                onChange={(e) => setFormData({...formData, bus: e.target.value})}
                placeholder="Nhập biển số xe"
              />
            </div>

            <div className="form-group">
              <label>Chọn tài xế:</label>
              <input
                type="text"
                name="driver"
                value={formData.driver}
                onChange={(e) => setFormData({...formData, driver: e.target.value})}
                placeholder="Nhập tên tài xế"
              />
            </div>

            <div className="form-group">
              <label>Ghi chú:</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Nhập ghi chú cho chuyến đi..."
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-save">
                Tạo mới
              </button>
              <button type="button" className="btn-cancel" onClick={onBack}>
                Hủy
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
