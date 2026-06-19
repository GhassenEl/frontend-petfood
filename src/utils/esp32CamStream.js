/**
 * Résolution des URLs de flux ESP32-CAM (MP4, MJPEG, snapshot API).
 */

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export function resolveEsp32CamStream(device, streamOverride) {
  const stream = { ...(device || {}), ...(streamOverride || {}) };
  const envMp4 = (import.meta.env.VITE_ESP32_CAM_MP4_URL || import.meta.env.VITE_ESP32_CAM_VIDEO_URL || '').trim();
  const envMjpeg = (import.meta.env.VITE_ESP32_CAM_MJPEG_URL || import.meta.env.VITE_ESP32_CAM_STREAM_URL || '').trim();

  const mp4Url = stream.mp4Url || envMp4 || '';
  const mjpegUrl = stream.mjpegUrl || envMjpeg || '';
  const snapshotPath = stream.snapshotUrl
    || `${API_BASE}/client/iot/food-quality/snapshot?deviceKey=${encodeURIComponent(stream.deviceKey || device?.id || 'anonymous')}`;

  let streamType = stream.streamType || 'bowl';
  if (mjpegUrl) streamType = 'mjpeg';
  else if (mp4Url) streamType = 'mp4';
  else if (streamType === 'snapshot') streamType = 'snapshot';
  else streamType = 'bowl';

  return {
    streamType,
    mp4Url: mp4Url || null,
    mjpegUrl: mjpegUrl || null,
    snapshotUrl: snapshotPath,
  };
}

export function buildSnapshotFetchUrl(snapshotUrl, cacheBust = Date.now()) {
  if (!snapshotUrl) return '';
  const sep = snapshotUrl.includes('?') ? '&' : '?';
  return `${snapshotUrl}${sep}t=${cacheBust}`;
}
