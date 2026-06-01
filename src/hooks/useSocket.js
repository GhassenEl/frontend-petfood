import { useEffect, useRef } from 'react';
import getSocket from '../utils/socketClient';

export default function useSocket(room) {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    const joinRoom = () => {
      if (room) socket.emit('join', { room });
    };

    if (room) {
      if (socket.connected) joinRoom();
      else socket.once('connect', joinRoom);
    }

    return () => {
      if (room) socket.off('connect', joinRoom);
      socketRef.current = null;
    };
  }, [room]);

  return getSocket();
}
