import { jsPDF } from 'jspdf';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, '..', 'PetfoodTN-Comptes-Acces.pdf');

const accounts = [
  {
    role: 'Administrateur',
    email: 'admin@petfood.tn',
    password: 'PetfoodTN2024!',
    name: 'Ghassen Admin',
    home: '/admin/dashboard',
  },
  {
    role: 'Client',
    email: 'client@petfood.tn',
    password: 'MonChat123!',
    name: 'Sami Ben Ali',
    home: '/client-products',
  },
  {
    role: 'Vétérinaire',
    email: 'vet@petfood.tn',
    password: 'Vet2024!',
    name: 'Dr. Amira Khelifi',
    home: '/vet/dashboard',
  },
  {
    role: 'Livreur',
    email: 'livreur@petfood.tn',
    password: 'Livreur123!',
    name: 'Karim Mansouri',
    home: '/livreur/dashboard',
  },
  {
    role: 'Vendeur',
    email: 'vendor@petfood.tn',
    password: 'Vendor2024!',
    name: 'Leila Mansouri',
    home: '/vendor/dashboard',
  },
  {
    role: 'Modérateur',
    email: 'moderator@petfood.tn',
    password: 'Moderator2024!',
    name: 'Nour Modération',
    home: '/moderator/dashboard',
  },
  {
    role: 'Service client',
    email: 'support@petfood.tn',
    password: 'Support2024!',
    name: 'Sonia Service Client',
    home: '/support/dashboard',
    note: 'Créer via /admin/users (non seedé par défaut)',
  },
];

const optionalAccounts = [
  { role: 'Client', email: 'amina@petfood.tn', password: 'Amina2024!', name: 'Amina Ben Ali' },
  { role: 'Client', email: 'youssef@petfood.tn', password: 'Youssef2024!', name: 'Youssef Trabelsi' },
  { role: 'Livreur', email: 'sami.livreur@petfood.tn', password: 'SamiLivreur2024!', name: 'Sami Livreur' },
];

const doc = new jsPDF({ unit: 'mm', format: 'a4' });
const margin = 18;
let y = margin;
const pageW = 210;
const lineH = 7;

const addLine = (text, opts = {}) => {
  const { size = 11, bold = false, color = [30, 30, 30] } = opts;
  if (y > 280) {
    doc.addPage();
    y = margin;
  }
  doc.setFont('helvetica', bold ? 'bold' : 'normal');
  doc.setFontSize(size);
  doc.setTextColor(...color);
  const lines = doc.splitTextToSize(text, pageW - margin * 2);
  doc.text(lines, margin, y);
  y += lines.length * (size * 0.45) + 2;
};

doc.setFillColor(230, 126, 34);
doc.rect(0, 0, pageW, 28, 'F');
doc.setTextColor(255, 255, 255);
doc.setFont('helvetica', 'bold');
doc.setFontSize(18);
doc.text('PetfoodTN — Comptes d\'accès', margin, 14);
doc.setFontSize(10);
doc.text('Environnement de démonstration / développement', margin, 21);
y = 38;

addLine(`Généré le : ${new Date().toLocaleString('fr-FR')}`, { size: 9, color: [100, 100, 100] });
addLine('URL application : http://localhost:3001/login', { size: 9, color: [100, 100, 100] });
addLine('Référence : docs/COMPTES-ACCES.md · src/config/demoAccounts.js', { size: 9, color: [100, 100, 100] });
y += 4;

addLine('Comptes principaux', { size: 14, bold: true, color: [230, 126, 34] });
y += 2;

accounts.forEach((acc, i) => {
  addLine(`${i + 1}. ${acc.role}`, { size: 12, bold: true });
  addLine(`   Nom      : ${acc.name}`);
  addLine(`   Email    : ${acc.email}`);
  addLine(`   Mot de passe : ${acc.password}`);
  addLine(`   Accueil  : ${acc.home}`);
  if (acc.extra) addLine(`   ${acc.extra}`);
  if (acc.note) addLine(`   Note : ${acc.note}`);
  y += 3;
});

y += 2;
addLine('Comptes secondaires (optionnels)', { size: 14, bold: true, color: [230, 126, 34] });
y += 2;

optionalAccounts.forEach((acc, i) => {
  addLine(`${i + 1}. ${acc.role} — ${acc.name}`);
  addLine(`   Email : ${acc.email}  |  Mot de passe : ${acc.password}`);
  y += 2;
});

y += 4;
addLine('Note : le rôle « client » correspond au propriétaire d\'animal. Ne pas partager ce document en production.', {
  size: 9,
  color: [120, 120, 120],
});

const pdfBuffer = doc.output('arraybuffer');
writeFileSync(outPath, Buffer.from(pdfBuffer));
console.log(`PDF créé : ${outPath}`);
