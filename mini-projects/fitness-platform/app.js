const PROGRAMS = [
  { id: 'muscle', category: 'muscu', emoji: '💪', name: 'Force & Hypertrophie', duration: '8 semaines', level: 'Intermédiaire' },
  { id: 'cardio', category: 'cardio', emoji: '🔥', name: 'Brûle-graisse HIIT', duration: '6 semaines', level: 'Tous niveaux' },
  { id: 'yoga', category: 'yoga', emoji: '🧘', name: 'Yoga & Mobilité', duration: '4 semaines', level: 'Débutant' },
  { id: 'run', category: 'cardio', emoji: '🏃', name: 'Prépa 10 km', duration: '10 semaines', level: 'Intermédiaire' },
  { id: 'home', category: 'maison', emoji: '🏠', name: 'Full Body Maison', duration: '5 semaines', level: 'Débutant' },
  { id: 'senior', category: 'senior', emoji: '🌿', name: 'Fitness Senior+', duration: '12 semaines', level: 'Adapté' },
];

const COACHES = [
  { name: 'Maya Ben Salah', spec: 'Yoga · Pilates', rating: 4.9, initial: 'M' },
  { name: 'Sofien Jebali', spec: 'HIIT · CrossFit', rating: 4.8, initial: 'S' },
  { name: 'Rami Khelil', spec: 'Musculation', rating: 4.7, initial: 'R' },
  { name: 'Amina Dridi', spec: 'Nutrition sportive', rating: 5.0, initial: 'A' },
];

const FILTERS = [
  { id: 'all', label: 'Tous' },
  { id: 'muscu', label: 'Musculation' },
  { id: 'cardio', label: 'Cardio' },
  { id: 'yoga', label: 'Yoga' },
  { id: 'maison', label: 'À la maison' },
  { id: 'senior', label: 'Senior' },
];

let activeFilter = 'all';

const showToast = (msg) => {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.hidden = false;
  setTimeout(() => { el.hidden = true; }, 2800);
};

const renderFilters = () => {
  document.getElementById('program-filters').innerHTML = FILTERS.map(
    (f) => `<button type="button" class="filter-btn ${f.id === activeFilter ? 'filter-btn--active' : ''}" data-filter="${f.id}">${f.label}</button>`,
  ).join('');

  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter;
      renderFilters();
      renderPrograms();
    });
  });
};

const renderPrograms = () => {
  const list = activeFilter === 'all'
    ? PROGRAMS
    : PROGRAMS.filter((p) => p.category === activeFilter);

  document.getElementById('programs-grid').innerHTML = list.map(
    (p) => `
      <article class="program-card">
        <div class="program-card__emoji">${p.emoji}</div>
        <h3>${p.name}</h3>
        <p>${p.duration} · ${p.level}</p>
        <div class="program-card__meta"><span>★ 4.8</span><span>Gratuit essai</span></div>
      </article>`,
  ).join('');
};

const renderCoaches = () => {
  document.getElementById('coaches-grid').innerHTML = COACHES.map(
    (c) => `
      <article class="coach-card">
        <div class="coach-card__avatar">${c.initial}</div>
        <h3>${c.name}</h3>
        <p class="spec">${c.spec}</p>
        <p class="rating">★ ${c.rating}</p>
      </article>`,
  ).join('');
};

const fillBookingPrograms = () => {
  const select = document.getElementById('booking-program');
  select.innerHTML = '<option value="">Choisir…</option>' + PROGRAMS.map(
    (p) => `<option value="${p.id}">${p.name}</option>`,
  ).join('');
};

const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

document.getElementById('booking-date').min = new Date().toISOString().slice(0, 10);
document.getElementById('booking-date').value = tomorrow();

document.getElementById('booking-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const program = document.getElementById('booking-program');
  const date = document.getElementById('booking-date').value;
  const slot = document.getElementById('booking-slot').value;
  const email = document.getElementById('booking-email').value;

  const result = document.getElementById('booking-result');
  result.hidden = false;
  result.textContent = `✓ Réservation confirmée pour ${program.options[program.selectedIndex].text} — ${date} à ${slot.split(' — ')[0]}. Email envoyé à ${email}.`;
  showToast('Réservation enregistrée (démo)');
});

['cta-header', 'cta-hero', 'cta-demo'].forEach((id) => {
  document.getElementById(id).addEventListener('click', () => {
    document.getElementById('reserver').scrollIntoView({ behavior: 'smooth' });
    showToast('Formulaire de réservation');
  });
});

renderFilters();
renderPrograms();
renderCoaches();
fillBookingPrograms();
