import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const DEFAULT_PORT = 5002;
const buildUrl = () => {
  try {
    const proto = window.location.protocol;
    const host = window.location.hostname;
    return `${proto}//${host}:${DEFAULT_PORT}`;
  } catch (e) {
    return `http://localhost:${DEFAULT_PORT}`;
  }
};

let singleton = null;

export default function useSocket(room) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!singleton) {
      const url = buildUrl();
      singleton = io(url, { transports: ['websocket', 'polling'] });
    }

    socketRef.current = singleton;

    if (room && socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('join', { room });
    } else if (room && socketRef.current) {
      socketRef.current.once('connect', () => socketRef.current.emit('join', { room }));
    }

    return () => {
      // don't disconnect the singleton when component unmounts, keep connection alive for app
      socketRef.current = null;
    };
  }, [room]);

  return singleton;
}
