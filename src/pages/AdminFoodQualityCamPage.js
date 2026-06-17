import React from 'react';
import { Link } from 'react-router-dom';
import { Camera } from 'lucide-react';
import IoTFoodQualityCamPanel from '../components/IoTFoodQualityCamPanel';
import './AdminPages.css';

/** Vue admin — surveillance ESP32-CAM PetFoodIoT (scores, alertes, LCD). */
const AdminFoodQualityCamPage = () => (
  <div className="adm-page">
    <header className="adm-hero">
      <h1><Camera size={24} /> ESP32-CAM — Qualité alimentaire PetFoodIoT</h1>
      <p>
        Contrôle admin des scores IA, alertes nourriture altérée et affichage LCD PETFOODIOT.
        {' '}
        <Link to="/admin/food-quality">Surveillance chaîne du froid →</Link>
        {' · '}
        <Link to="/admin/iot-anomalies">Anomalies IoT →</Link>
      </p>
    </header>
    <div className="adm-card">
      <IoTFoodQualityCamPanel loading={false} />
    </div>
  </div>
);

export default AdminFoodQualityCamPage;
