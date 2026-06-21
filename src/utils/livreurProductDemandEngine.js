/** Analyse produits demandés — livreur (populaires, lourds, par région). */

export const LIVREUR_REGIONS = ['Tunis', 'Ariana', 'Sfax', 'Sousse', 'Nabeul', 'Bizerte'];

export const buildLivreurProductDemandAnalysis = (region = 'Tunis') => ({
  region,
  popularProducts: [
    { id: 'p1', name: 'Croquettes chien adulte 12 kg', orders: 142, weightKg: 12, trend: '+18%' },
    { id: 'p2', name: 'Litière chat agglomérante 10 L', orders: 98, weightKg: 8.5, trend: '+12%' },
    { id: 'p3', name: 'Pâtée chat saumon x12', orders: 87, weightKg: 4.8, trend: '+8%' },
    { id: 'p4', name: 'Friandises dentaires chien', orders: 76, weightKg: 0.5, trend: '+22%' },
    { id: 'p5', name: 'Gravier aquarium 5 kg', orders: 54, weightKg: 5, trend: '+5%' },
  ],
  heavyProducts: [
    { id: 'h1', name: 'Sac croquettes 20 kg', avgWeightKg: 20, deliveriesWeek: 34, tip: 'Prévoir diable ou aide' },
    { id: 'h2', name: 'Litière 15 kg', avgWeightKg: 15, deliveriesWeek: 28, tip: 'Étages sans ascenseur — +5 min' },
    { id: 'h3', name: 'Cage transport XL', avgWeightKg: 8, deliveriesWeek: 12, tip: 'Vérifier dimensions véhicule' },
  ],
  byRegion: LIVREUR_REGIONS.map((r) => ({
    region: r,
    ordersWeek: r === region ? 48 : Math.floor(20 + Math.random() * 40),
    topProduct: r === 'Tunis' ? 'Croquettes 12 kg' : r === 'Sfax' ? 'Aquarium kit' : 'Litière chat',
    heavySharePct: r === 'Sousse' ? 38 : 22 + Math.floor(Math.random() * 15),
    isCurrentZone: r === region,
  })),
  analyzedAt: new Date().toISOString(),
});

export default { buildLivreurProductDemandAnalysis, LIVREUR_REGIONS };
