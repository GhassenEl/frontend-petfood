/**
 * Peuple clients, RDV, ordonnances et consultations pour vet@petfood.tn
 *
 * Usage (stack Docker) :
 *   npm run seed:vet-live
 * Ou manuellement :
 *   docker cp scripts/seed-vet-live-data.cjs petfood-backend:/app/scripts/
 *   docker exec petfood-backend node /app/scripts/seed-vet-live-data.cjs
 */
const { prisma, connectDB } = require('../prismaClient');
const { generateGoogleMeetLink } = require('../utils/googleMeet');
const bcrypt = require('bcryptjs');

const VET_EMAIL = 'vet@petfood.tn';

const DEMO_CLIENTS = [
  {
    email: 'client@petfood.tn',
    name: 'Sami Ben Ali',
    phone: '+216 22 111 222',
    address: '12 Avenue Habib Bourguiba, La Marsa',
    pets: [
      { name: 'Max', type: 'dog', breed: 'Berger allemand', weight: 32, ageYears: 5 },
      { name: 'Luna', type: 'cat', breed: 'Européen', weight: 4.2, ageYears: 3 },
    ],
  },
  {
    email: 'ines.trabelsi@email.tn',
    name: 'Ines Trabelsi',
    phone: '+216 98 333 444',
    address: '45 Rue de l\'Indépendance, Ariana',
    pets: [{ name: 'Mimi', type: 'cat', breed: 'Siamois', weight: 3.8, ageYears: 2 }],
  },
  {
    email: 'youssef.gharbi@email.tn',
    name: 'Youssef Gharbi',
    phone: '+216 55 777 888',
    address: 'Résidence Les Jasmins, Lac 1',
    pets: [{ name: 'Rex', type: 'dog', breed: 'Labrador', weight: 28, ageYears: 8 }],
  },
  {
    email: 'nadia.k@email.tn',
    name: 'Nadia Khalfallah',
    phone: '+216 27 444 555',
    address: '8 Rue Sidi Bou Said, Carthage',
    pets: [{ name: 'Simba', type: 'cat', breed: 'Maine Coon', weight: 5.1, ageYears: 4 }],
  },
];

const apptDate = (dayOffset, hour, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
};

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

const birthFromAge = (ageYears) => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - ageYears);
  return d;
};

async function ensureClient(clientDef) {
  let user = await prisma.user.findFirst({ where: { email: clientDef.email } });
  if (!user) {
    const hash = await bcrypt.hash('MonChat123!', 10);
    user = await prisma.user.create({
      data: {
        email: clientDef.email,
        name: clientDef.name,
        phone: clientDef.phone,
        address: clientDef.address,
        role: 'client',
        password: hash,
      },
    });
    console.log(`  + client créé: ${clientDef.email}`);
  }

  for (const pet of clientDef.pets) {
    const existing = await prisma.pet.findFirst({
      where: { ownerId: user.id, name: pet.name },
    });
    if (!existing) {
      await prisma.pet.create({
        data: {
          ownerId: user.id,
          name: pet.name,
          type: pet.type,
          breed: pet.breed,
          weight: pet.weight,
          birthDate: birthFromAge(pet.ageYears),
        },
      });
    }
  }
  return user;
}

async function seedVetClinicProfile(vet) {
  let prefs = {};
  try {
    prefs = vet.preferences ? JSON.parse(vet.preferences) : {};
  } catch {
    prefs = {};
  }

  prefs.clinic = {
    ...(prefs.clinic || {}),
    clinicName: 'Clinique VetCare Tunis',
    phone: '+216 71 222 333',
    emergencyPhone: '+216 71 999 000',
    address: '15 Avenue de la République, Tunis',
    region: 'Grand Tunis',
    description: 'Consultations, urgences et téléconsultations — cabinet partenaire PetfoodTN.',
    acceptsHomeVisit: true,
    acceptsTeleconsult: true,
    services: ['Consultation', 'Urgences', 'Vaccination', 'Chirurgie', 'Téléconsultation'],
    openingHours: {
      mon: '08:30-18:00',
      tue: '08:30-18:00',
      wed: '08:30-18:00',
      thu: '08:30-18:00',
      fri: '08:30-18:00',
      sat: '09:00-13:00',
      sun: 'Urgences: +216 71 999 000',
    },
  };

  await prisma.user.update({
    where: { id: vet.id },
    data: {
      phone: prefs.clinic.phone,
      address: prefs.clinic.address,
      region: prefs.clinic.region,
      preferences: JSON.stringify(prefs),
    },
  });
  console.log('  ✓ profil clinique (urgences) enregistré');
}

