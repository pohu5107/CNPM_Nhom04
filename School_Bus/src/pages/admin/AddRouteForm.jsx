import { useState, useEffect } from "react";
import Modal from "../../components/UI/Modal";
import FormInput from "../../components/common/FormInput";
import Button from "../../components/common/Button";
import boxDialog from "../../components/UI/BoxDialog";
export default function AddRouteForm({ visible, onCancel, title = "Thêm tuyến đường", onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    distance: "",
    status: "active"
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset errors when modal opens
  useEffect(() => {
    if (visible) {
      setErrors({});
    }
  }, [visible]);

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên tuyến đường là bắt buộc";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Tên tuyến đường phải có ít nhất 3 ký tự";
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
      boxDialog("Thêm tuyến đường thành công!", "success");

      // Reset form only on success
      setFormData({
        name: "",
        distance: "",
        status: "active"
      });
      setErrors({});
    } catch (error) {
      boxDialog("Thêm tuyến đường thất bại!", "error");
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={visible}
      onClose={onCancel}
      title={title}
      size="md"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormInput
          label="Tên tuyến đường"
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="VD: Hồng bàng - An Dương Vương"
          error={errors.name}
          required
        />
        
        <FormInput
          label="Khoảng cách"
          name="distance"
          value={formData.distance}
          onChange={(e) => setFormData({...formData, distance: e.target.value})}
          placeholder="VD: 15 km"
          error={errors.distance}
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
            Xác nhận
          </Button>
        </div>
      </form>
    </Modal>
  );
}
