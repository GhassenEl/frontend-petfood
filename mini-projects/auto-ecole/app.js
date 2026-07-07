const STUDENTS = [
  { name: 'Amine Trabelsi', pack: 'Permis B — 30h', hours: '18/30', status: 'En cours' },
  { name: 'Salma Gharbi', pack: 'Permis B — 20h', hours: '20/20', status: 'Exam. code' },
  { name: 'Karim Bouazizi', pack: 'Conduite accompagnée', hours: '12/20', status: 'En cours' },
  { name: 'Ines Mejri', pack: 'Permis B — 30h', hours: '8/30', status: 'Débutant' },
  { name: 'Youssef Sassi', pack: 'Permis B — 20h', hours: '20/20', status: 'Exam. conduite' },
  { name: 'Nadia Ferchichi', pack: 'Permis B — 30h', hours: '25/30', status: 'En cours' },
];

const LESSONS_TODAY = [
  { time: '08:30', student: 'Amine T.', type: 'Circulation', moniteur: 'Hedi' },
  { time: '10:00', student: 'Ines M.', type: 'Créneau', moniteur: 'Leila' },
  { time: '14:30', student: 'Karim B.', type: 'Manœuvres', moniteur: 'Hedi' },
  { time: '16:00', student: 'Nadia F.', type: 'Autoroute', moniteur: 'Sami' },
];

const EXAMS = [
  { student: 'Salma G.', type: 'Code', date: '12 avr. 2026' },
  { student: 'Youssef S.', type: 'Conduite', date: '18 avr. 2026' },
];

const SCHEDULE = {
  Lun: ['08h Amine', '14h Karim', '17h Nadia'],
  Mar: ['09h Ines', '15h Salma'],
  Mer: ['08h Youssef', '11h Amine', '16h Karim'],
  Jeu: ['10h Nadia', '14h Ines'],
  Ven: ['08h Salma', '13h Amine', '17h Youssef'],
  Sam: ['09h Examens blancs'],
};

const PACKAGES = [
  { name: 'Permis B — 20h', price: '1 290 DT', features: ['20h conduite', 'Code en ligne', 'Accompagnement examen'] },
  { name: 'Permis B — 30h', price: '1 690 DT', features: ['30h conduite', 'Code + 2 examens blancs', 'Suivi personnalisé'], featured: true },
  { name: 'Conduite accompagnée', price: '1 450 DT', features: ['20h minimum', 'AAC 1 an', 'Briefing parents'] },
  { name: 'Stage intensif', price: '890 DT', features: ['2 semaines', '10h / semaine', 'Groupe réduit'] },
];

const TITLES = { dashboard: 'Tableau de bord', students: 'Élèves', lessons: 'Planning leçons', packages: 'Formules' };

const badge = (s) => {
  const cls = s.includes('Exam') ? 'badge--ok' : s === 'En cours' ? 'badge--warn' : 'badge--off';
  return `<span class="badge ${cls}">${s}</span>`;
};

const renderStudents = (q = '') => {
  const list = STUDENTS.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()));
  document.getElementById('students-table').innerHTML = list.map(
    (s) => `<tr><td>${s.name}</td><td>${s.pack}</td><td>${s.hours}</td><td>${badge(s.status)}</td></tr>`,
  ).join('');
};

document.getElementById('kpi-grid').innerHTML = `
  <div class="kpi"><span>Élèves actifs</span><strong>38</strong></div>
  <div class="kpi"><span>Leçons semaine</span><strong>64</strong></div>
  <div class="kpi"><span>Taux réussite</span><strong>78%</strong></div>
  <div class="kpi"><span>Moniteurs</span><strong>6</strong></div>`;

document.getElementById('today-lessons').innerHTML = LESSONS_TODAY.map(
  (l) => `<li><span><strong>${l.time}</strong> — ${l.student} (${l.type})</span><span>${l.moniteur}</span></li>`,
).join('');

document.getElementById('upcoming-exams').innerHTML = EXAMS.map(
  (e) => `<li><span>${e.student} — ${e.type}</span><span>${e.date}</span></li>`,
).join('');

document.getElementById('schedule-grid').innerHTML = Object.entries(SCHEDULE).map(
  ([day, slots]) => `<div class="day-col"><h3>${day}</h3>${slots.map((s) => `<div class="slot"><strong>${s}</strong></div>`).join('')}</div>`,
).join('');

document.getElementById('packages-grid').innerHTML = PACKAGES.map(
  (p) => `<article class="plan ${p.featured ? 'plan--featured' : ''}"><h3>${p.name}</h3><div class="price">${p.price}</div><ul>${p.features.map((f) => `<li>${f}</li>`).join('')}</ul></article>`,
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

document.getElementById('student-search').addEventListener('input', (e) => renderStudents(e.target.value));
renderStudents();

const saved = localStorage.getItem('autopilot-theme') || 'light';
document.body.dataset.theme = saved;
document.getElementById('theme-toggle').addEventListener('click', () => {
  const next = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  document.body.dataset.theme = next;
  localStorage.setItem('autopilot-theme', next);
});
