import { useEffect, useMemo, useState } from 'react';
import Modal from '../UI/Modal';
import { schedulesService } from '../../services/schedulesService';
import { studentAssignmentsService } from '../../services/studentAssignmentsService';

// Props:
// - isOpen, onClose
// - schedule: row from admin list (contains id as CHxxx + schedule_id numeric maybe)
// - onChanged: callback after any successful assign/unassign to refresh parent
const AssignStudentsModal = ({ isOpen, onClose, schedule, onChanged }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState(null); // schedule detail includes route_id
  const [stops, setStops] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [unassigned, setUnassigned] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [selected, setSelected] = useState([]); // selected student ids from unassigned list
  const [pickupStopId, setPickupStopId] = useState(null);
  const [dropoffStopId, setDropoffStopId] = useState(null);

  const effectiveDate = useMemo(() => schedule?.date, [schedule]);

  const loadAll = async () => {
    if (!schedule) return;
    setLoading(true);
    setError('');
    try {
      // 1) Ensure we have full schedule (route_id, shift_type)
      const scId = schedule?.schedule_id || schedule?.id;
      const sc = await schedulesService.getAdminScheduleById(scId);
      setDetail(sc);

      // 2) Route stops for selection (chỉ pickup stops, dropoff tự động là điểm cuối)
      const stopsRes = await studentAssignmentsService.getRouteStops(sc.route_id);
      setStops(stopsRes);
      
      // Đặt mặc định: pickup stop đầu tiên (1-98) và dropoff là điểm cuối (99)
      const firstPickup = stopsRes.pickup_stops?.[0];
      setPickupStopId(firstPickup?.stop_id || null);
      setDropoffStopId(stopsRes.dropoff_stop?.stop_id || null);

      // 3) Current assignments for that date + shift
      const assignRes = await studentAssignmentsService.getAssignments({
        route_id: sc.route_id,
        date: sc.date,
        shift_type: sc.shift_type,
      });
      setAssignments(assignRes);

      // 4) Unassigned students
      const unassignedRes = await studentAssignmentsService.getUnassigned({
        date: sc.date,
        shift_type: sc.shift_type,
        keyword: keyword || '',
      });
      setUnassigned(unassignedRes);
    } catch (e) {
      setError(e?.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAll();
    } else {
      // reset when closed
      setSelected([]);
      setKeyword('');
      setError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const filteredUnassigned = useMemo(() => {
    if (!keyword) return unassigned;
    const kw = keyword.toLowerCase();
    return unassigned.filter(u => (u.name || '').toLowerCase().includes(kw) || (u.class_name || '').toLowerCase().includes(kw));
  }, [unassigned, keyword]);

  const toggleSelect = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleAssign = async () => {
    if (!detail) return;
    if (selected.length === 0) {
      setError('Vui lòng chọn ít nhất 1 học sinh');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await studentAssignmentsService.bulkAssign({
        route_id: detail.route_id,
        shift_type: detail.shift_type,
        date: detail.date,
        student_ids: selected,
        pickup_stop_id: pickupStopId,
        dropoff_stop_id: dropoffStopId,
      });
      setSelected([]);
      await loadAll();
      onChanged && onChanged();
    } catch (e) {
      setError(e?.message || 'Không thể phân công');
    } finally {
      setLoading(false);
    }
  };

  const removeAssignment = async (id) => {
    setLoading(true);
    setError('');
    try {
      await studentAssignmentsService.deleteAssignment(id);
      await loadAll();
      onChanged && onChanged();
    } catch (e) {
      setError(e?.message || 'Không thể bỏ phân công');
    } finally {
      setLoading(false);
    }
  };

  const title = detail ? `Phân công học sinh — ${detail.route_name} — ${detail.date} — ${detail.shift_type === 'morning' ? 'Ca sáng' : detail.shift_type === 'afternoon' ? 'Ca chiều' : detail.shift_type}` : 'Phân công học sinh';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
      {loading && (
        <div className="mb-3 text-sm text-slate-500">Đang tải...</div>
      )}
      {error && (
        <div className="mb-3 p-2 rounded bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {/* Controls */}
      <div className="flex gap-3 items-end mb-4">
        <div className="flex-1">
          <label className="block text-xs text-slate-600 mb-1">Tìm học sinh</label>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Nhập tên hoặc lớp"
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-600 mb-1">Điểm đón</label>
          <select value={pickupStopId || ''} onChange={(e) => setPickupStopId(e.target.value ? Number(e.target.value) : null)} className="border rounded px-3 py-2 min-w-[220px]">
            <option value="">-- Chọn điểm đón --</option>
            {stops.pickup_stops?.map(s => (
              <option key={s.stop_id} value={s.stop_id}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-600 mb-1">Điểm trả</label>
          <div className="border rounded px-3 py-2 min-w-[220px] bg-gray-50 text-gray-700">
            {stops.dropoff_stop?.label || '-- Tự động: điểm cuối tuyến --'}
          </div>
          <div className="text-xs text-slate-500 mt-1">Điểm trả được tự động đặt là điểm cuối tuyến</div>
        </div>
        <div>
          <button onClick={handleAssign} className="h-10 px-4 bg-emerald-600 text-white rounded hover:bg-emerald-700">Phân công</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Unassigned List */}
        <div className="border rounded">
          <div className="px-4 py-2 bg-slate-50 border-b font-semibold">Chưa phân công ({unassigned.length})</div>
          <div className="max-h-[50vh] overflow-auto">
            {filteredUnassigned.map(s => (
              <label key={s.id} className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 border-b">
                <input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggleSelect(s.id)} />
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-slate-500">
                    {s.class_name || '-'}
                    {s.current_route_info && (
                      <span className="text-orange-600 ml-2">{s.current_route_info}</span>
                    )}
                  </div>
                </div>
              </label>
            ))}
            {filteredUnassigned.length === 0 && (
              <div className="p-4 text-sm text-slate-500">Không có học sinh</div>
            )}
          </div>
        </div>

        {/* Assigned List */}
        <div className="border rounded">
          <div className="px-4 py-2 bg-slate-50 border-b font-semibold">Đã phân công ({assignments.length})</div>
          <div className="max-h-[50vh] overflow-auto">
            {assignments.map(a => (
              <div key={a.id} className="flex items-center justify-between gap-3 px-4 py-2 border-b">
                <div>
                  <div className="font-medium">{a.student_name}</div>
                  <div className="text-xs text-slate-500">{a.class_name || '-'} · {a.pickup_stop_name || '—'} → {a.dropoff_stop_name || '—'}</div>
                </div>
                <button onClick={() => removeAssignment(a.id)} className="text-red-600 hover:text-red-700 text-sm">Bỏ</button>
              </div>
            ))}
            {assignments.length === 0 && (
              <div className="p-4 text-sm text-slate-500">Chưa có phân công</div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AssignStudentsModal;
