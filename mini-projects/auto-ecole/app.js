const STORAGE_KEY = 'autopilot-data';

const DEFAULT = {
  students: [
    { id: 's1', name: 'Amine Trabelsi', pack: 'Permis B — 30h', hoursDone: 18, hoursTotal: 30, status: 'En cours' },
    { id: 's2', name: 'Salma Gharbi', pack: 'Permis B — 20h', hoursDone: 20, hoursTotal: 20, status: 'Exam. code' },
    { id: 's3', name: 'Karim Bouazizi', pack: 'Conduite accompagnée', hoursDone: 12, hoursTotal: 20, status: 'En cours' },
    { id: 's4', name: 'Ines Mejri', pack: 'Permis B — 30h', hoursDone: 8, hoursTotal: 30, status: 'Débutant' },
    { id: 's5', name: 'Youssef Sassi', pack: 'Permis B — 20h', hoursDone: 20, hoursTotal: 20, status: 'Exam. conduite' },
  ],
  lessonsToday: [
    { id: 'l1', time: '08:30', student: 'Amine T.', type: 'Circulation', moniteur: 'Hedi' },
    { id: 'l2', time: '10:00', student: 'Ines M.', type: 'Créneau', moniteur: 'Leila' },
    { id: 'l3', time: '14:30', student: 'Karim B.', type: 'Manœuvres', moniteur: 'Hedi' },
  ],
  exams: [
    { id: 'e1', student: 'Salma G.', type: 'Code', date: '12 avr. 2026' },
    { id: 'e2', student: 'Youssef S.', type: 'Conduite', date: '18 avr. 2026' },
  ],
  schedule: {
    Lun: ['08h Amine', '14h Karim'],
    Mar: ['09h Ines', '15h Salma'],
    Mer: ['08h Youssef', '11h Amine'],
    Jeu: ['10h Nadia', '14h Ines'],
    Ven: ['08h Salma', '17h Youssef'],
    Sam: ['09h Examens blancs'],
  },
};

const PACKAGES = [
  { name: 'Permis B — 20h', price: '1 290 DT', features: ['20h conduite', 'Code en ligne', 'Accompagnement examen'] },
  { name: 'Permis B — 30h', price: '1 690 DT', features: ['30h conduite', 'Code + 2 examens blancs', 'Suivi personnalisé'], featured: true },
  { name: 'Conduite accompagnée', price: '1 450 DT', features: ['20h minimum', 'AAC 1 an', 'Briefing parents'] },
  { name: 'Stage intensif', price: '890 DT', features: ['2 semaines', '10h / semaine', 'Groupe réduit'] },
];

const TITLES = { dashboard: 'Tableau de bord', students: 'Élèves', lessons: 'Planning leçons', packages: 'Formules' };
const STATUSES = ['Débutant', 'En cours', 'Exam. code', 'Exam. conduite'];

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

const hoursLabel = (s) => `${s.hoursDone}/${s.hoursTotal}`;

const badge = (s) => {
  const cls = s.includes('Exam') ? 'badge--ok' : s === 'En cours' ? 'badge--warn' : 'badge--off';
  return `<span class="badge ${cls}">${s}</span>`;
};

const renderKpis = () => {
  const active = state.students.filter((s) => s.status === 'En cours' || s.status === 'Débutant').length;
  document.getElementById('kpi-grid').innerHTML = `
    <div class="kpi"><span>Élèves actifs</span><strong>${active}</strong></div>
    <div class="kpi"><span>Leçons aujourd'hui</span><strong>${state.lessonsToday.length}</strong></div>
    <div class="kpi"><span>Examens planifiés</span><strong>${state.exams.length}</strong></div>
    <div class="kpi"><span>Total élèves</span><strong>${state.students.length}</strong></div>`;
};

const renderDashboard = () => {
  document.getElementById('today-lessons').innerHTML = state.lessonsToday.length
    ? state.lessonsToday.map((l) => `<li><span><strong>${l.time}</strong> — ${l.student} (${l.type})</span><span>${l.moniteur}</span></li>`).join('')
    : '<li><span>Aucune leçon aujourd\'hui</span></li>';

  document.getElementById('upcoming-exams').innerHTML = state.exams.length
    ? state.exams.map((e) => `<li><span>${e.student} — ${e.type}</span><span>${e.date}</span></li>`).join('')
    : '<li><span>Aucun examen planifié</span></li>';
};

