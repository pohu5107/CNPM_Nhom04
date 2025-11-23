import { useState, useEffect } from "react";
import Modal from "../../components/UI/Modal";
import FormInput from "../../components/common/FormInput";
import Button from "../../components/common/Button";
export default function AddRouteForm({
  visible,
  onCancel,
  title,
  onSubmit,
  mode = "add",
  initialData = null,
}) {
  const [formData, setFormData] = useState({
    route_name: "",
    distance: "",
    status: "active",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset errors when modal opens
  useEffect(() => {
    if (visible) {
      if (mode === "edit" && initialData) {
        setFormData({
          route_name: initialData.route_name || "",
          distance: initialData.distance || "",
          status: initialData.status || "active",
        });
      } else {
        setFormData({
          route_name: "",
          distance: "",
          status: "active",
        });
      }
      setErrors({});
    }
  }, [visible, mode, initialData]);

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!formData.route_name || !formData.route_name.trim()) {
      newErrors.route_name = "Tên tuyến đường là bắt buộc";
    } else if (formData.route_name.trim().length < 3) {
      newErrors.route_name = "Tên tuyến đường phải có ít nhất 3 ký tự";
    }

    if (!formData.distance.trim()) {
      newErrors.distance = "Khoảng cách là bắt buộc";
    } else if (isNaN(formData.distance) || parseFloat(formData.distance) <= 0) {
      newErrors.distance = "Khoảng cách phải là số dương";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resolvedTitle =
    title ||
    (mode === "edit" ? "Chỉnh sửa tuyến đường" : "Thêm tuyến đường mới");
  const submitButtonText = mode === "edit" ? "Cập nhật" : "Thêm tuyến đường";

  return (
    <Modal isOpen={visible} onClose={onCancel} title={resolvedTitle} size="md">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormInput
          label="Tên tuyến đường"
          name="name"
          value={formData.route_name}
          onChange={(e) =>
            setFormData({ ...formData, route_name: e.target.value })
          }
          placeholder="VD: Hồng bàng - An Dương Vương"
          error={errors.route_name}
          required
        />

        <FormInput
          label="Khoảng cách"
          name="distance"
          value={formData.distance}
          onChange={(e) =>
            setFormData({ ...formData, distance: e.target.value })
          }
          placeholder="VD: 15 km"
          error={errors.distance}
          required
        />

        <FormInput
          label="Trạng thái"
          name="status"
          type="select"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          options={[
            { value: "active", label: "Đang hoạt động" },
            { value: "maintenance", label: "Đang bảo trì" },
            { value: "inactive", label: "Không hoạt động" },
          ]}
          required
        />

        <div className="flex items-center justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {submitButtonText}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
