import { useEffect, useState, createContext, useContext, useCallback } from "react";
import { CheckCircle, AlertCircle, Loader, X } from "lucide-react";

type NotificationType = "success" | "error" | "processing";
interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationContextValue {
  notify: (type: NotificationType, message: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification must be used within NotificationProvider");
  return ctx;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback((type: NotificationType, message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setNotifications((prev) => [...prev, { id, type, message }]);
    if (type !== "processing") {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 4000);
    }
  }, []);

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2 max-w-sm">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm animate-in slide-in-from-right ${
              n.type === "success"
                ? "bg-green-950 border-green-800 text-green-300"
                : n.type === "error"
                ? "bg-red-950 border-red-800 text-red-300"
                : "bg-blue-950 border-blue-800 text-blue-300"
            }`}
          >
            {n.type === "success" && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
            {n.type === "error" && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            {n.type === "processing" && <Loader className="w-4 h-4 flex-shrink-0 animate-spin" />}
            <span className="flex-1">{n.message}</span>
            <button onClick={() => dismiss(n.id)} className="flex-shrink-0 opacity-60 hover:opacity-100">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
