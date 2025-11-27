import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css"; // Import CSS bắt buộc

const RoutingMachine = ({ start, end }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Tạo control routing
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(start[0], start[1]), // Điểm bắt đầu (Vĩ độ, Kinh độ)
        L.latLng(end[0], end[1])      // Điểm kết thúc
      ],
      routeWhileDragging: false,      // Tắt kéo thả đường đi (để cố định lộ trình xe bus)
      show: false,                    // Ẩn bảng hướng dẫn chi tiết (Turn-by-turn text) (phù hợp cho driver)
      addWaypoints: false,            // Không cho phép người dùng thêm điểm dừng
      draggableWaypoints: false,      // Không cho kéo điểm mốc
      fitSelectedRoutes: false,       // Không tự động zoom fit bản đồ (để tránh giật khi load)
      lineOptions: {
        styles: [{ color: "blue", weight: 5, opacity: 0.7 }] // Style đường vẽ màu xanh
      },
      createMarker: function() { return null; } // Ẩn mặc định marker A/B của thư viện
    }).addTo(map);

    // Dọn dẹp khi component bị hủy (Chuyển trang hoặc tắt map)
    return () => {
      map.removeControl(routingControl);
    };
  }, [map, start, end]); // Chạy lại khi tọa độ thay đổi

  return null; // Component này không render giao diện HTML, chỉ tác động lên Map
};

export default RoutingMachine;