const renderStudents = (q = '') => {
  const list = state.students.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()));
  document.getElementById('students-table').innerHTML = list.map(
    (s) => `<tr>
      <td>${s.name}</td><td>${s.pack}</td>
      <td><button type="button" class="hours-btn" data-hours="${s.id}">${hoursLabel(s)}</button></td>
      <td><select class="status-select" data-status="${s.id}">${STATUSES.map((st) => `<option value="${st}" ${st === s.status ? 'selected' : ''}>${st}</option>`).join('')}</select></td>
      <td><button type="button" class="btn btn--ghost" data-del-student="${s.id}">Suppr.</button></td>
    </tr>`,
  ).join('');
};

const renderSchedule = () => {
  document.getElementById('schedule-grid').innerHTML = Object.entries(state.schedule).map(
    ([day, slots]) => `<div class="day-col"><h3>${day}</h3>${slots.length ? slots.map((s) => `<div class="slot"><strong>${s}</strong></div>`).join('') : '<div class="slot">—</div>'}</div>`,
  ).join('');
};

const renderPackages = () => {
  document.getElementById('packages-grid').innerHTML = PACKAGES.map(
    (p) => `<article class="plan ${p.featured ? 'plan--featured' : ''}"><h3>${p.name}</h3><div class="price">${p.price}</div><ul>${p.features.map((f) => `<li>${f}</li>`).join('')}</ul></article>`,
  ).join('');
};

const renderAll = () => {
  renderKpis();
  renderDashboard();
  renderStudents(document.getElementById('student-search').value);
  renderSchedule();
  renderPackages();
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

document.getElementById('student-search').addEventListener('input', (e) => renderStudents(e.target.value));

document.getElementById('add-student-btn').addEventListener('click', () => {
  document.getElementById('student-form').hidden = false;
});

document.getElementById('student-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const [done, total] = String(fd.get('hours')).split('/').map(Number);
  state.students.push({
    id: uid(),
    name: fd.get('name'),
    pack: fd.get('pack'),
    hoursDone: done || 0,
    hoursTotal: total || 20,
    status: fd.get('status'),
  });
  save();
  e.target.reset();
  e.target.hidden = true;
  renderAll();
});

document.getElementById('add-lesson-btn').addEventListener('click', () => {
  document.getElementById('lesson-form').hidden = false;
});

document.getElementById('lesson-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const lesson = {
    id: uid(),
    time: fd.get('time'),
    student: fd.get('student'),
    type: fd.get('type'),
    moniteur: fd.get('moniteur'),
  };
  if (fd.get('day') === 'today') {
    state.lessonsToday.push(lesson);
    state.lessonsToday.sort((a, b) => a.time.localeCompare(b.time));
  } else {
    const day = fd.get('day');
    const slot = `${lesson.time.slice(0, 2)}h ${lesson.student}`;
    state.schedule[day] = [...(state.schedule[day] || []), slot];
  }
  save();
  e.target.reset();
  e.target.hidden = true;
  renderAll();
});

document.body.addEventListener('change', (e) => {
  if (e.target.matches('[data-status]')) {
    const student = state.students.find((s) => s.id === e.target.dataset.status);
    if (student) {
      student.status = e.target.value;
      save();
      renderAll();
    }
  }
});

document.body.addEventListener('click', (e) => {
  const hoursBtn = e.target.closest('[data-hours]');
  if (hoursBtn) {
    const student = state.students.find((s) => s.id === hoursBtn.dataset.hours);
    if (student && student.hoursDone < student.hoursTotal) {
      student.hoursDone += 1;
      if (student.hoursDone >= student.hoursTotal && student.status === 'En cours') {
        student.status = 'Exam. code';
      }
      save();
      renderAll();
    }
    return;
  }
  const del = e.target.closest('[data-del-student]');
  if (del) {
    state.students = state.students.filter((s) => s.id !== del.dataset.delStudent);
    save();
    renderAll();
  }
});

const saved = localStorage.getItem('autopilot-theme') || 'light';
document.body.dataset.theme = saved;
document.getElementById('theme-toggle').addEventListener('click', () => {
  const next = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  document.body.dataset.theme = next;
  localStorage.setItem('autopilot-theme', next);
});

renderAll();
