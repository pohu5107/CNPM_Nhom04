import AddRouteForm from "./AddRouteForm";
import { Eye, SlidersHorizontal } from "lucide-react";
import DetailsBusForm from "./DetailsBusForm";
import { useEffect, useState } from "react";
import Header from "../../components/admin/Header";
import Table from "../../components/common/Table";
import ConfirmDialog from "../../components/UI/ConfirmDialog";
import axios from "axios";
import boxDialog from "../../components/UI/BoxDialog";

export default function RoutePage() {
  const [isOpenFormAdd, setIsOpenFormAdd] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false); // State cho form chỉnh sửa
  const [selectedRouteForEdit, setSelectedRouteForEdit] = useState(null); // Lưu tuyến đường đang chỉnh sửa
  const [selectedRoute, setSelectedRoute] = useState(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("🔵 Fetching routes from API...");
        const response = await axios.get("http://localhost:5000/api/routes", {
          timeout: 15000, // 15 giây thay vì 10 giây
        });
        console.log(" Routes response:", response.data);

        if (response.data && response.data.data) {
          // Map backend data to frontend format
          const mappedRoutes = response.data.data.map((route) => ({
            ...route,
            name: route.route_name || route.name,
            // Backend trả về route_name
          }));
          setRoutes(mappedRoutes);
        } else {
          console.warn("⚠️ No routes data in response");
          setRoutes([]);
        }
      } catch (error) {
        console.error("❌ Error fetching routes:", error);
        setError("Không thể tải danh sách tuyến đường. Vui lòng thử lại.");
        setRoutes([]); // Set empty array nếu lỗi
      } finally {
        setLoading(false);
      }
    };
    fetchRoutes();
  }, []);

  // Tạo route mới
  const handleCreateRoute = async (routeData) => {
    try {
      console.log("RoutePage: ", routeData);
      const response = await axios.post(
        "http://localhost:5000/api/routes",
        routeData
      );
      console.log("Response từ server:", response);
      if (response.data.success) {
        setRoutes((prev) => [...prev, response.data.data]);
        boxDialog("success");
        setIsOpenFormAdd(false);
      }
    } catch (error) {
      console.error("Lỗi khi tạo route:", error.response);
      boxDialog("error");
    }
  };

  // Cập nhật route hiện có
  const handleUpdateRoute = async (routeData) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/routes/${selectedRouteForEdit.id}`,
        routeData
      );
      if (response.data.success) {
        setRoutes((prev) =>
          prev.map((r) =>
            r.id === selectedRouteForEdit.id ? response.data.data : r
          )
        );
        boxDialog( "success");
        setIsEditOpen(false);
        setSelectedRouteForEdit(null);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật route:", error.response);
      boxDialog( "error");
      throw error; // Re-throw để form biết có lỗi
    }
  };
  // Xóa route
  const handleDeleteRoute = async (id) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/routes/${id}`
      );

      if (response.data.success) {
        setRoutes((prev) => prev.filter((route) => route.id !== id));
        boxDialog("success");
      }
    } catch (error) {
      console.error("Lỗi khi xóa route:", error);
      boxDialog("error");
    }
  };

  // xóa
  const handleDeleteClick = (route) => {
    setSelectedRoute(route);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (selectedRoute) {
      await handleDeleteRoute(selectedRoute.id);
      setSelectedRoute(null);
    }
  };

  // Filter routes
  const filteredRoutes = routes.filter((route) => {
    // Kiểm tra null/undefined để tránh lỗi
    const routeName = route?.name || "";
    const routeId = route?.id?.toString() || "";

    const matchesSearch =
      routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      routeId.includes(searchTerm);

    const matchesStatus = !statusFilter || route?.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: "id",
      header: "Mã tuyến đường",
    },
    {
      key: "route_name",
      header: "Tên tuyến đường",
    },
    {
      key: "distance",
      header: "Khoảng cách",
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (value, item) => {
        const normalizedStatus = value?.toString().toLowerCase().trim();

        return (
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
              normalizedStatus === "active"
                ? "bg-green-100 text-green-700"
                : normalizedStatus === "maintenance"
                ? "bg-yellow-100 text-yellow-700"
                : normalizedStatus === "inactive"
                ? "bg-red-100 text-red-700"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            {normalizedStatus === "active"
              ? "Đang hoạt động"
              : normalizedStatus === "maintenance"
              ? "Đang bảo trì"
              : normalizedStatus === "inactive"
              ? "Không hoạt động"
              : `Không xác định (${value})`}
          </span>
        );
      },
    },
  ];

  const filters = [
    {
      placeholder: "Tất cả trạng thái",
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { value: "active", label: "Đang hoạt động" },
        { value: "maintenance", label: "Đang bảo trì" },
        { value: "inactive", label: "Không hoạt động" },
      ],
      minWidth: "130px",
    },
  ];
  return (
    <div className="space-y-6 ">
      <Header title="QUẢN LÝ TUYẾN ĐƯỜNG" />

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            Đang tải danh sách tuyến đường...
          </p>
        </div>
      ) : (
        <Table
          title="Danh sách tuyến đường"
          data={filteredRoutes}
          columns={columns}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          onAdd={() => setIsOpenFormAdd(true)}
          onEdit={(route) => { 
            setSelectedRouteForEdit(route);
            setIsEditOpen(true);
          }}
          onDelete={(route) => handleDeleteClick(route)}
          addButtonText="Thêm tuyến đường"
          filters={filters}
          emptyMessage={
            searchTerm || statusFilter
              ? "Không tìm thấy tuyến đường nào phù hợp"
              : "Chưa có tuyến đường nào"
          }
        />
      )}

      <AddRouteForm
        visible={isOpenFormAdd}
        onCancel={() => setIsOpenFormAdd(false)}
        onSubmit={handleCreateRoute}
        mode="add"
        title="Thêm tuyến đường mới"
      />

      {/* Form chỉnh sửa tuyến đường */}
      <AddRouteForm
        visible={isEditOpen}
        onCancel={() => setIsEditOpen(false)}
        onSubmit={handleUpdateRoute}
        mode="edit"
        initialData={selectedRouteForEdit}
        title="Chỉnh sửa tuyến đường"
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa tuyến đường "${selectedRoute?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
}
