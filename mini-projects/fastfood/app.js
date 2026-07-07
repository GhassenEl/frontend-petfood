const MENU = [
  { name: 'Menu Burger Classic', cat: 'Burger', price: 18, emoji: '🍔' },
  { name: 'Double Cheese', cat: 'Burger', price: 22, emoji: '🧀' },
  { name: 'Wrap Poulet', cat: 'Wrap', price: 14, emoji: '🌯' },
  { name: 'Frites XL', cat: 'Accomp.', price: 7, emoji: '🍟' },
  { name: 'Menu Enfant', cat: 'Kids', price: 12, emoji: '🎈' },
  { name: 'Milkshake Vanille', cat: 'Boisson', price: 9, emoji: '🥤' },
];

const ORDERS = [
  { id: 'QB-1042', client: 'Amine B.', items: 'Burger + Frites', total: 25, status: 'En préparation' },
  { id: 'QB-1041', client: 'Salma K.', items: 'Wrap x2', total: 28, status: 'Prête' },
  { id: 'QB-1040', client: 'Karim M.', items: 'Menu Enfant', total: 12, status: 'Livrée' },
  { id: 'QB-1039', client: 'Ines T.', items: 'Double Cheese', total: 22, status: 'En attente' },
  { id: 'QB-1038', client: 'Youssef G.', items: 'Burger + Shake', total: 27, status: 'Livrée' },
];

const PROMOS = [
  { title: 'Midi -15 %', desc: 'Tous les menus 11h–14h', code: 'MIDI15' },
  { title: '2 achetés = 1 offert', desc: 'Frites uniquement', code: 'FRITE2+1' },
  { title: 'Livraison gratuite', desc: 'Commande > 40 DT', code: 'LIVRAISON0' },
];

const TITLES = { dashboard: 'Tableau de bord', menu: 'Menu', orders: 'Commandes', promos: 'Promotions' };

const statusBadge = (s) => {
  const cls = s === 'Prête' ? 'badge--ok' : s === 'En attente' ? 'badge--warn' : 'badge--off';
  return `<span class="badge ${cls}">${s}</span>`;
};

document.getElementById('kpi-grid').innerHTML = `
  <div class="kpi"><span>Commandes jour</span><strong>47</strong></div>
  <div class="kpi"><span>CA du jour</span><strong>892 DT</strong></div>
  <div class="kpi"><span>Temps moyen</span><strong>12 min</strong></div>
  <div class="kpi"><span>Satisfaction</span><strong>4.6★</strong></div>`;

document.getElementById('active-orders').innerHTML = ORDERS.slice(0, 4).map(
  (o) => `<li><span><strong>${o.id}</strong> — ${o.client}</span><span>${o.total} DT</span></li>`,
).join('');

document.getElementById('top-sales').innerHTML = MENU.slice(0, 4).map(
  (m) => `<li><span>${m.emoji} ${m.name}</span><span>${m.price} DT</span></li>`,
).join('');

document.getElementById('menu-grid').innerHTML = MENU.map(
  (m) => `<article class="menu-card"><div style="font-size:28px">${m.emoji}</div><h3>${m.name}</h3><p>${m.cat}</p><div class="price">${m.price} DT</div></article>`,
).join('');

document.getElementById('orders-table').innerHTML = ORDERS.map(
  (o) => `<tr><td>${o.id}</td><td>${o.client}</td><td>${o.items}</td><td>${o.total} DT</td><td>${statusBadge(o.status)}</td></tr>`,
).join('');

document.getElementById('promos-grid').innerHTML = PROMOS.map(
  (p) => `<article class="promo-card"><h3>${p.title}</h3><p>${p.desc}</p><p><strong>Code : ${p.code}</strong></p></article>`,
).join('');

document.querySelectorAll('.nav__btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('view--active'));
    document.querySelectorAll('.nav__btn').forEach((b) => b.classList.remove('nav__btn--active'));
    document.getElementById(`view-${btn.dataset.view}`).classList.add('view--active');
    btn.classList.add('nav__btn--active');
    document.getElementById('page-title').textContent = TITLES[btn.dataset.view];
  });
});

const saved = localStorage.getItem('quickbite-theme') || 'dark';
document.body.dataset.theme = saved;
document.getElementById('theme-toggle').addEventListener('click', () => {
  const next = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  document.body.dataset.theme = next;
  localStorage.setItem('quickbite-theme', next);
});
