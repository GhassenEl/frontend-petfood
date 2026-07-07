const STORAGE_KEY = 'medilink-data';
const RDV_STATUSES = ['Planifié', 'En salle', 'Terminé', 'Annulé'];

const DEFAULT = {
  doctors: [
    { id: 'd1', name: 'Dr. Leila Mansouri', specialty: 'Médecine générale', phone: '22 123 456' },
    { id: 'd2', name: 'Dr. Hedi Riahi', specialty: 'Cardiologie', phone: '22 234 567' },
    { id: 'd3', name: 'Dr. Maya Ben Salah', specialty: 'Pédiatrie', phone: '22 345 678' },
  ],
  patients: [
    { id: 'p1', name: 'Amine Trabelsi', age: 34, phone: '98 111 222', condition: 'Suivi tension' },
    { id: 'p2', name: 'Salma Gharbi', age: 28, phone: '97 222 333', condition: 'Allergie saisonnière' },
    { id: 'p3', name: 'Karim Bouazizi', age: 45, phone: '96 333 444', condition: 'Diabète type 2' },
    { id: 'p4', name: 'Ines Mejri', age: 8, phone: '95 444 555', condition: 'Contrôle pédiatrique' },
  ],
  appointments: [
    { id: 'a1', date: new Date().toISOString().slice(0, 10), time: '09:00', patient: 'Amine T.', doctor: 'Dr. Mansouri', status: 'Planifié' },
    { id: 'a2', date: new Date().toISOString().slice(0, 10), time: '10:30', patient: 'Salma G.', doctor: 'Dr. Riahi', status: 'En salle' },
    { id: 'a3', date: new Date().toISOString().slice(0, 10), time: '14:00', patient: 'Karim B.', doctor: 'Dr. Mansouri', status: 'Planifié' },
    { id: 'a4', date: '2026-07-10', time: '11:00', patient: 'Ines M.', doctor: 'Dr. Ben Salah', status: 'Planifié' },
  ],
  medications: [
    { id: 'm1', patient: 'Amine T.', doctor: 'Dr. Mansouri', drug: 'Amlodipine 5mg', dosage: '1 cp/j', duration: 30 },
    { id: 'm2', patient: 'Salma G.', doctor: 'Dr. Riahi', drug: 'Cetirizine 10mg', dosage: '1 cp/soir', duration: 14 },
    { id: 'm3', patient: 'Karim B.', doctor: 'Dr. Mansouri', drug: 'Metformine 850mg', dosage: '2 cp/j', duration: 60 },
  ],
};

const TITLES = {
  dashboard: 'Tableau de bord',
  doctors: 'Médecins',
  patients: 'Patients',
  appointments: 'Rendez-vous',
  medications: 'Médicaments',
};

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
const today = () => new Date().toISOString().slice(0, 10);

const statusBadge = (s) => {
  const cls = s === 'Terminé' ? 'badge--ok' : s === 'Annulé' ? 'badge--off' : s === 'En salle' ? 'badge--warn' : 'badge--off';
  return `<span class="badge ${cls}">${s}</span>`;
};

const nextRdvStatus = (s) => RDV_STATUSES[(RDV_STATUSES.indexOf(s) + 1) % RDV_STATUSES.length];

const renderKpis = () => {
  const rdvToday = state.appointments.filter((a) => a.date === today() && a.status !== 'Annulé');
  const waiting = rdvToday.filter((a) => a.status === 'En salle').length;
  document.getElementById('kpi-grid').innerHTML = `
    <div class="kpi"><span>RDV aujourd'hui</span><strong>${rdvToday.length}</strong></div>
    <div class="kpi"><span>En salle d'attente</span><strong>${waiting}</strong></div>
    <div class="kpi"><span>Patients</span><strong>${state.patients.length}</strong></div>
    <div class="kpi"><span>Ordonnances actives</span><strong>${state.medications.length}</strong></div>`;
};

const renderDashboard = () => {
  const rdv = state.appointments.filter((a) => a.date === today()).sort((a, b) => a.time.localeCompare(b.time));
  document.getElementById('today-appointments').innerHTML = rdv.length
    ? rdv.map((a) => `<li><span><strong>${a.time}</strong> — ${a.patient} (${a.doctor})</span>${statusBadge(a.status)}</li>`).join('')
    : '<li><span>Aucun RDV aujourd\'hui</span></li>';

  document.getElementById('recent-meds').innerHTML = state.medications.slice(0, 4).map(
    (m) => `<li><span>${m.patient} — ${m.drug}</span><span>${m.dosage}</span></li>`,
  ).join('');
};

