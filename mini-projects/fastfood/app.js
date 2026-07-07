const STORAGE_KEY = 'quickbite-data';
const STATUSES = ['En attente', 'En préparation', 'Prête', 'Livrée'];

const DEFAULT = {
  menu: [
    { id: 'm1', name: 'Menu Burger Classic', cat: 'Burger', price: 18, emoji: '🍔' },
    { id: 'm2', name: 'Double Cheese', cat: 'Burger', price: 22, emoji: '🧀' },
    { id: 'm3', name: 'Wrap Poulet', cat: 'Wrap', price: 14, emoji: '🌯' },
    { id: 'm4', name: 'Frites XL', cat: 'Accomp.', price: 7, emoji: '🍟' },
    { id: 'm5', name: 'Menu Enfant', cat: 'Kids', price: 12, emoji: '🎈' },
    { id: 'm6', name: 'Milkshake Vanille', cat: 'Boisson', price: 9, emoji: '🥤' },
  ],
  orders: [
    { id: 'QB-1042', client: 'Amine B.', items: 'Burger + Frites', total: 25, status: 'En préparation' },
    { id: 'QB-1041', client: 'Salma K.', items: 'Wrap x2', total: 28, status: 'Prête' },
    { id: 'QB-1040', client: 'Karim M.', items: 'Menu Enfant', total: 12, status: 'Livrée' },
    { id: 'QB-1039', client: 'Ines T.', items: 'Double Cheese', total: 22, status: 'En attente' },
  ],
  promos: [
    { id: 'p1', title: 'Midi -15 %', desc: 'Tous les menus 11h–14h', code: 'MIDI15' },
    { id: 'p2', title: '2 achetés = 1 offert', desc: 'Frites uniquement', code: 'FRITE2+1' },
    { id: 'p3', title: 'Livraison gratuite', desc: 'Commande > 40 DT', code: 'LIVRAISON0' },
  ],
  orderSeq: 1043,
};

const TITLES = { dashboard: 'Tableau de bord', menu: 'Menu', orders: 'Commandes', promos: 'Promotions' };

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : structuredClone(DEFAULT);
  } catch {
    return structuredClone(DEFAULT);
  }
};

let state = load();

const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const statusBadge = (s) => {
  const cls = s === 'Prête' || s === 'Livrée' ? 'badge--ok' : s === 'En attente' ? 'badge--warn' : 'badge--off';
  return `<span class="badge ${cls}">${s}</span>`;
};

const nextStatus = (s) => STATUSES[(STATUSES.indexOf(s) + 1) % STATUSES.length];

const renderKpis = () => {
  const today = state.orders.filter((o) => o.status !== 'Livrée');
  const revenue = state.orders.reduce((sum, o) => sum + Number(o.total), 0);
  document.getElementById('kpi-grid').innerHTML = `
    <div class="kpi"><span>Commandes actives</span><strong>${today.length}</strong></div>
    <div class="kpi"><span>CA total</span><strong>${revenue} DT</strong></div>
    <div class="kpi"><span>Articles menu</span><strong>${state.menu.length}</strong></div>
    <div class="kpi"><span>Promos actives</span><strong>${state.promos.length}</strong></div>`;
};

const renderDashboard = () => {
  const active = state.orders.filter((o) => o.status !== 'Livrée').slice(0, 4);
  document.getElementById('active-orders').innerHTML = active.length
    ? active.map((o) => `<li><span><strong>${o.id}</strong> — ${o.client}</span><span>${o.total} DT</span></li>`).join('')
    : '<li><span>Aucune commande en cours</span></li>';

  const top = [...state.menu].sort((a, b) => b.price - a.price).slice(0, 4);
  document.getElementById('top-sales').innerHTML = top.map(
    (m) => `<li><span>${m.emoji || '🍽️'} ${m.name}</span><span>${m.price} DT</span></li>`,
  ).join('');
};

const renderMenu = () => {
  document.getElementById('menu-grid').innerHTML = state.menu.map(
    (m) => `<article class="menu-card">
      <button type="button" class="btn btn--ghost card-actions" data-del-menu="${m.id}">✕</button>
      <div style="font-size:28px">${m.emoji || '🍽️'}</div>
      <h3>${m.name}</h3><p>${m.cat}</p><div class="price">${m.price} DT</div>
    </article>`,
  ).join('');
};

