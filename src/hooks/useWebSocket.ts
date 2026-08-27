import { useEffect, useRef, useState } from "react";

import type { WebSocketMessage } from "../interfaces/websocket.interface";

const WEBSOCKET_URL = "ws://localhost:3001";

export const useWebSocket = (
  onMessage?: (message: WebSocketMessage) => void | Promise<void>,
  onConnected?: () => void | Promise<void>,
) => {
  const [connected, setConnected] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);

  const onMessageRef = useRef<
    ((message: WebSocketMessage) => void | Promise<void>) | undefined
  >(onMessage);

  const onConnectedRef = useRef<(() => void | Promise<void>) | undefined>(
    onConnected,
  );

  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onConnectedRef.current = onConnected;
  }, [onConnected]);

  useEffect(() => {
    let isUnmounted = false;

    const connect = () => {
      if (isUnmounted) {
        return;
      }

      const socket = new WebSocket(WEBSOCKET_URL);

      socketRef.current = socket;

      socket.onopen = async () => {
        setConnected(true);

        try {
          await onConnectedRef.current?.();
        } catch (error) {
          console.error("WebSocket connection handler error:", error);
        }
      };

      socket.onmessage = async (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          await onMessageRef.current?.(message);
        } catch (error) {
          console.error("WebSocket message handler error:", error);
        }
      };

      socket.onclose = () => {
        setConnected(false);

        if (!isUnmounted) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 1000);
        }
      };

      socket.onerror = () => {
        setConnected(false);
      };
    };

    connect();

    return () => {
      isUnmounted = true;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      socketRef.current?.close();

      socketRef.current = null;
    };
  }, []);

  const sendMessage = (message: string): void => {
    const socket = socketRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    socket.send(message);
  };

  return {
    connected,
    sendMessage,
  };
};
