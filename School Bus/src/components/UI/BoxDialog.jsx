import { createRoot } from "react-dom/client";
import { CheckCircle, XCircle, Info } from "lucide-react";

export default function boxDialog(type = "info") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className =
      "fixed bottom-4 right-4 z-[9999] flex flex-col-reverse gap-3 items-end";
    document.body.appendChild(container);
  }

  const toastEl = document.createElement("div");
  container.appendChild(toastEl);

  const visibleTime = 3000;

  setTimeout(() => {
    toastEl.classList.add("-translate-x-8", "opacity-0");
    setTimeout(() => toastEl.remove(), 400);
  }, visibleTime);

  const Toast = () => {
    const bg =
      type === "success"
        ? "bg-green-500"
        : type === "error"
        ? "bg-red-500"
        : "bg-blue-500";

    const Icon =
      type === "success"
        ? CheckCircle
        : type === "error"
        ? XCircle
        : Info;

    const title =
      type === "success"
        ? "Thao tác thành công"
        : type === "error"
        ? "Thao tác thất bại"
        : "Thông tin";

    return (
      <div
        className={`h-14 flex items-center gap-3 text-white px-4 py-3 rounded-xl shadow-lg transform transition-all duration-500 ease-out translate-y-8 opacity-0 w-72 max-w-[90vw] ${bg}`}
      >
        <Icon size={20} className="flex-shrink-0" />
        <span className="text-sm font-medium">{title}</span>
      </div>
    );
  };

  const root = createRoot(toastEl);
  root.render(<Toast />);

  setTimeout(() => {
    const el = toastEl.firstChild;
    el.classList.remove("translate-y-8", "opacity-0");
    el.classList.add("translate-y-0", "opacity-100");
  }, 50);
}