const renderOrders = () => {
  document.getElementById('orders-table').innerHTML = state.orders.map(
    (o) => `<tr>
      <td>${o.id}</td><td>${o.client}</td><td>${o.items}</td><td>${o.total} DT</td>
      <td><button type="button" class="status-btn" data-status="${o.id}">${statusBadge(o.status)}</button></td>
      <td><button type="button" class="btn btn--ghost" data-del-order="${o.id}">Suppr.</button></td>
    </tr>`,
  ).join('');
};

const renderPromos = () => {
  document.getElementById('promos-grid').innerHTML = state.promos.map(
    (p) => `<article class="promo-card">
      <button type="button" class="btn btn--ghost card-actions" data-del-promo="${p.id}">✕</button>
      <h3>${p.title}</h3><p>${p.desc}</p><p><strong>Code : ${p.code}</strong></p>
    </article>`,
  ).join('');
};

const renderAll = () => {
  renderKpis();
  renderDashboard();
  renderMenu();
  renderOrders();
  renderPromos();
};

document.querySelectorAll('.nav__btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('view--active'));
    document.querySelectorAll('.nav__btn').forEach((b) => b.classList.remove('nav__btn--active'));
    document.getElementById(`view-${btn.dataset.view}`).classList.add('view--active');
    btn.classList.add('nav__btn--active');
    document.getElementById('page-title').textContent = TITLES[btn.dataset.view];
  });
});

document.getElementById('add-menu-btn').addEventListener('click', () => {
  document.getElementById('menu-form').hidden = false;
});

document.getElementById('menu-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  state.menu.push({
    id: uid(),
    name: fd.get('name'),
    cat: fd.get('cat'),
    price: Number(fd.get('price')),
    emoji: fd.get('emoji') || '🍽️',
  });
  save();
  e.target.reset();
  e.target.hidden = true;
  renderAll();
});

document.getElementById('add-order-btn').addEventListener('click', () => {
  document.getElementById('order-form').hidden = false;
});

document.getElementById('order-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  state.orders.unshift({
    id: `QB-${state.orderSeq++}`,
    client: fd.get('client'),
    items: fd.get('items'),
    total: Number(fd.get('total')),
    status: 'En attente',
  });
  save();
  e.target.reset();
  e.target.hidden = true;
  renderAll();
});

document.getElementById('add-promo-btn').addEventListener('click', () => {
  document.getElementById('promo-form').hidden = false;
});

document.getElementById('promo-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  state.promos.push({
    id: uid(),
    title: fd.get('title'),
    desc: fd.get('desc'),
    code: fd.get('code'),
  });
  save();
  e.target.reset();
  e.target.hidden = true;
  renderAll();
});

document.body.addEventListener('click', (e) => {
  const delMenu = e.target.closest('[data-del-menu]');
  if (delMenu) {
    state.menu = state.menu.filter((m) => m.id !== delMenu.dataset.delMenu);
    save();
    renderAll();
    return;
  }
  const delOrder = e.target.closest('[data-del-order]');
  if (delOrder) {
    state.orders = state.orders.filter((o) => o.id !== delOrder.dataset.delOrder);
    save();
    renderAll();
    return;
  }
  const delPromo = e.target.closest('[data-del-promo]');
  if (delPromo) {
    state.promos = state.promos.filter((p) => p.id !== delPromo.dataset.delPromo);
    save();
    renderAll();
    return;
  }
  const statusBtn = e.target.closest('[data-status]');
  if (statusBtn) {
    const order = state.orders.find((o) => o.id === statusBtn.dataset.status);
    if (order) {
      order.status = nextStatus(order.status);
      save();
      renderAll();
    }
  }
});

const saved = localStorage.getItem('quickbite-theme') || 'dark';
document.body.dataset.theme = saved;
document.getElementById('theme-toggle').addEventListener('click', () => {
  const next = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  document.body.dataset.theme = next;
  localStorage.setItem('quickbite-theme', next);
});

renderAll();
