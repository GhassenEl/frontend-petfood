import { io } from 'socket.io-client';

const DEFAULT_PORT = 5002;

const buildUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  if (import.meta.env.PROD) {
    return window.location.origin;
  }
  const proto = window.location.protocol;
  const host = window.location.hostname;
  return `${proto}//${host}:${DEFAULT_PORT}`;
};

const SOCKET_OPTIONS = {
  transports: ['polling', 'websocket'],
  reconnection: true,
  reconnectionAttempts: 12,
  reconnectionDelay: 1500,
  timeout: 20000,
  autoConnect: true,
};

let socket = null;

/** Connexion Socket.IO partagée (une seule instance pour toute l'app). */
export function getSocket() {
  if (!socket) {
    socket = io(buildUrl(), SOCKET_OPTIONS);
  }
  return socket;
}

export default getSocket;