const renderDoctors = () => {
  document.getElementById('doctors-grid').innerHTML = state.doctors.map(
    (d) => `<article class="doctor-card">
      <button type="button" class="btn btn--ghost card-actions" data-del-doctor="${d.id}">✕</button>
      <h3>${d.name}</h3><p>${d.specialty}</p><p>📞 ${d.phone || '—'}</p>
    </article>`,
  ).join('');
};

const renderPatients = (q = '') => {
  const list = state.patients.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  document.getElementById('patients-table').innerHTML = list.map(
    (p) => `<tr><td>${p.name}</td><td>${p.age}</td><td>${p.phone}</td><td>${p.condition}</td>
      <td><button type="button" class="btn btn--ghost" data-del-patient="${p.id}">Suppr.</button></td></tr>`,
  ).join('');
};

const renderAppointments = () => {
  const sorted = [...state.appointments].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  document.getElementById('rdv-table').innerHTML = sorted.map(
    (a) => `<tr>
      <td>${a.date}</td><td>${a.time}</td><td>${a.patient}</td><td>${a.doctor}</td>
      <td><button type="button" class="status-btn" data-rdv="${a.id}">${statusBadge(a.status)}</button></td>
      <td><button type="button" class="btn btn--ghost" data-del-rdv="${a.id}">Suppr.</button></td>
    </tr>`,
  ).join('');
};

const renderMedications = () => {
  document.getElementById('meds-grid').innerHTML = state.medications.map(
    (m) => `<article class="med-card">
      <button type="button" class="btn btn--ghost card-actions" data-del-med="${m.id}">✕</button>
      <h3>${m.drug}</h3>
      <p><strong>${m.patient}</strong> · ${m.doctor}</p>
      <p>${m.dosage} · ${m.duration} jours</p>
    </article>`,
  ).join('');
};

const renderAll = () => {
  renderKpis();
  renderDashboard();
  renderDoctors();
  renderPatients(document.getElementById('patient-search').value);
  renderAppointments();
  renderMedications();
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

const toggleForm = (btnId, formId) => {
  document.getElementById(btnId).addEventListener('click', () => {
    document.getElementById(formId).hidden = false;
  });
};

toggleForm('add-doctor-btn', 'doctor-form');
toggleForm('add-patient-btn', 'patient-form');
toggleForm('add-rdv-btn', 'rdv-form');
toggleForm('add-med-btn', 'med-form');

document.getElementById('doctor-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  state.doctors.push({ id: uid(), name: fd.get('name'), specialty: fd.get('specialty'), phone: fd.get('phone') });
  save(); e.target.reset(); e.target.hidden = true; renderAll();
});

document.getElementById('patient-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  state.patients.push({ id: uid(), name: fd.get('name'), age: Number(fd.get('age')), phone: fd.get('phone'), condition: fd.get('condition') });
  save(); e.target.reset(); e.target.hidden = true; renderAll();
});

document.getElementById('rdv-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  state.appointments.push({ id: uid(), date: fd.get('date'), time: fd.get('time'), patient: fd.get('patient'), doctor: fd.get('doctor'), status: fd.get('status') });
  save(); e.target.reset(); e.target.hidden = true; renderAll();
});

document.getElementById('med-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  state.medications.unshift({ id: uid(), patient: fd.get('patient'), doctor: fd.get('doctor'), drug: fd.get('drug'), dosage: fd.get('dosage'), duration: Number(fd.get('duration')) });
  save(); e.target.reset(); e.target.hidden = true; renderAll();
});

document.getElementById('patient-search').addEventListener('input', (e) => renderPatients(e.target.value));

document.body.addEventListener('click', (e) => {
  const rdvBtn = e.target.closest('[data-rdv]');
  if (rdvBtn) {
    const appt = state.appointments.find((a) => a.id === rdvBtn.dataset.rdv);
    if (appt) { appt.status = nextRdvStatus(appt.status); save(); renderAll(); }
    return;
  }
  const dels = [
    ['data-del-doctor', 'doctors'],
    ['data-del-patient', 'patients'],
    ['data-del-rdv', 'appointments'],
    ['data-del-med', 'medications'],
  ];
  for (const [attr, key] of dels) {
    const btn = e.target.closest(`[${attr}]`);
    if (btn) {
      const id = btn.getAttribute(attr);
      state[key] = state[key].filter((item) => item.id !== id);
      save(); renderAll();
      return;
    }
  }
});

const saved = localStorage.getItem('medilink-theme') || 'light';
document.body.dataset.theme = saved;
document.getElementById('theme-toggle').addEventListener('click', () => {
  const next = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  document.body.dataset.theme = next;
  localStorage.setItem('medilink-theme', next);
});

renderAll();
