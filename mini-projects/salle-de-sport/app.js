const MEMBERS = [
  { name: 'Amine Trabelsi', plan: 'Premium', end: '2026-09-12', status: 'active' },
  { name: 'Salma Gharbi', plan: 'Mensuel', end: '2026-04-02', status: 'active' },
  { name: 'Karim Bouazizi', plan: 'Annuel', end: '2027-01-15', status: 'active' },
  { name: 'Ines Mejri', plan: 'Mensuel', end: '2026-03-28', status: 'expiring' },
  { name: 'Youssef Sassi', plan: 'Découverte', end: '2026-03-10', status: 'expired' },
  { name: 'Nadia Ferchichi', plan: 'Premium', end: '2026-11-20', status: 'active' },
  { name: 'Hedi Riahi', plan: 'Mensuel', end: '2026-05-01', status: 'active' },
  { name: 'Leila Mansouri', plan: 'Annuel', end: '2026-12-30', status: 'active' },
];

const CLASSES_TODAY = [
  { time: '07:00', name: 'HIIT Matinal', coach: 'Sofien', spots: '12/15' },
  { time: '10:30', name: 'Yoga Flow', coach: 'Maya', spots: '8/10' },
  { time: '17:00', name: 'Musculation guidée', coach: 'Rami', spots: '14/16' },
  { time: '19:30', name: 'Spinning', coach: 'Sofien', spots: '18/20' },
];

const SCHEDULE = {
  Lun: [
    { time: '07:00', name: 'HIIT' },
    { time: '18:00', name: 'CrossFit' },
  ],
  Mar: [
    { time: '10:00', name: 'Yoga' },
    { time: '19:00', name: 'Boxe' },
  ],
  Mer: [
    { time: '07:30', name: 'Cardio' },
    { time: '17:30', name: 'Pilates' },
  ],
  Jeu: [
    { time: '12:00', name: 'Stretching' },
    { time: '19:30', name: 'Spinning' },
  ],
  Ven: [
    { time: '08:00', name: 'Full Body' },
    { time: '18:30', name: 'Zumba' },
  ],
  Sam: [
    { time: '09:00', name: 'Bootcamp' },
    { time: '11:00', name: 'Kids Fitness' },
  ],
  Dim: [{ time: '10:00', name: 'Yoga détente' }],
};

const PLANS = [
  { name: 'Découverte', price: '49 DT/mois', features: ['Accès salle', '1 cours collectif/semaine', 'Vestiaires'], featured: false },
  { name: 'Mensuel', price: '89 DT/mois', features: ['Accès illimité', 'Cours collectifs', 'App suivi'], featured: true },
  { name: 'Premium', price: '149 DT/mois', features: ['Tout Mensuel', '2 séances coaching', 'Nutrition'], featured: false },
  { name: 'Annuel', price: '899 DT/an', features: ['−15 % vs mensuel', 'Bilan corporel', 'Invité 1×/mois'], featured: false },
];

const TITLES = {
  dashboard: 'Tableau de bord',
  members: 'Adhérents',
  classes: 'Planning cours',
  subscriptions: 'Abonnements',
};

const statusBadge = (status) => {
  if (status === 'active') return '<span class="badge badge--ok">Actif</span>';
  if (status === 'expiring') return '<span class="badge badge--warn">Expire bientôt</span>';
  return '<span class="badge badge--off">Expiré</span>';
};

const renderKpis = () => {
  const active = MEMBERS.filter((m) => m.status === 'active').length;
  document.getElementById('kpi-grid').innerHTML = `
    <div class="kpi"><span>Adhérents actifs</span><strong>${active}</strong></div>
    <div class="kpi"><span>Cours aujourd'hui</span><strong>${CLASSES_TODAY.length}</strong></div>
    <div class="kpi"><span>Taux remplissage</span><strong>87%</strong></div>
    <div class="kpi"><span>CA mensuel estimé</span><strong>12.4k DT</strong></div>
  `;
};

const renderToday = () => {
  document.getElementById('today-classes').innerHTML = CLASSES_TODAY.map(
    (c) => `<li><span><strong>${c.time}</strong> — ${c.name} (${c.coach})</span><span>${c.spots}</span></li>`,
  ).join('');

  document.getElementById('recent-members').innerHTML = MEMBERS.slice(0, 4).map(
    (m) => `<li><span>${m.name}</span><span>${m.plan}</span></li>`,
  ).join('');
};

const renderMembers = (filter = '') => {
  const q = filter.toLowerCase();
  const rows = MEMBERS.filter((m) => m.name.toLowerCase().includes(q));
  document.getElementById('members-table').innerHTML = rows.map(
    (m) => `<tr><td>${m.name}</td><td>${m.plan}</td><td>${m.end}</td><td>${statusBadge(m.status)}</td></tr>`,
  ).join('');
};

const renderSchedule = () => {
  document.getElementById('schedule-grid').innerHTML = Object.entries(SCHEDULE).map(
    ([day, slots]) => `
      <div class="day-col">
        <h3>${day}</h3>
        ${slots.map((s) => `<div class="slot"><strong>${s.time}</strong>${s.name}</div>`).join('')}
      </div>`,
  ).join('');
};

const renderPlans = () => {
  document.getElementById('plans-grid').innerHTML = PLANS.map(
    (p) => `
      <article class="plan ${p.featured ? 'plan--featured' : ''}">
        <h3>${p.name}</h3>
        <div class="price">${p.price}</div>
        <ul>${p.features.map((f) => `<li>${f}</li>`).join('')}</ul>
      </article>`,
  ).join('');
};

const switchView = (view) => {
  document.querySelectorAll('.view').forEach((el) => el.classList.remove('view--active'));
  document.getElementById(`view-${view}`).classList.add('view--active');
  document.querySelectorAll('.nav__btn').forEach((btn) => {
    btn.classList.toggle('nav__btn--active', btn.dataset.view === view);
  });
  document.getElementById('page-title').textContent = TITLES[view] || 'FitClub';
};

document.querySelectorAll('.nav__btn').forEach((btn) => {
  btn.addEventListener('click', () => switchView(btn.dataset.view));
});

document.getElementById('member-search').addEventListener('input', (e) => {
  renderMembers(e.target.value);
});

document.getElementById('today-label').textContent = new Date().toLocaleDateString('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

renderKpis();
renderToday();
renderMembers();
renderSchedule();
renderPlans();
