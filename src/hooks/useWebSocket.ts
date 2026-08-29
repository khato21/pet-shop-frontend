import { useEffect, useRef, useState } from "react";

import type { WebSocketMessage } from "../interfaces/websocket.interface";
import type { WebSocketState } from "../interfaces/websocket-state.interface";

const WEBSOCKET_URL = "ws://localhost:3001";

export const useWebSocket = (
  onMessage?: (message: WebSocketMessage) => void | Promise<void>,
  onConnected?: () => void,
) => {
  const [state, setState] = useState<WebSocketState>({
    connected: false,
    loading: true,
    error: null,
  });

  const socketRef = useRef<WebSocket | null>(null);

  const onMessageRef = useRef(onMessage);
  const onConnectedRef = useRef(onConnected);

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

      socket.onopen = () => {
        if (isUnmounted || socket !== socketRef.current) {
          return;
        }

        console.log("SHOP WebSocket connected");

        setState({
          connected: true,
          loading: false,
          error: null,
        });

        onConnectedRef.current?.();
      };

      socket.onmessage = async (event) => {
        if (isUnmounted || socket !== socketRef.current) {
          return;
        }

        try {
          const rawMessage = JSON.parse(event.data);

          console.log("SHOP WebSocket message received:", rawMessage);

          if (
            !rawMessage ||
            typeof rawMessage !== "object" ||
            typeof rawMessage.type !== "string"
          ) {
            return;
          }

          const message = rawMessage as WebSocketMessage;

          await onMessageRef.current?.(message);
        } catch (error) {
          if (isUnmounted || socket !== socketRef.current) {
            return;
          }

          console.error("Error handling WebSocket message:", error);

          setState((prevState) => ({
            ...prevState,
            error: "Failed to process WebSocket message.",
          }));
        }
      };

      socket.onclose = () => {
        if (isUnmounted || socket !== socketRef.current) {
          return;
        }

        console.log("SHOP WebSocket disconnected");

        setState((prevState) => ({
          ...prevState,
          connected: false,
          loading: false,
        }));

        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectTimeoutRef.current = null;

          if (!isUnmounted) {
            console.log("SHOP WebSocket reconnecting...");
            connect();
          }
        }, 1000);
      };

      socket.onerror = (error) => {
        if (isUnmounted || socket !== socketRef.current) {
          return;
        }

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
        reconnectTimeoutRef.current = null;
      }

      const socket = socketRef.current;

      if (socket) {
        socket.onopen = null;
        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null;

        if (socket.readyState === WebSocket.OPEN) {
          socket.close();
        }
      }

      socketRef.current = null;
    };
  }, []);

  const sendMessage = (message: string): void => {
    const socket = socketRef.current;

    if (!socket) {
      console.warn("WebSocket is not connected");
      return;
    }

    if (socket.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket is not open");
      return;
    }

    socket.send(message);
  };

  return {
    ...state,
    sendMessage,
  };
};
