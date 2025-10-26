import { useState } from "react";
import "../../css/Schedule.css";


export default function Schedule() {
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const schedules = [
    { ca: 1, time: "06:30 - 7:30", bus: "51B-12345", start: "120 Nguyễn Trãi", end: "273 An Dương Vương" },
    { ca: 2, time: "10:30 - 11:30", bus: "51B-86901", start: "273 An Dương Vương", end: "120 Nguyễn Trãi" },
    { ca: 3, time: "13:00 - 14:00", bus: "51B-12345", start: "15 Nguyễn Huệ", end: "04 Tôn Đức Thắng" },
    { ca: 4, time: "17:30 - 18:30", bus: "51B-86901", start: "04 Tôn Đức Thắng", end: "15 Nguyễn Huệ" },
  ];

  const students = [
    { id: 1, name: "Nguyễn Văn A", pickup: "120 Nguyễn Trãi", drop: "273 An Dương Vương", status: "Đã đón" },
    { id: 2, name: "Nguyễn Văn B", pickup: "19 Lê Lợi", drop: "273 An Dương Vương", status: "Chưa đón" },
    { id: 3, name: "Nguyễn Văn C", pickup: "253 Nguyễn Thị Minh Khai", drop: "273 An Dương Vương", status: "Chưa đón" },
    { id: 4, name: "Nguyễn Văn D", pickup: "66 Lý Thường Kiệt", drop: "273 An Dương Vương", status: "Chưa đón" },
    { id: 5, name: "Nguyễn Văn E", pickup: "134 Lê Đại Hành", drop: "273 An Dương Vương", status: "Chưa đón" },
  ];

  // Giao diện 1 — LỊCH LÀM VIỆC
  if (!selectedSchedule) {
    return (
      <div className="container">
        <div className="header">LỊCH LÀM VIỆC</div>

        <div className="content">
          <div className="date">
            <span className="calendar-icon">📅</span>
            <label>Ngày:</label>
            <input type="date" defaultValue="2025-09-30" />
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Ca</th>
                  <th>🕒 Thời gian</th>
                  <th>🚌 Xe buýt</th>
                  <th>👤 Điểm bắt đầu</th>
                  <th>📍 Điểm kết thúc</th>
                  <th>Danh sách học sinh</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((item) => (
                  <tr key={item.ca}>
                    <td>{item.ca}</td>
                    <td>{item.time}</td>
                    <td>{item.bus}</td>
                    <td>{item.start}</td>
                    <td>{item.end}</td>
                    <td className="view-link" onClick={() => setSelectedSchedule(item)}>
                      [Xem danh sách học sinh] 🧾
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bus">🚌</div>
        </div>
      </div>
    );
  }

  // Giao diện 2 — DANH SÁCH HỌC SINH
  return (
    <div className="container">
      <div className="header">DANH SÁCH HỌC SINH</div>

      <div className="content">
        <div className="schedule-info">
  <div className="info-item">
    <div className="icon">📅</div>
    <div className="label">Ngày:</div>
    <div className="value">30/09/2025</div>
  </div>

  <div className="info-item">
    <div className="icon">🔢</div>
    <div className="label">Ca:</div>
    <div className="value">{selectedSchedule.ca}</div>
  </div>

  <div className="info-item">
    <div className="icon">🕒</div>
    <div className="label">Thời gian:</div>
    <div className="value">{selectedSchedule.time}</div>
  </div>

  <div className="info-item">
    <div className="icon">🚌</div>
    <div className="label">Xe buýt:</div>
    <div className="value">{selectedSchedule.bus}</div>
  </div>

  <div className="info-item">
    <div className="icon">📍</div>
    <div className="label">Tuyến xe:</div>
    <div className="value">{selectedSchedule.start}</div>
  </div>

  <div className="info-item">
    <div className="icon">👨‍🎓</div>
    <div className="label">Tổng học sinh:</div>
    <div className="value">{students.length}</div>
  </div>
</div>


        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>👨‍🎓 Học sinh</th>
                <th>🚏 Điểm đón</th>
                <th>📍 Điểm trả</th>
                <th>🔄 Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={s.id}>
                  <td className="center">{i + 1}</td>
                  <td>{s.name}</td>
                  <td>{s.pickup}</td>
                  <td>{s.drop}</td>
                  <td className={`center status ${s.status === "Đã đón" ? "done" : "pending"}`}>
                    {s.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="back-button" onClick={() => setSelectedSchedule(null)}>
          🔙 Quay lại lịch làm việc
        </div>

        <div className="bus">🚌</div>
      </div>
    </div>
  );
}
