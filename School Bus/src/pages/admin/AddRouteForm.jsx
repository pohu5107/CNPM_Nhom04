import { useState } from "react";

export default function AddRouteForm({ visible, onCancel, title = "Thêm tuyến đường" }) {
  const [stops, setStops] = useState([""]);
  
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
        <form  className=" gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-600">Mã tuyến đường</label>
            <input
              className="h-10 rounded-md border px-3 outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="VD: DBP"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-600">Tên tuyến đường</label>
            <input
              className="h-10 rounded-md border px-3 outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="VD: Hồng bàng - An Dương Vương"
            />
          </div>

          {Array.isArray(stops) &&
            stops.map((stop, idx) => (
              <div className="flex flex-col gap-1" key={idx}>
                <label className="text-sm text-slate-600">
                  Trạm {stops.length > 1 ? idx + 1 : ""}
                </label>
                <input
                  type="text"
                  className="h-10 rounded-md border px-3 outline-none focus:ring-2 focus:ring-slate-400"
                  placeholder="VD: Đại học Sài Gòn"
                  value={stop}
                  onChange={e => {
                    const newStops = [...stops];
                    newStops[idx] = e.target.value;
                    setStops(newStops);
                  }}
                />
              </div>
            ))}

          <button
            type="button"
            className="w-fit mt-2 mb-2 rounded-md border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-100 text-sm"
            onClick={() => setStops([...stops, ""])}
          >
            + Thêm trạm
          </button>

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
