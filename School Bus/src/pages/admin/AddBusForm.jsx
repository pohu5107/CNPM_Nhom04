import { useEffect, useState } from "react";
import Modal from "../../components/UI/Modal";
import FormInput from "../../components/common/FormInput";
import Button from "../../components/common/Button";

export default function AddBusForm({ visible, onCancel, title, onSubmit, mode = "add", bus = null }) {
  const [formData, setFormData] = useState({
    bus_number: "",
    license_plate: "",
    status: "active"
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prefill form when editing
  useEffect(() => {
    if (visible && mode === "edit" && bus) {
      setFormData({
        bus_number: bus.bus_number || "",
        license_plate: bus.license_plate || "",
        status: bus.status || "active",
      });
    }
    if (visible && mode === "add" && !bus) {
      setFormData({
        bus_number: "",
        license_plate: "",
        status: "active",
      });
    }
    // Reset errors when modal opens
    setErrors({});
  }, [visible, mode, bus]);

  // Validation function - aligned with buses table
  const validateForm = () => {
    const newErrors = {};

    if (!formData.bus_number.trim()) {
      newErrors.bus_number = "Mã xe là bắt buộc";
    } else if (formData.bus_number.trim().length < 3) {
      newErrors.bus_number = "Mã xe phải có ít nhất 3 ký tự";
    }

    if (!formData.license_plate.trim()) {
      newErrors.license_plate = "Biển số xe là bắt buộc";
    } else if (formData.license_plate.trim().length < 5 || formData.license_plate.trim().length > 20) {
      // Bảng chỉ yêu cầu NOT NULL + UNIQUE, không bắt buộc pattern, chỉ giới hạn độ dài VARCHAR(20)
      newErrors.license_plate = "Độ dài biển số phải từ 5 đến 20 ký tự";
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
      // Reset form only on success
      setFormData({
        bus_number: "",
        license_plate: "",
        status: "active"
      });
      setErrors({});
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resolvedTitle = title || (mode === "edit" ? "Chỉnh sửa xe" : "Thêm xe");

  return (
    <Modal
      isOpen={visible}
      onClose={onCancel}
      title={resolvedTitle}
      size="md"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Mã xe"
            name="bus_number"
            value={formData.bus_number}
            onChange={(e) => setFormData({...formData, bus_number: e.target.value})}
            placeholder="VD: BUS-01"
            error={errors.bus_number}
            required
          />
          
          <FormInput
            label="Biển số"
            name="license_plate"
            value={formData.license_plate}
            onChange={(e) => setFormData({...formData, license_plate: e.target.value})}
            placeholder="VD: 51A-123.45"
            error={errors.license_plate}
            required
          />
          
          <FormInput
            label="Trạng thái"
            name="status"
            type="select"
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            options={[
              { value: "active", label: "Đang hoạt động" },
              { value: "maintenance", label: "Đang bảo trì" },
              { value: "inactive", label: "Không hoạt động" }
            ]}
            required
          />
        </div>

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
            {mode === "edit" ? "Cập nhật" : "Thêm xe"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
