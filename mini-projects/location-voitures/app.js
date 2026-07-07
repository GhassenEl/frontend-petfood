const STORAGE_KEY = 'driverent-data';
const STATUSES = ['En attente', 'Confirmée', 'En cours', 'Terminée', 'Annulée'];

const DEFAULT = {
  cars: [
    { id: 'c1', model: 'Peugeot 208', category: 'Citadine', price: 85, status: 'Disponible' },
    { id: 'c2', model: 'Renault Clio V', category: 'Citadine', price: 80, status: 'Louée' },
    { id: 'c3', model: 'Hyundai Tucson', category: 'SUV', price: 140, status: 'Disponible' },
    { id: 'c4', model: 'Mercedes Classe C', category: 'Premium', price: 220, status: 'Maintenance' },
    { id: 'c5', model: 'Dacia Logan', category: 'Économique', price: 65, status: 'Disponible' },
  ],
  clients: [
    { id: 'cl1', name: 'Amine Trabelsi', phone: '98 111 222', license: 'TN-884521' },
    { id: 'cl2', name: 'Salma Gharbi', phone: '97 222 333', license: 'TN-772190' },
    { id: 'cl3', name: 'Karim Bouazizi', phone: '96 333 444', license: 'TN-901234' },
  ],
  rentals: [
    { id: 'DR-1042', client: 'Amine T.', car: 'Renault Clio V', start: '2026-07-05', end: '2026-07-10', total: 400, status: 'En cours' },
    { id: 'DR-1041', client: 'Salma G.', car: 'Hyundai Tucson', start: '2026-07-08', end: '2026-07-12', total: 560, status: 'Confirmée' },
    { id: 'DR-1040', client: 'Karim B.', car: 'Peugeot 208', start: '2026-06-28', end: '2026-07-02', total: 340, status: 'Terminée' },
  ],
  rentalSeq: 1043,
};

const TITLES = { dashboard: 'Tableau de bord', fleet: 'Flotte', clients: 'Clients', rentals: 'Locations' };

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
const nextStatus = (s) => STATUSES[(STATUSES.indexOf(s) + 1) % STATUSES.length];

const badge = (s) => {
  const cls = s === 'Disponible' || s === 'Terminée' ? 'badge--ok' : s === 'Louée' || s === 'En cours' ? 'badge--warn' : 'badge--off';
  return `<span class="badge ${cls}">${s}</span>`;
};

const renderKpis = () => {
  const available = state.cars.filter((c) => c.status === 'Disponible').length;
  const active = state.rentals.filter((r) => r.status === 'En cours').length;
  const revenue = state.rentals.filter((r) => r.status !== 'Annulée').reduce((s, r) => s + r.total, 0);
  document.getElementById('kpi-grid').innerHTML = `
    <div class="kpi"><span>Voitures dispo</span><strong>${available}</strong></div>
    <div class="kpi"><span>Locations actives</span><strong>${active}</strong></div>
    <div class="kpi"><span>CA total</span><strong>${revenue} DT</strong></div>
    <div class="kpi"><span>Clients</span><strong>${state.clients.length}</strong></div>`;
};

const renderDashboard = () => {
  const active = state.rentals.filter((r) => r.status === 'En cours');
  document.getElementById('active-rentals').innerHTML = active.length
    ? active.map((r) => `<li><span><strong>${r.id}</strong> — ${r.client} (${r.car})</span><span>${r.total} DT</span></li>`).join('')
    : '<li><span>Aucune location en cours</span></li>';

  const upcoming = state.rentals.filter((r) => r.status === 'Confirmée' || r.status === 'En attente').slice(0, 4);
  document.getElementById('upcoming-rentals').innerHTML = upcoming.length
    ? upcoming.map((r) => `<li><span>${r.client} — ${r.car}</span><span>${r.start}</span></li>`).join('')
    : '<li><span>Aucune réservation à venir</span></li>';
};

const renderFleet = () => {
  document.getElementById('fleet-grid').innerHTML = state.cars.map(
    (c) => `<article class="car-card">
      <button type="button" class="btn btn--ghost card-actions" data-del-car="${c.id}">✕</button>
      <div style="font-size:28px">🚗</div>
      <h3>${c.model}</h3><p>${c.category}</p>
      <div class="price">${c.price} DT/j</div>
      <p style="margin-top:8px">${badge(c.status)}</p>
    </article>`,
  ).join('');
};

const renderClients = (q = '') => {
  const list = state.clients.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));
  document.getElementById('clients-table').innerHTML = list.map(
    (c) => `<tr><td>${c.name}</td><td>${c.phone}</td><td>${c.license || '—'}</td>
      <td><button type="button" class="btn btn--ghost" data-del-client="${c.id}">Suppr.</button></td></tr>`,
  ).join('');
};

const renderRentals = () => {
  document.getElementById('rentals-table').innerHTML = state.rentals.map(
    (r) => `<tr>
      <td>${r.id}</td><td>${r.client}</td><td>${r.car}</td><td>${r.start}</td><td>${r.end}</td><td>${r.total} DT</td>
      <td><button type="button" class="status-btn" data-status="${r.id}">${badge(r.status)}</button></td>
      <td><button type="button" class="btn btn--ghost" data-del-rental="${r.id}">Suppr.</button></td>
    </tr>`,
  ).join('');
};

const renderAll = () => {
  renderKpis();
  renderDashboard();
  renderFleet();
  renderClients(document.getElementById('client-search').value);
  renderRentals();
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

['add-car-btn', 'add-client-btn', 'add-rental-btn'].forEach((id, i) => {
  document.getElementById(id).addEventListener('click', () => {
    document.getElementById(['car-form', 'client-form', 'rental-form'][i]).hidden = false;
  });
});

document.getElementById('car-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  state.cars.push({ id: uid(), model: fd.get('model'), category: fd.get('category'), price: Number(fd.get('price')), status: fd.get('status') });
  save(); e.target.reset(); e.target.hidden = true; renderAll();
});

document.getElementById('client-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  state.clients.push({ id: uid(), name: fd.get('name'), phone: fd.get('phone'), license: fd.get('license') });
  save(); e.target.reset(); e.target.hidden = true; renderAll();
});

document.getElementById('rental-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  state.rentals.unshift({
    id: `DR-${state.rentalSeq++}`,
    client: fd.get('client'),
    car: fd.get('car'),
    start: fd.get('start'),
    end: fd.get('end'),
    total: Number(fd.get('total')),
    status: 'En attente',
  });
  save(); e.target.reset(); e.target.hidden = true; renderAll();
});

document.getElementById('client-search').addEventListener('input', (e) => renderClients(e.target.value));

document.body.addEventListener('click', (e) => {
  const statusBtn = e.target.closest('[data-status]');
  if (statusBtn) {
    const rental = state.rentals.find((r) => r.id === statusBtn.dataset.status);
    if (rental) { rental.status = nextStatus(rental.status); save(); renderAll(); }
    return;
  }
  const map = [
    ['data-del-car', 'cars'],
    ['data-del-client', 'clients'],
    ['data-del-rental', 'rentals'],
  ];
  for (const [attr, key] of map) {
    const btn = e.target.closest(`[${attr}]`);
    if (btn) {
      state[key] = state[key].filter((item) => item.id !== btn.getAttribute(attr));
      save(); renderAll();
      return;
    }
  }
});

const saved = localStorage.getItem('driverent-theme') || 'dark';
document.body.dataset.theme = saved;
document.getElementById('theme-toggle').addEventListener('click', () => {
  const next = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  document.body.dataset.theme = next;
  localStorage.setItem('driverent-theme', next);
});

renderAll();
