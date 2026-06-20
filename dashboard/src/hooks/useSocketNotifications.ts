import { useEffect, useRef } from "react";
import { useNotification } from "../components/NotificationProvider";
import { getToken } from "../api";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

export function useSocketNotifications() {
  const { notify } = useNotification();
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    const connect = () => {
      try {
        const wsUrl = SOCKET_URL.replace(/^http/, "ws") + "/ws?token=" + encodeURIComponent(token);
        ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "download:complete") {
              notify("success", `Video ready: ${data.title || "Unknown"}`);
            } else if (data.type === "download:error") {
              notify("error", `Failed: ${data.title || data.error || "Unknown"}`);
            } else if (data.type === "download:started") {
              notify("processing", `Processing: ${data.title || "New video"}`);
            }
          } catch {}
        };

        ws.onclose = () => {
          reconnectTimer = setTimeout(connect, 5000);
        };

        ws.onerror = () => {
          ws?.close();
        };
      } catch {}
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, [notify]);
}
