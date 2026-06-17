import React from 'react';
import { Thermometer, Droplets } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';

const IoTEnvironmentPanel = ({ environment, telemetry }) => {
  const env = environment || {};
  const tempSeries = (telemetry?.temperature7d || [22, 23, 24, 24.2, 25, 24, 23.5]).map((t, i) => ({
    day: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][i] || `J${i + 1}`,
    temp: t,
    humidity: (telemetry?.humidity7d || [52, 55, 58, 60, 62, 58, 56])[i],
  }));

  return (
    <section className="iot-env-panel">
      <header className="iot-env-panel__head">
        <h3>Environnement &amp; capteurs</h3>
        <span className={`iot-env-status iot-env-status--${env.status || 'ok'}`}>
          {env.status === 'warning' ? '⚠️ Surveillance' : '✅ Normes'}
        </span>
      </header>

      <div className="iot-env-kpis">
        <div className="iot-env-kpi">
          <Thermometer size={18} color="#d97706" />
          <div>
            <strong>{env.avgTemperature ?? '—'} °C</strong>
            <span>Température moyenne</span>
          </div>
        </div>
        <div className="iot-env-kpi">
          <Droplets size={18} color="#0ea5e9" />
          <div>
            <strong>{env.avgHumidity ?? '—'} %</strong>
            <span>Humidité moyenne</span>
          </div>
        </div>
        <div className="iot-env-kpi">
          <strong>{env.deviceCount ?? 0}</strong>
          <span>Capteurs actifs</span>
        </div>
      </div>

      {(env.devices || []).length > 0 && (
        <ul className="iot-env-devices">
          {env.devices.map((d) => (
            <li key={d.id}>
              <span className="iot-env-dev-name">{d.name}</span>
              <span>
                {d.temperature != null && `${d.temperature} °C`}
                {d.temperature != null && d.humidity != null && ' · '}
                {d.humidity != null && `${d.humidity} % HR`}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="iot-env-chart">
        <h4>Tendance 7 jours — température &amp; humidité</h4>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={tempSeries}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 10 }} />
            <YAxis yAxisId="temp" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
            <YAxis yAxisId="hum" orientation="right" tick={{ fontSize: 10 }} domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line yAxisId="temp" type="monotone" dataKey="temp" name="°C" stroke="#d97706" strokeWidth={2} dot={{ r: 2 }} />
            <Line yAxisId="hum" type="monotone" dataKey="humidity" name="HR %" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default IoTEnvironmentPanel;
