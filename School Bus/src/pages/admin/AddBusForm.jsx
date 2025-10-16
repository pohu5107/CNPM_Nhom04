import { useEffect, useState } from "react";

export default function AddBusForm({ visible, onCancel, title = "Thêm xe" }) {
  
  // nếu false ko render
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-xl rounded-lg bg-white p-4 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onCancel} className="h-8 rounded-md px-2 text-slate-600 hover:bg-slate-100">Đóng</button>
        </div>
        <form  className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-600">Mã xe</label>
            <input
              className="h-10 rounded-md border px-3 outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="VD: BUS-01"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-600">Biển số</label>
            <input
              className="h-10 rounded-md border px-3 outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="VD: 51A-123.45"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-600">Số ghế</label>
            <input
              type="number"
              min={0}
              className="h-10 rounded-md border px-3 outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="VD: 45"
            />
          </div>
          
          <div className="md:col-span-2 mt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              className="inline-flex h-10 items-center rounded-md border px-4 hover:bg-slate-50"
              onClick={onCancel}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-md bg-slate-900 px-4 text-white hover:bg-slate-800"
              onClick={() => alert("Đã bấm")}
            >
              Xác nhận
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
