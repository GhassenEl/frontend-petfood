import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import api from '../utils/api';
import { resolveEsp32CamStream } from '../utils/esp32CamStream';
import PetFoodLiveScene from './PetFoodLiveScene';

/**
 * Lecteur vidéo ESP32-CAM — MP4, MJPEG ou snapshots API (MAJ ~5 s).
 */
const Esp32CamStreamPlayer = ({
  device,
  stream,
  reading,
  isLive,
  lastTickAt,
  refreshMs = 5000,
  className = '',
  overlay,
}) => {
  const videoRef = useRef(null);
  const [snapshotBlobUrl, setSnapshotBlobUrl] = useState('');
  const [streamError, setStreamError] = useState('');
  const [videoReady, setVideoReady] = useState(false);
  const [clock, setClock] = useState(() => Date.now());

  const urls = useMemo(
    () => resolveEsp32CamStream(device, stream),
    [device, stream],
  );

  const showMp4 = urls.streamType === 'mp4' && Boolean(urls.mp4Url);
  const showMjpeg = urls.streamType === 'mjpeg' && urls.mjpegUrl;
  const showBowl = urls.streamType === 'bowl';
  const showSnapshot = urls.streamType === 'snapshot';

  const deviceKey = device?.id || 'anonymous';

  const fetchSnapshot = useCallback(async () => {
    if (!showSnapshot || !isLive) return;
    try {
      const { data } = await api.get('/client/iot/food-quality/snapshot', {
        params: { deviceKey, t: Date.now() },
        responseType: 'blob',
      });
      const blobUrl = URL.createObjectURL(data);
      setSnapshotBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return blobUrl;
      });
      setStreamError('');
    } catch {
      setStreamError('Snapshot indisponible');
    }
  }, [showSnapshot, isLive, deviceKey]);

  useEffect(() => {
    if (!isLive || !lastTickAt) return undefined;
    const id = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isLive, lastTickAt]);

  useEffect(() => {
    if (!showSnapshot || !isLive) return undefined;
    fetchSnapshot();
    const id = setInterval(fetchSnapshot, refreshMs);
    return () => clearInterval(id);
  }, [showSnapshot, isLive, fetchSnapshot, refreshMs, lastTickAt]);

  useEffect(() => () => {
    if (snapshotBlobUrl) URL.revokeObjectURL(snapshotBlobUrl);
  }, [snapshotBlobUrl]);

  useEffect(() => {
    if (!showMp4 || !videoRef.current || !isLive) return;
    const video = videoRef.current;
    video.load();
    video.play().catch(() => {});
  }, [showMp4, urls.mp4Url, isLive, lastTickAt]);

  const secsAgo = lastTickAt
    ? Math.max(0, Math.round((clock - lastTickAt) / 1000))
    : null;

  return (
    <div className={`iot-fq-viewport__cam iot-fq-viewport__cam--video${showBowl ? ' iot-fq-viewport__cam--bowl-scene' : ''} ${className}`.trim()}>
      {showBowl && (
        <PetFoodLiveScene reading={reading} isLive={isLive} />
      )}

      {showMp4 && (
        <video
          ref={videoRef}
          key={urls.mp4Url}
          className="iot-fq-viewport__video"
          src={urls.mp4Url}
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => { setVideoReady(true); setStreamError(''); }}
          onError={() => setStreamError('Flux MP4 indisponible')}
        />
      )}

      {showMjpeg && (
        <img
          className="iot-fq-viewport__video"
          src={urls.mjpegUrl}
          alt="Flux MJPEG ESP32-CAM"
          onLoad={() => setStreamError('')}
          onError={() => setStreamError('Flux MJPEG indisponible')}
        />
      )}

      {showSnapshot && (
        snapshotBlobUrl ? (
          <img
            className="iot-fq-viewport__video"
            src={snapshotBlobUrl}
            alt="Snapshot ESP32-CAM"
          />
        ) : (
          <div className="iot-fq-viewport__video-placeholder">
            {isLive ? 'Chargement snapshot…' : 'Flux en pause'}
          </div>
        )
      )}

      {!videoReady && showMp4 && !streamError && isLive && (
        <div className="iot-fq-viewport__video-placeholder">Chargement vidéo MP4…</div>
      )}

      {streamError && (
        <div className="iot-fq-viewport__stream-error" role="status">{streamError}</div>
      )}

      <div className="iot-fq-viewport__overlay">
        {overlay}
        {isLive && (
          <span className="iot-fq-live-badge">
            <span className="iot-fq-live-dot" /> LIVE
          </span>
        )}
        {reading?.qualityScore != null && (
          <span className="iot-fq-viewport__score">{reading.qualityScore}/100</span>
        )}
      </div>

      {isLive && secsAgo != null && (
        <span className="iot-fq-viewport__refresh-hint">
          MAJ il y a {secsAgo}s
        </span>
      )}
    </div>
  );
};

export default Esp32CamStreamPlayer;
