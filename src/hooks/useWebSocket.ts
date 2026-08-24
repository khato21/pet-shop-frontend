import { useEffect, useRef, useState } from "react";

import type { WebSocketMessage } from "../interfaces/websocket.interface";
import type { WebSocketState } from "../interfaces/websocket-state.interface";

const WEBSOCKET_URL = "ws://localhost:3001";

export const useWebSocket = (
  onMessage?: (message: WebSocketMessage) => void | Promise<void>,
  onConnected?: () => void | Promise<void>,
) => {
  const [state, setState] = useState<WebSocketState>({
    connected: false,
    loading: true,
    error: null,
  });

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

      setState({
        connected: false,
        loading: true,
        error: null,
      });

      socket.onopen = async () => {
        console.log("SHOP WebSocket connected");

        setState({
          connected: true,
          loading: false,
          error: null,
        });

        try {
          await onConnectedRef.current?.();
        } catch (error) {
          console.error("Error handling WebSocket connection:", error);

          setState((previousState) => ({
            ...previousState,
            error: "Failed to synchronize data after WebSocket connection.",
          }));
        }
      };

      socket.onmessage = async (event) => {
        console.log("SHOP WebSocket message received:", event.data);

        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          await onMessageRef.current?.(message);
        } catch (error) {
          console.error("Error handling WebSocket message:", error);

          setState((previousState) => ({
            ...previousState,
            error: "Failed to process WebSocket message.",
          }));
        }
      };

      socket.onclose = () => {
        console.log("SHOP WebSocket disconnected");

        setState((previousState) => ({
          ...previousState,
          connected: false,
          loading: false,
        }));

        if (!isUnmounted) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("SHOP WebSocket reconnecting...");

            connect();
          }, 1000);
        }
      };

      socket.onerror = (error) => {
        console.error("SHOP WebSocket error:", error);

        setState({
          connected: false,
          loading: false,
          error: "WebSocket connection error.",
        });
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

    if (!socket) {
      console.warn("SHOP WebSocket is not connected");
      return;
    }

    if (socket.readyState !== WebSocket.OPEN) {
      console.warn("SHOP WebSocket is not open");
      return;
    }

    socket.send(message);
  };

  return {
    ...state,
    sendMessage,
  };
};
