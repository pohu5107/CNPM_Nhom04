export default function DetailsBusForm({ visible, onCancel, bus }) {
    if (!visible || !bus) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
            <div className=" z-10 w-full max-w-xl rounded-lg bg-white p-4 shadow-lg">
                <div className="mb-3 flex items-center justify-between border-b-2">
                    <h2 className="text-lg font-bold">Chi tiết xe</h2>
                    <button onClick={onCancel} className="h-8 rounded-md px-2 text-slate-600 hover:bg-slate-100">Đóng</button>
                </div>
                <div className="text-slate-700 flex gap-3">
                    {/* Khung trái */}
                    <div className="w-1/3 flex flex-col items-center border rounded-lg p-4 bg-slate-50">
                        <img
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSlxy5ORfVv_R_JxYHwwEOWcjZc1ZolMXV0w&s"
                            alt="Ảnh xe buýt"
                            className="w-24 h-24 rounded-full object-cover mb-3 border"
                        />
                        <div className=" text-slate-500 mb-1">Mã xe: <span className="font-semibold text-slate-700">{bus.bus_number}</span></div>
                        <div className="text-base font-semibold text-slate-700">Trạng thái: {bus.status || "Không rõ"}</div>
                    </div>

                    {/* khung phải */}
                    <div className="w-2/3 flex flex-col gap-4">
                        <div className="border rounded-lg p-4 bg-slate-50 mb-2">
                            <div className="mb-2">
                                <span className="font-semibold">Biển số:</span> {bus.license_plate}
                            </div>
                            <div className="mb-2">
                                <span className="font-semibold">Số ghế:</span> {bus.capacity ?? "Trống"}
                            </div>
                            <div className="mb-2">
                                <span className="font-semibold">Thời gian tạo:</span> {bus.created_at || "Trống"}
                            </div>
                        </div>
                        <div className="border rounded-lg p-3 bg-blue-50 text-blue-800 text-sm">
                            <span className="font-semibold">Ghi chú:</span> Bình thường.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}