async function main() {
  await connectDB();
  const vet = await prisma.user.findFirst({ where: { email: VET_EMAIL } });
  if (!vet) {
    console.error(`Vétérinaire ${VET_EMAIL} introuvable — lancez d'abord npm run seed`);
    process.exit(1);
  }

  console.log(`🩺 Seed données live pour ${vet.name} (${vet.id})`);

  const owners = [];
  for (const c of DEMO_CLIENTS) {
    owners.push(await ensureClient(c));
  }

  await seedVetClinicProfile(vet);

  const existingAppts = await prisma.petAppointment.count({ where: { vetId: vet.id } });
  const createdAppts = [];

  if (existingAppts >= 5) {
    console.log(`ℹ️  ${existingAppts} RDV déjà assignés au vet — skip appointments`);
    const existing = await prisma.petAppointment.findMany({
      where: { OR: [{ vetId: vet.id }, { vetId: null }] },
      orderBy: { date: 'asc' },
      take: 10,
    });
    createdAppts.push(...existing);
  } else {
    const appointmentDefs = [
      {
        ownerId: owners[0].id,
        vetId: vet.id,
        petName: 'Max',
        animalType: 'dog',
        type: 'veterinary',
        visitMode: 'cabinet',
        date: apptDate(0, 10, 0),
        status: 'confirmed',
        notes: 'Contrôle annuel + vaccin rage',
      },
      {
        ownerId: owners[1].id,
        vetId: vet.id,
        petName: 'Mimi',
        animalType: 'cat',
        type: 'veterinary',
        visitMode: 'cabinet',
        date: apptDate(0, 14, 30),
        status: 'scheduled',
        notes: 'Dermatite — suivi',
      },
      {
        ownerId: owners[2].id,
        vetId: vet.id,
        petName: 'Rex',
        animalType: 'dog',
        type: 'veterinary',
        visitMode: 'home',
        date: apptDate(1, 9, 0),
        status: 'pending',
        notes: 'Boiterie patte avant',
      },
      {
        ownerId: owners[0].id,
        vetId: vet.id,
        petName: 'Luna',
        animalType: 'cat',
        type: 'veterinary_teleconsultation',
        visitMode: 'online',
        date: apptDate(2, 11, 0),
        status: 'confirmed',
        meetingLink: generateGoogleMeetLink(),
        notes: 'Téléconsultation post-op',
        reminderSent: true,
      },
      {
        ownerId: owners[3].id,
        vetId: null,
        petName: 'Simba',
        animalType: 'cat',
        type: 'veterinary',
        visitMode: 'cabinet',
        date: apptDate(1, 15, 0),
        status: 'pending',
        notes: 'Vomissements récurrents — URGENCE possible',
      },
      {
        ownerId: owners[0].id,
        vetId: vet.id,
        petName: 'Max',
        animalType: 'dog',
        type: 'veterinary',
        visitMode: 'cabinet',
        date: apptDate(-2, 16, 0),
        status: 'completed',
        notes: 'Consultation urgence digestive — vomissements',
      },
    ];

    for (const a of appointmentDefs) {
      createdAppts.push(await prisma.petAppointment.create({ data: a }));
    }
    console.log(`✅ ${appointmentDefs.length} rendez-vous créés`);
  }

  const completedAppt = createdAppts.find((a) => a.status === 'completed' && a.petName === 'Max')
    || await prisma.petAppointment.findFirst({
      where: { vetId: vet.id, status: 'completed', petName: 'Max' },
    });

  const existingConsult = await prisma.vetConsultation.count({ where: { vetId: vet.id } });
  if (existingConsult < 3 && completedAppt) {
    const consultDefs = [
      {
        appointmentId: completedAppt.id,
        vetId: vet.id,
        ownerId: owners[0].id,
        petName: 'Max',
        animalType: 'dog',
        diagnosis: 'Gastro-entérite aiguë',
        symptoms: 'Vomissements, fièvre 39.8°C, léthargie',
        recommendations: 'Antiémétique + réhydratation — urgence traitée',
        status: 'completed',
        updatedAt: daysAgo(2),
      },
    ];

    const mimiAppt = createdAppts.find((a) => a.petName === 'Mimi')
      || await prisma.petAppointment.findFirst({ where: { vetId: vet.id, petName: 'Mimi' } });
    if (mimiAppt) {
      consultDefs.push({
        appointmentId: mimiAppt.id,
        vetId: vet.id,
        ownerId: owners[1].id,
        petName: 'Mimi',
        animalType: 'cat',
        diagnosis: 'Dermatite allergique',
        symptoms: 'Grattage excessif, rougeurs ventrales',
        recommendations: 'Corticoïdes topiques + antihistaminique',
        status: 'completed',
        updatedAt: daysAgo(12),
      });
    }

    for (const c of consultDefs) {
      const exists = await prisma.vetConsultation.findUnique({ where: { appointmentId: c.appointmentId } });
      if (!exists) await prisma.vetConsultation.create({ data: c });
    }
    console.log(`✅ consultations créées (${consultDefs.length})`);
  }

  const existingRx = await prisma.prescription.count({ where: { vetId: vet.id } });
  if (existingRx < 3) {
    const prescriptions = [
      {
        vetId: vet.id,
        ownerId: owners[1].id,
        petName: 'Mimi',
        medications: JSON.stringify([
          { name: 'Cortisone topique', dosage: '1 application/j', duration: '7 jours' },
          { name: 'Antihistaminique', dosage: '0.5 mg/kg', duration: '14 jours' },
        ]),
        instructions: 'Éviter le poulet. Contrôle dans 14 jours.',
        status: 'active',
        validUntil: apptDate(30, 23, 59),
        createdAt: daysAgo(12),
      },
      {
        vetId: vet.id,
        ownerId: owners[2].id,
        petName: 'Rex',
        medications: JSON.stringify([
          { name: 'Méloxicam', dosage: '0.1 mg/kg', duration: '10 jours' },
          { name: 'Glucosamine', dosage: '1 comprimé/j', duration: '30 jours' },
        ]),
        instructions: 'Repos relatif, éviter les escaliers.',
        status: 'active',
        validUntil: apptDate(45, 23, 59),
        createdAt: daysAgo(90),
      },
      {
        vetId: vet.id,
        ownerId: owners[0].id,
        petName: 'Max',
        medications: JSON.stringify([
          { name: 'Métoclopramide', dosage: '0.5 mg/kg x2/j', duration: '3 jours' },
          { name: 'Probiotiques', dosage: '1 sachet/j', duration: '7 jours' },
        ]),
        instructions: 'Urgence digestive traitée — jeûne 12h puis alimentation légère.',
        status: 'fulfilled',
        validUntil: daysAgo(1),
        createdAt: daysAgo(2),
      },
    ];

    for (const rx of prescriptions) {
      await prisma.prescription.create({ data: rx });
    }
    console.log(`✅ ${prescriptions.length} ordonnances créées`);
  } else {
    console.log(`ℹ️  ${existingRx} ordonnances déjà présentes`);
  }

  const pendingContacts = await prisma.veterinaryContactRequest.count({ where: { status: 'pending' } });
  if (pendingContacts < 2) {
    await prisma.veterinaryContactRequest.createMany({
      data: [
        {
          ownerId: owners[3].id,
          petName: 'Simba',
          animalType: 'cat',
          subject: 'Urgence — vomissements',
          message: 'Simba vomit depuis 2 jours, refuse de manger. Besoin d\'un RDV urgent.',
          status: 'pending',
          preferredDate: apptDate(0, 17, 0),
        },
        {
          ownerId: owners[1].id,
          petName: 'Mimi',
          animalType: 'cat',
          subject: 'Suivi dermatite',
          message: 'Grattage persistant malgré le traitement. Demande de téléconsultation.',
          status: 'pending',
        },
      ],
    });
    console.log('✅ demandes de contact créées');
  }

  const summary = {
    clients: await prisma.user.count({ where: { role: 'client' } }),
    appointmentsForVet: await prisma.petAppointment.count({ where: { vetId: vet.id } }),
    unassigned: await prisma.petAppointment.count({ where: { vetId: null, status: { in: ['scheduled', 'pending'] } } }),
    prescriptions: await prisma.prescription.count({ where: { vetId: vet.id } }),
    consultations: await prisma.vetConsultation.count({ where: { vetId: vet.id } }),
  };
  console.log('📊 Résumé:', JSON.stringify(summary));
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
