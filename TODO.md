# TODO - Port 5002 / nodemon crash fix

- [ ] Inspect current port/proxy wiring (vite.config.js and backend/server.js) to confirm defaults and env names
- [ ] Draft fix plan: stop using fixed backend port (or enable fallback) and ensure Vite proxy aligns with the actual backend port
- [ ] Update backend/server.js to enable `ALLOW_PORT_FALLBACK` by default (so it won’t crash immediately on EADDRINUSE)
- [ ] Update frontend `vite.config.js` to optionally read fallback port (via env var) and document how to set `VITE_API_PROXY_TARGET`
- [ ] (If needed) add a startup log that prints the active listening port
- [ ] Test: stop existing node on port 5002 (user command) then run `npm run dev` and verify backend starts and Vite proxy works

