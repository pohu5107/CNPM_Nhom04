// School Bus/src/components/common/NotificationBell.jsx
import React, { useState, useEffect } from 'react';
import socket from '../../services/socketService';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        // Lắng nghe thông báo xe sắp đến
        socket.on('bus_approaching', (data) => {
            const newNotification = { id: Date.now(), message: data.message };
            setNotifications(prev => [newNotification, ...prev]);
        });

        // Lắng nghe thông báo xe bị trễ
        socket.on('bus_delayed', (data) => {
            const newNotification = { id: Date.now(), message: data.message };
            setNotifications(prev => [newNotification, ...prev]);
        });

        // Đăng ký nhận thông báo khi component được mount
        // TODO: Thay thế bằng parentId và routeId thực tế sau khi người dùng đăng nhập
        const registrationData = { parentId: 'parent1', routeId: 'route123' };
        socket.emit('registerForNotifications', registrationData);


        return () => {
            socket.off('bus_approaching');
            socket.off('bus_delayed');
        };
    }, []);

    return (
        <div className="notification-bell">
            <button onClick={() => setShowDropdown(!showDropdown)}>
                🔔
                {notifications.length > 0 && <span className="badge">{notifications.length}</span>}
            </button>
            {showDropdown && (
                <div className="dropdown">
                    {notifications.length === 0 ? (
                        <p>Không có thông báo mới.</p>
                    ) : (
                        <ul>
                            {notifications.map(notif => (
                                <li key={notif.id}>{notif.message}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
            <style jsx>{`
                .notification-bell {
                    position: relative;
                }
                .badge {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background-color: red;
                    color: white;
                    border-radius: 50%;
                    padding: 2px 6px;
                    font-size: 12px;
                }
                .dropdown {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    background-color: white;
                    border: 1px solid #ccc;
                    padding: 10px;
                    width: 300px;
                    max-height: 400px;
                    overflow-y: auto;
                }
            `}</style>
        </div>
    );
};

export default NotificationBell;
