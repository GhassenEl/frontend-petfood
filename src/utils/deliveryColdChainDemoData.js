const minsAgo = (m) => new Date(Date.now() - m * 60000).toISOString();
const minsFromNow = (m) => new Date(Date.now() + m * 60000).toISOString();

const mkTransitHistory = (base, points = 10) => {
  const hist = [];
  for (let i = points - 1; i >= 0; i -= 1) {
    hist.push({
      temperatureC: Math.round((base.temp + (points - i) * 0.15 + (Math.random() - 0.5)) * 10) / 10,
      humidityPct: Math.round(base.hum + (Math.random() - 0.5) * 3),
      luminosityLux: Math.round(base.lux + (Math.random() - 0.5) * 30),
      airQualityPpm: Math.round(base.air + (Math.random() - 0.5) * 25),
      recordedAt: minsAgo(i * 3),
    });
  }
  return hist;
};

export const DEMO_DELIVERY_SURVEILLANCE = {
  mode: 'demo',
  deliveries: [
    {
      id: 'del-101',
      orderId: 'ORD-8842',
      orderRef: '#8842',
      clientName: 'Client démo',
      address: 'La Marsa, Tunis',
      vehicleId: 'zone-vh-2',
      vehicleName: 'Camion frigorifique #07',
      livreurName: 'Karim B.',
      stage: 'transit',
      progressPercent: 62,
      etaMinutes: 18,
      distanceKmRemaining: 8.4,
      departedAt: minsAgo(42),
      sensorStartedAt: minsAgo(40),
      warehouseName: 'Entrepôt Tunis Nord',
      destination: { lat: 36.878, lng: 10.325 },
      livreur: { lat: 36.842, lng: 10.28 },
      doorOpenDurationMin: 0,
      currentReading: {
        temperatureC: 16.8,
        humidityPct: 46,
        luminosityLux: 280,
        airQualityPpm: 465,
        lidOpen: false,
        coolingActive: true,
        recordedAt: minsAgo(0.5),
      },
      sensorHistory: mkTransitHistory({ temp: 16.2, hum: 45, lux: 260, air: 450 }),
      batches: [
        {
          id: 'lot-d1',
          code: 'LOT-2026-0312',
          productName: 'Croquettes Premium Chien 15 kg',
          daysToExpiry: 92,
          maxShelfDays: 365,
          ageDays: 45,
          storageScore: 90,
        },
        {
          id: 'lot-d2',
          code: 'LOT-2026-0288',
          productName: 'Pâtée chat saumon 24 boîtes',
          daysToExpiry: 18,
          maxShelfDays: 180,
          ageDays: 62,
          storageScore: 78,
        },
      ],
    },
    {
      id: 'del-102',
      orderId: 'ORD-8851',
      orderRef: '#8851',
      clientName: 'Amira K.',
      address: 'Sfax centre',
      vehicleId: 'zone-vh-1',
      vehicleName: 'Camion livraison #12',
      livreurName: 'Sami M.',
      stage: 'transit',
      progressPercent: 38,
      etaMinutes: 45,
      distanceKmRemaining: 22,
      departedAt: minsAgo(28),
      sensorStartedAt: minsAgo(26),
      warehouseName: 'Entrepôt Tunis Nord',
      destination: { lat: 34.74, lng: 10.76 },
      livreur: { lat: 35.2, lng: 10.45 },
      doorOpenDurationMin: 0,
      currentReading: {
        temperatureC: 24.8,
        humidityPct: 58,
        luminosityLux: 340,
        airQualityPpm: 510,
        lidOpen: false,
        coolingActive: false,
        recordedAt: minsAgo(1),
      },
      sensorHistory: mkTransitHistory({ temp: 22, hum: 52, lux: 300, air: 490 }, 8),
      batches: [
        {
          id: 'lot-d3',
          code: 'LOT-2026-0199',
          productName: 'Friandises dentaires chien',
          daysToExpiry: 47,
          maxShelfDays: 270,
          ageDays: 90,
          storageScore: 58,
        },
      ],
    },
    {
      id: 'del-100',
      orderId: 'ORD-8820',
      orderRef: '#8820',
      clientName: 'Mohamed T.',
      address: 'Ariana',
      vehicleId: 'zone-vh-3',
      vehicleName: 'Camion frigorifique #03',
      livreurName: 'Karim B.',
      stage: 'delivered',
      progressPercent: 100,
      etaMinutes: 0,
      chainScore: 94,
      departedAt: minsAgo(180),
      receivedAt: minsAgo(95),
      warehouseName: 'Entrepôt Tunis Nord',
      currentReading: {
        temperatureC: 17.2,
        humidityPct: 44,
        luminosityLux: 200,
        airQualityPpm: 430,
        coolingActive: true,
        recordedAt: minsAgo(95),
      },
      sensorHistory: mkTransitHistory({ temp: 17, hum: 44, lux: 200, air: 430 }, 6),
      batches: [
        {
          id: 'lot-d4',
          code: 'LOT-2026-0401',
          productName: 'Aliment chat stérilisé 7 kg',
          daysToExpiry: 168,
          maxShelfDays: 365,
          ageDays: 12,
          storageScore: 91,
        },
      ],
    },
  ],
};

export const getClientDeliverySurveillance = (orderId) => {
  const match = DEMO_DELIVERY_SURVEILLANCE.deliveries.find(
    (d) => d.orderId === orderId || d.id === orderId,
  );
  const active = DEMO_DELIVERY_SURVEILLANCE.deliveries.find((d) => d.stage !== 'delivered');
  return {
    ...DEMO_DELIVERY_SURVEILLANCE,
    deliveries: match ? [match] : active ? [active] : [],
  };
};

export const getLivreurDeliverySurveillance = () => ({
  ...DEMO_DELIVERY_SURVEILLANCE,
  deliveries: DEMO_DELIVERY_SURVEILLANCE.deliveries.filter((d) => d.stage !== 'delivered'),
});

export const getVendorDeliverySurveillance = () => ({
  ...DEMO_DELIVERY_SURVEILLANCE,
  deliveries: DEMO_DELIVERY_SURVEILLANCE.deliveries.filter(
    (d) => d.id === 'del-102' || d.vehicleId === 'zone-vh-1',
  ),
});

export default DEMO_DELIVERY_SURVEILLANCE;
