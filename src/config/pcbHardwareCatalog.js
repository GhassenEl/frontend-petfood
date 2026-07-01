/**
 * Catalogue cartes PCB — distributeur PetfoodTN (Proteus ISIS → ARES).
 */

export const PCB_BOARDS = [
  {
    id: 'main',
    ref: 'PF-TN-PCB-CTRL-v1',
    label: 'Carte PCB imprimée — contrôle',
    shortLabel: 'PCB contrôle',
    icon: '🟢',
    color: '#059669',
    dimensions: '100 × 80 mm',
    layers: '2 couches (Top + Bottom)',
    thickness: '1,6 mm',
    finish: 'HASL sans plomb',
    role: 'Microcontrôleur ESP32, capteurs, actionneurs et connectique distributeur.',
    proteusProject: 'PetFeeder_CTRL.pdsprj',
    aresBoard: 'PF_FEEDER_MAIN',
    gerberPrefix: 'PF-TN-CTRL',
    connectors: [
      { id: 'J1', label: 'Alimentation 5 V', pins: '2×2', note: 'Depuis carte PSU — VCC/GND' },
      { id: 'J2', label: 'Servo SG90', pins: '3', note: 'GPIO 13 + 5 V + GND' },
      { id: 'J3', label: 'Moteur DC + relais', pins: '4', note: 'GPIO 14, diode flyback' },
      { id: 'J4', label: 'HX711', pins: '4', note: 'DOUT 33, SCK 4' },
      { id: 'J5', label: 'HC-SR04', pins: '4', note: 'TRIG 5, ECHO 18' },
      { id: 'J6', label: 'Capteurs IR / DHT11', pins: '6', note: 'IR 19, DHT 23' },
      { id: 'J7', label: 'LCD I2C 16×2', pins: '4', note: 'SDA 21, SCL 22' },
      { id: 'J8', label: 'LED RGB + buzzer', pins: '5', note: 'RGB 25-27, buzzer 32' },
    ],
    bom: [
      { ref: 'U1', part: 'ESP32-WROOM-32', qty: 1, package: 'QFN-38' },
      { ref: 'U2', part: 'AMS1117-3.3', qty: 1, package: 'SOT-223' },
      { ref: 'U3', part: 'HX711 (module)', qty: 1, package: 'Header 4p' },
      { ref: 'Q1', part: '2N2222 + relais 5 V', qty: 1, package: 'TO-92 + relay' },
      { ref: 'R1-R3', part: 'Résistances LED RGB 220 Ω', qty: 3, package: '0805' },
      { ref: 'C1-C4', part: 'Condensateurs découplage 100 nF', qty: 4, package: '0805' },
      { ref: 'J1-J8', part: 'Connecteurs à vis 2,54 mm', qty: 8, package: 'Header' },
      { ref: '—', part: 'Nappe I2C LCD (option)', qty: 1, package: '4 fils' },
    ],
    gpioMap: [
      { gpio: 5, signal: 'HC-SR04 TRIG', dir: 'OUT' },
      { gpio: 18, signal: 'HC-SR04 ECHO', dir: 'IN' },
      { gpio: 19, signal: 'Capteur IR', dir: 'IN' },
      { gpio: 33, signal: 'HX711 DOUT', dir: 'IN' },
      { gpio: 4, signal: 'HX711 SCK', dir: 'OUT' },
      { gpio: 23, signal: 'DHT11 DATA', dir: 'IN/OUT' },
      { gpio: 13, signal: 'Servo PWM', dir: 'OUT' },
      { gpio: 14, signal: 'Moteur DC (relais)', dir: 'OUT' },
      { gpio: 25, signal: 'LED R', dir: 'OUT' },
      { gpio: 26, signal: 'LED G', dir: 'OUT' },
      { gpio: 27, signal: 'LED B', dir: 'OUT' },
      { gpio: 32, signal: 'Buzzer', dir: 'OUT' },
      { gpio: 21, signal: 'I2C SDA', dir: 'I/O' },
      { gpio: 22, signal: 'I2C SCL', dir: 'OUT' },
    ],
    designRules: {
      traceSignal: '0,25 mm',
      tracePower: '0,8 mm',
      clearance: '0,2 mm',
      via: '0,6 / 0,3 mm',
    },
    zones: [
      { id: 'mcu', label: 'ESP32 + 3,3 V', x: 12, y: 18, w: 38, h: 28 },
      { id: 'power-in', label: 'Entrée 5 V', x: 4, y: 52, w: 18, h: 14 },
      { id: 'motor', label: 'Driver moteur', x: 58, y: 48, w: 22, h: 18 },
      { id: 'sensors', label: 'Capteurs', x: 58, y: 12, w: 28, h: 22 },
      { id: 'lcd', label: 'I2C / LCD', x: 12, y: 58, w: 24, h: 12 },
    ],
  },
  {
    id: 'power',
    ref: 'PF-TN-PSU-5V-v1',
    label: "Carte d'alimentation",
    shortLabel: 'PSU 5 V',
    icon: '⚡',
    color: '#d97706',
    dimensions: '80 × 60 mm',
    layers: '2 couches (Top + Bottom)',
    thickness: '1,6 mm',
    finish: 'HASL sans plomb',
    role: 'Conversion secteur ou adaptateur 12 V → 5 V stabilisé pour ESP32 et actionneurs.',
    proteusProject: 'PetFeeder_PSU.pdsprj',
    aresBoard: 'PF_FEEDER_PSU',
    gerberPrefix: 'PF-TN-PSU',
    connectors: [
      { id: 'J1', label: 'Entrée 12 V DC', pins: '2', note: 'Barillet 5,5×2,1 mm — polarité +' },
      { id: 'J2', label: 'Sortie vers PCB ctrl', pins: '2×2', note: '5 V / 3 A max — vers J1 main' },
      { id: 'J3', label: 'Fusible + interrupteur', pins: '—', note: 'Protection surcharge' },
      { id: 'J4', label: 'Terre chassis (option)', pins: '1', note: 'Boîtier métallique' },
    ],
    bom: [
      { ref: 'U1', part: 'LM2596-5.0 (buck)', qty: 1, package: 'TO-263-5' },
      { ref: 'D1', part: 'Diode Schottky SS34', qty: 1, package: 'SMA' },
      { ref: 'L1', part: 'Inductance 33 µH / 3 A', qty: 1, package: 'shielded' },
      { ref: 'C1-C2', part: 'Électrolytiques 470 µF 16 V', qty: 2, package: 'radial' },
      { ref: 'C3-C4', part: 'Céramiques 100 nF', qty: 2, package: '0805' },
      { ref: 'F1', part: 'Fusible 2 A rapide', qty: 1, package: '5×20 mm' },
      { ref: 'SW1', part: 'Interrupteur ON/OFF', qty: 1, package: 'panel' },
      { ref: 'J1-J2', part: 'Borniers + DC jack', qty: 2, package: '2,54 mm' },
    ],
    specs: [
      { label: 'Entrée', value: '9–24 V DC (adaptateur 12 V recommandé)' },
      { label: 'Sortie', value: '5,0 V ± 2 %' },
      { label: 'Courant max', value: '3 A (servo + moteur + ESP32)' },
      { label: 'Rendement', value: '~85 % à charge nominale' },
      { label: 'Protection', value: 'Fusible, diode inverse, découplage' },
    ],
    zones: [
      { id: 'input', label: 'Entrée 12 V', x: 6, y: 20, w: 20, h: 22 },
      { id: 'buck', label: 'Buck LM2596', x: 32, y: 16, w: 28, h: 30 },
      { id: 'output', label: 'Sortie 5 V', x: 58, y: 22, w: 18, h: 20 },
      { id: 'fuse', label: 'Fusible', x: 6, y: 48, w: 16, h: 10 },
    ],
  },
];

