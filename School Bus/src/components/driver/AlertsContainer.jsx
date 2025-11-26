export default function AlertsContainer({ alerts }) {
  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {alerts.slice(0, 3).map((alert) => (
        <div
          key={alert.id}
          className={`p-3 rounded-lg shadow-lg backdrop-blur-sm max-w-sm transition-all duration-300 ${
            alert.type === "success"
              ? "bg-green-100/95 text-green-800 border border-green-200"
              : alert.type === "warning"
              ? "bg-yellow-100/95 text-yellow-800 border border-yellow-200"
              : alert.type === "error"
              ? "bg-red-100/95 text-red-800 border border-red-200"
              : "bg-blue-100/95 text-blue-800 border border-blue-200"
          }`}
        >
          <div className="text-sm font-medium">{alert.message}</div>
        </div>
      ))}
    </div>
  );
}
