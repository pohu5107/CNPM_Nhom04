import React, { useState } from "react";
import "./Schedule_Assignment.css"; // Tạo file CSS riêng để style
import CreateSchedule from "./CreateSchedule"; // Thêm import

const schedules = [
  {
    id: "C001",
    time: "08:00 06/10",
    route: "HCM → Quận 3",
    bus: "51H-123.45",
    driver: "Nguyễn Văn A",
    status: "Chờ phân công",
  },
  {
    id: "C002",
    time: "09:30 06/10",
    route: "HCM → Biên Hòa",
    bus: "50A-678.90",
    driver: "Trần Thị B",
    status: "Đang chạy",
  },
  {
    id: "C003",
    time: "14:00 06/10",
    route: "HCM → Bình Dương",
    bus: "29B-112.33",
    driver: "(Chưa gán)",
    status: "Chờ phân công",
  },
  {
    id: "C004",
    time: "16:30 06/10",
    route: "Kho A → Quận 7",
    bus: "72C-445.66",
    driver: "Phạm Văn C",
    status: "Hoàn thành",
  },
];

const statusColors = {
  "Chờ phân công": "orange",
  "Đang chạy": "dodgerblue",
  "Hoàn thành": "green",
};

export default function Schedule() {
    const [showCreateForm, setShowCreateForm] = useState(false);  // Thêm state

  // Nếu đang hiển thị form tạo lịch trình
  if (showCreateForm) {
    return <CreateSchedule onBack={() => setShowCreateForm(false)} />;
  }

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
          <span>Người dùng</span>
        </header>
        <section className="schedule-section">
          <h2>🗂️ Lập lịch trình & Phân công tài xế</h2>
          <button className="create-btn" onClick={() => setShowCreateForm(true)}>+ Tạo lịch trình</button>          
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Mã chuyến</th>
                <th>Ngày/Giờ</th>
                <th>Tuyến đường</th>
                <th>Xe</th>
                <th>Tài xế</th>
                <th>Trạng thái</th>
                <th>Tùy chọn</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.time}</td>
                  <td>{item.route}</td>
                  <td>{item.bus}</td>
                  <td>{item.driver}</td>
                  <td>
                    <span
                      className="status"
                      style={{
                        backgroundColor: statusColors[item.status],
                        color: "white",
                        padding: "4px 12px",
                        borderRadius: "6px",
                        fontWeight: "bold",
                      }}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <button className="assign-btn">Phân công</button>
                    <button className="delete-btn">Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}