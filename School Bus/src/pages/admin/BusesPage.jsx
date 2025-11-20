import React, { useState, useEffect } from "react";
import axios from "axios";
import AddBusForm from "./AddBusForm";
import { Eye, SlidersHorizontal, Plus, Pencil, Trash2 } from "lucide-react";
import DetailsBusForm from "./DetailsBusForm";
import Header from "../../components/admin/Header";
import Table from "../../components/common/Table";
import ConfirmDialog from "../../components/UI/ConfirmDialog";
import boxDialog from "../../components/UI/BoxDialog";

export default function BusesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateOpenDetails, setIsCreateOpenDetails] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [busToDelete, setBusToDelete] = useState(null);

  // --- State để lưu dữ liệu từ API ---
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- useEffect để gọi API khi component tải ---
  useEffect(() => {
    const fetchBuses = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/buses");

        setBuses(response.data.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Lỗi khi fetch dữ liệu xe buýt:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBuses();
  }, []);

  // Xử lý xóa xe buýt
  const handleDeleteBus = async (id) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/buses/${id}`
      );

      if (response.data.success) {
        setBuses((prev) => prev.filter((bus) => bus.id !== id));
        boxDialog("success");
      }
    } catch (error) {
      console.error("Lỗi khi xóa xe:", error);
      boxDialog("error");
    }
  };

  // Xử lý xóa với xác nhận
  const handleDeleteClick = (bus) => {
    setBusToDelete(bus);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (busToDelete) {
      await handleDeleteBus(busToDelete.id);
      setBusToDelete(null);
    }
  };

  // Filter buses
  const filteredBuses = buses.filter((bus) => {
    const matchesSearch =
      bus.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.bus_number.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || bus.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: "bus_number",
      header: "Mã xe",
    },
    {
      key: "license_plate",
      header: "Biển số",
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
    <div className="space-y-6">
      <Header title="QUẢN LÝ XE BUÝT" />

      <Table
        title="Danh sách xe buýt"
        data={filteredBuses}
        columns={columns}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onAdd={() => setIsCreateOpen(true)}
        onView={(bus) => {
          setSelectedBus(bus);
          setIsCreateOpenDetails(true);
        }}
        onEdit={(bus) => {
          setSelectedBus(bus);
          setIsEditOpen(true);
        }}
        onDelete={(bus) => handleDeleteClick(bus)}
        addButtonText="Thêm xe"
        filters={filters}
        isLoading={loading}
        emptyMessage={
          error
            ? `Lỗi khi tải dữ liệu: ${error}`
            : searchTerm || statusFilter
            ? "Không tìm thấy xe nào phù hợp"
            : "Chưa có xe nào"
        }
      />

      <AddBusForm
        visible={isCreateOpen}
        onCancel={() => setIsCreateOpen(false)}
        title="Thêm xe"
        onSubmit={async (busData) => {
          try {
            const response = await axios.post(
              "http://localhost:5000/api/buses",
              busData
            );
            if (response.data.success) {
              setBuses((prev) => [...prev, response.data.data]);
              boxDialog("success");
              setIsCreateOpen(false);
            } else {
              boxDialog("error");
            }
          } catch (error) {
            console.error("Lỗi khi thêm xe:", error);
            boxDialog("error");
            throw error; // Re-throw để form biết có lỗi
          }
        }}
      />

      {/* Edit bus */}
      <AddBusForm
        visible={isEditOpen}
        onCancel={() => {
          setIsEditOpen(false);
          setSelectedBus(null);
        }}
        mode="edit"
        bus={selectedBus}
        title="Chỉnh sửa xe"
        onSubmit={async (busData) => {
          try {
            const response = await axios.put(
              `http://localhost:5000/api/buses/${selectedBus.id}`,
              busData
            );
            if (response.data.success) {
              setBuses((prev) =>
                prev.map((b) =>
                  b.id === selectedBus.id ? response.data.data : b
                )
              );
              boxDialog("success");
              setIsEditOpen(false);
              setSelectedBus(null);
            } else {
              alert(
                "Lỗi: " + (response.data.message || "Không thể cập nhật xe")
              );
            }
          } catch (error) {
            console.error("Lỗi khi cập nhật xe:", error);
            const errorMessage =
              error.response?.data?.message ||
              error.message ||
              "Lỗi khi cập nhật xe!";
            alert("Lỗi: " + errorMessage);
            throw error; // Re-throw để form biết có lỗi
          }
        }}
      />
      <DetailsBusForm
        visible={isCreateOpenDetails}
        onCancel={() => {
          setIsCreateOpenDetails(false);
          setSelectedBus(null);
        }}
        bus={selectedBus}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa xe buýt "${busToDelete?.license_plate}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
}
