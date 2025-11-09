import { useState } from 'react';
import PropTypes from 'prop-types';
import Table from '../../common/Table';

const ScheduleTable = ({ schedules = [], loading = false, onAdd, onEdit, onView, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [driverFilter, setDriverFilter] = useState('');
  const [busFilter, setBusFilter] = useState('');
  const [routeFilter, setRouteFilter] = useState('');
  const [shiftTypeFilter, setShiftTypeFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  const uniqueDrivers = [...new Set(schedules.map(s => s.driver_name).filter(Boolean))].sort();
  const uniqueBuses = [...new Set(schedules.map(s => s.license_plate).filter(Boolean))].sort();
  const uniqueRoutes = [...new Set(schedules.map(s => s.route_name).filter(Boolean))].sort();
  const uniqueShiftTypes = [...new Set(schedules.map(s => s.shift_type).filter(Boolean))].sort();

  if (loading) {
    return (
      <div className="mx-8">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
          <p className="text-gray-500 mt-4">Đang tải danh sách lịch trình...</p>
        </div>
      </div>
    );
  }

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch =
      schedule.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.route_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.start_point?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.end_point?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDriver = !driverFilter || schedule.driver_name === driverFilter;
    const matchesBus = !busFilter || schedule.license_plate === busFilter;
    const matchesRoute = !routeFilter || schedule.route_name === routeFilter;
    const matchesShiftType = !shiftTypeFilter || schedule.shift_type === shiftTypeFilter;

    const scheduleDate = schedule.date ? new Date(schedule.date) : null;
    const matchesStartDate =
      !startDateFilter || (scheduleDate && scheduleDate >= new Date(startDateFilter));
    const matchesEndDate =
      !endDateFilter || (scheduleDate && scheduleDate <= new Date(endDateFilter));

    return (
      matchesSearch &&
      matchesDriver &&
      matchesBus &&
      matchesRoute &&
      matchesShiftType &&
      matchesStartDate &&
      matchesEndDate
    );
  });

  const columns = [
    { key: 'driver_name', header: 'Tài xế' },
    { key: 'license_plate', header: 'Xe buýt' },
    { key: 'route_name', header: 'Tuyến' },
    { key: 'date', header: 'Ngày' },
    { 
      key: 'shift_type', 
      header: 'Loại ca',
      render: (value) => {
        switch(value) {
          case 'morning': return 'Ca sáng';
          case 'afternoon': return 'Ca chiều';
          case 'evening': return 'Ca tối';
          default: return value;
        }
      }
    },
    { key: 'start_time', header: 'Giờ bắt đầu' },
    { key: 'end_time', header: 'Giờ kết thúc' },
    { key: 'student_count', header: 'Số học sinh' },
    { 
      key: 'status', 
      header: 'Trạng thái',
      render: (value) => {
        switch(value) {
          case 'scheduled': return 'Đã lên lịch';
          case 'in_progress': return 'Đang thực hiện';
          case 'completed': return 'Hoàn thành';
          case 'cancelled': return 'Đã hủy';
          default: return value;
        }
      }
    },
  ];

  const filters = [
    {
      placeholder: 'Tất cả tài xế',
      value: driverFilter,
      onChange: setDriverFilter,
      options: uniqueDrivers.map(d => ({ value: d, label: d })),
      minWidth: '140px'
    },
    {
      placeholder: 'Tất cả xe buýt',
      value: busFilter,
      onChange: setBusFilter,
      options: uniqueBuses.map(b => ({ value: b, label: b })),
      minWidth: '140px'
    },
    {
      placeholder: 'Tất cả tuyến',
      value: routeFilter,
      onChange: setRouteFilter,
      options: uniqueRoutes.map(r => ({ value: r, label: r })),
      minWidth: '140px'
    },
    {
      placeholder: 'Tất cả loại ca',
      value: shiftTypeFilter,
      onChange: setShiftTypeFilter,
      options: uniqueShiftTypes.map(st => ({
        value: st,
        label:
          st === 'morning'
            ? 'Ca sáng'
            : st === 'afternoon'
            ? 'Ca chiều'
            : st === 'evening'
            ? 'Ca tối'
            : st
      })),
      minWidth: '140px'
    },
  ];

  return (
    <div>
      {/*  Lọc ngày — float right */}
      <div className="flex justify-end items-center gap-3 mb-4 px-8">
        <label className="text-sm text-gray-600">Từ ngày:</label>
        <input
          type="date"
          value={startDateFilter}
          onChange={(e) => setStartDateFilter(e.target.value)}
          className="border rounded-lg px-3 py-1 text-sm"
        />

        <label className="text-sm text-gray-600">Đến ngày:</label>
        <input
          type="date"
          value={endDateFilter}
          onChange={(e) => setEndDateFilter(e.target.value)}
          className="border rounded-lg px-3 py-1 text-sm"
        />
      </div>

      <Table
        title="Quản lý Lịch trình"
        data={filteredSchedules}
        columns={columns}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onAdd={onAdd}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
        addButtonText="Thêm lịch trình"
        filters={filters}
        emptyMessage={
          searchTerm ||
          driverFilter ||
          busFilter ||
          routeFilter ||
          shiftTypeFilter ||
          startDateFilter ||
          endDateFilter
            ? 'Không tìm thấy lịch trình nào phù hợp'
            : 'Chưa có lịch trình nào'
        }
      />
    </div>
  );
};

ScheduleTable.propTypes = {
  schedules: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  onAdd: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default ScheduleTable;