export const ARES_WORKFLOW_STEPS = [
  { step: 1, title: 'Schéma ISIS', detail: 'Dessinez le circuit dans Proteus ISIS — assignez chaque composant à son footprint PCB.' },
  { step: 2, title: 'Netlist → ARES', detail: 'Menu Outils → Netlist to ARES (ou bouton vert) pour transférer vers le layout.' },
  { step: 3, title: 'Contour carte', detail: 'Mode 2D Box, calque Board Edge — tracez le contour 100×80 mm (ctrl) ou 80×60 mm (PSU).' },
  { step: 4, title: 'Placement', detail: 'Placez ESP32 / buck au centre, connecteurs sur les bords, séparez analogique (HX711) et puissance moteur.' },
  { step: 5, title: 'Règles de design', detail: 'Technology → Design Rules : pistes signal 0,25 mm, alim 0,8 mm, clearance 0,2 mm.' },
  { step: 6, title: 'Routage', detail: 'Routage manuel ou auto-router — priorité : 5 V, GND plane, puis signaux GPIO.' },
  { step: 7, title: 'DRC + Gerber', detail: 'Design Rule Check puis Fichier → Export → Gerber pour envoi à l’imprimeur.' },
];

export const GERBER_LAYERS = [
  { layer: 'Top Copper', ext: '.GTL', note: 'Pistes composants côté dessus' },
  { layer: 'Bottom Copper', ext: '.GBL', note: 'GND plane + pistes bottom' },
  { layer: 'Top Silk', ext: '.GTO', note: 'Sérigraphie références' },
  { layer: 'Bottom Silk', ext: '.GBO', note: 'Optionnel' },
  { layer: 'Top Mask', ext: '.GTS', note: 'Vernis soudure' },
  { layer: 'Bottom Mask', ext: '.GBS', note: 'Vernis soudure' },
  { layer: 'Drill', ext: '.TXT / .DRL', note: 'Perçages vias et trous' },
  { layer: 'Board Outline', ext: '.GKO', note: 'Contour carte' },
];

/** Fichiers téléchargeables (public/hardware après npm run hardware:package) */
export const HARDWARE_DOWNLOADS = {
  main: {
    gerberZip: '/hardware/gerber/PF-TN-CTRL-v1.zip',
    proteusProject: '/hardware/proteus/PetFeeder_CTRL.pdsprj',
    netlist: '/hardware/proteus/PetFeeder_CTRL.net',
    bom: '/hardware/proteus/PetFeeder_CTRL.BOM.csv',
    repoGerber: 'hardware/gerber/PF-TN-CTRL-v1/',
    repoProteus: 'hardware/proteus/',
  },
  power: {
    gerberZip: '/hardware/gerber/PF-TN-PSU-v1.zip',
    proteusProject: '/hardware/proteus/PetFeeder_PSU.pdsprj',
    netlist: '/hardware/proteus/PetFeeder_PSU.net',
    bom: '/hardware/proteus/PetFeeder_PSU.BOM.csv',
    repoGerber: 'hardware/gerber/PF-TN-PSU-v1/',
    repoProteus: 'hardware/proteus/',
  },
};

export const getPcbBoard = (id) => PCB_BOARDS.find((b) => b.id === id) || PCB_BOARDS[0];
