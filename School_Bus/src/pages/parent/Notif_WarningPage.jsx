// src/pages/parent/Notif_WarningPage.jsx
import React from 'react';
import '../../css/LoginPage.css';  // Tạm thời sử dụng chung CSS

const Notif_WarningPage = () => {
    const busInfo = {
        busNumber: '01',
        driverName: 'Hoàng Văn A',
        route: 'Hồng Bàng - An Dương Vương - Nguyễn Văn Cừ',
        studentName: 'Nguyễn Minh Anh',
        status: 'đang hoạt động',
        nextStop: 'An Dương Vương',
        lastStop: 'Hồng Bàng',
        estimatedTime: '5 phút',
        delay: {
            isDelayed: true,
            newTime: '7:25',
            delayMinutes: 15,
            reason: 'Kẹt xe trên đường Hồng Bàng'
        }
    };

    return (
        <div className="notification-page">
            <div className="info-section">
                <h2>Thông tin xe buýt</h2>
                <div className="bus-info">
                    <p><strong>Xe buýt:</strong> {busInfo.busNumber}</p>
                    <p><strong>Tài xế:</strong> {busInfo.driverName}</p>
                    <p><strong>Trạng thái:</strong> <span className="status-active">{busInfo.status}</span></p>
                    <p><strong>Tuyến đường:</strong> {busInfo.route}</p>
                    <p><strong>Học sinh:</strong> {busInfo.studentName}</p>
                </div>
            </div>

            <div className="live-status">
                <h3>Trạng thái hiện tại</h3>
                <div className="status-info">
                    <p>
                        <span className="icon">🚌</span> 
                        Xe buýt số {busInfo.busNumber} đang di chuyển đến điểm đón
                    </p>
                    <p><b>
                        <span className="icon">⏰</span>
                        Thời gian dự kiến: còn {busInfo.estimatedTime}
                    </b></p>
                    <p>
                        <span className="icon">📍</span>
                        Sắp đến điểm đón: {busInfo.nextStop}
                    </p>
                    <p>
                        <span className="icon">↩️</span>
                        Vừa rời điểm đón: {busInfo.lastStop}
                    </p>
                </div>
            </div>

            {busInfo.delay.isDelayed && (
                <div className="delay-warning">
                    <h3>⚠️ Thông báo trễ xe</h3>
                    <div className="delay-info">
                        <p>
                            <strong>Thời gian dự kiến mới:</strong> {busInfo.delay.newTime} 
                            (trễ {busInfo.delay.delayMinutes} phút)
                        </p>
                        <p><strong>Lý do:</strong> {busInfo.delay.reason}</p>
                    </div>
                </div>
            )}

            <div className="action-buttons">
                <button className="map-button">Xem bản đồ trực tiếp</button>
                <button className="contact-button">Liên hệ tài xế</button>
            </div>

            <p className="note">
                *Đề xuất: Phụ huynh nên đưa học sinh đến điểm đón trước thời gian dự kiến
            </p>

            <style jsx>{`
                .notification-page {
                    padding: 20px;
                    max-width: 800px;
                    margin: 0 auto;
                }

                .info-section, .live-status, .delay-warning {
                    background: white;
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .status-active {
                    color: #28a745;
                }

                .delay-warning {
                    background: #fff3cd;
                    border: 1px solid #ffeeba;
                }

                .action-buttons {
                    display: flex;
                    gap: 10px;
                    margin-top: 20px;
                }

                .map-button, .contact-button {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    flex: 1;
                }

                .map-button {
                    background: #28a745;
                    color: white;
                }

                .contact-button {
                    background: #007bff;
                    color: white;
                }

                .note {
                    font-size: 0.9em;
                    color: #666;
                    margin-top: 20px;
                }

                .icon {
                    margin-right: 8px;
                }

                .status-info p, .delay-info p {
                    margin: 10px 0;
                }
            `}</style>
        </div>
    );
};

export default Notif_WarningPage;