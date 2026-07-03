/**
 * Seed idempotent — données réelles pour toute la plateforme PetfoodTN.
 * Ne vide pas la base ; complète uniquement ce qui manque.
 *
 * Usage :
 *   npm run seed:platform-live
 */
const { prisma, connectDB } = require('../prismaClient');
const { ensureDemoUsers, ensureDemoPets } = require('../utils/seedUsers');
const {
  generateOrders,
  generateMessages,
  demoProducts,
  createVeterinaryContactRequests,
  createVeterinaryRecords,
  createPetVaccines,
  createFoundMeDemoReports,
} = require('../utils/demoData');
const { defaultBlogArticles } = require('../utils/defaultBlogArticles');
const { seedRefunds } = require('../utils/seedRefunds');
const { seedTeleconsultAppointments } = require('../utils/seedTeleconsult');
const { seedModeratorData } = require('../utils/seedModerator');

const mapProductRow = (product) => ({
  id: product._id,
  name: product.name,
  price: Number(product.price || 0),
  discount: Number(product.discount || 0),
  discountPrice: product.discountPrice != null ? Number(product.discountPrice) : undefined,
  imageUrl: product.imageUrl || product.image || '',
  description: product.description || '',
  category: product.category || 'nourriture',
  animalType: product.animalType || 'other',
  popularity: Number(product.popularity || 0),
  rating_avg: Number(product.rating_avg || 0),
  rating_count: Number(product.rating_count || 0),
  stock: Number(product.stock ?? 50),
  tags: product.tags || [],
  stockHistory: product.stockHistory || [],
});

const resolveRegionFromAddress = (address = '') => {
  const regions = ['Tunis', 'Ariana', 'Sousse', 'Sfax', 'Nabeul', 'Bizerte'];
  return regions.find((r) => address.toLowerCase().includes(r.toLowerCase())) || 'Tunis';
};

async function seedProductsIfEmpty() {
  const count = await prisma.product.count();
  if (count > 0) {
    console.log(`ℹ️  ${count} produit(s) déjà présents`);
    return count;
  }
  const productRows = demoProducts.map(mapProductRow);
  await prisma.product.createMany({ data: productRows });
  console.log(`✅ ${productRows.length} produits créés`);
  return productRows.length;
}

async function main() {
  await connectDB();
  console.log('🌱 Seed plateforme live (idempotent)');

  await ensureDemoUsers();
  await ensureDemoPets();

  await seedProductsIfEmpty();

  const clientUsers = await prisma.user.findMany({
    where: { role: 'client' },
    orderBy: { createdAt: 'asc' },
  });

  if (!clientUsers.length) {
    console.log('⚠️ Aucun client — arrêt.');
    await prisma.$disconnect();
    return;
  }

  const primaryClient = clientUsers.find((u) => u.email === 'client@petfood.tn') || clientUsers[0];

  const contactCount = await prisma.veterinaryContactRequest.count();
  if (contactCount < 5) {
    const contactRequests = createVeterinaryContactRequests({
      ownerId: primaryClient.id,
      count: 20,
    });
    await prisma.veterinaryContactRequest.createMany({
      data: contactRequests.map((r) => ({
        ownerId: r.ownerId,
        animalType: r.animalType,
        petName: r.petName,
        subject: r.subject,
        message: r.message,
        preferredDate: r.preferredDate ? new Date(r.preferredDate) : undefined,
        status: r.status,
        createdAt: new Date(r.createdAt || Date.now()),
      })),
    });
    console.log(`✅ ${contactRequests.length} demandes vétérinaires`);
  }

  const recordCount = await prisma.veterinaryRecord.count();
  if (recordCount < 20) {
    const vetRecords = createVeterinaryRecords({ ownerId: primaryClient.id, count: 40 });
    await prisma.veterinaryRecord.createMany({
      data: vetRecords.map((r) => ({
        ownerId: r.ownerId,
        petName: r.petName,
        animalType: r.animalType,
        visitDate: new Date(r.visitDate),
        diagnosis: r.diagnosis,
        treatment: r.treatment,
        vetNotes: r.vetNotes,
        nextVisit: r.nextVisit ? new Date(r.nextVisit) : undefined,
        weight: r.weight,
        temperature: r.temperature,
        medications: r.medications || undefined,
        status: r.status,
        createdAt: r.visitDate,
        updatedAt: r.visitDate,
      })),
    });
    console.log(`✅ ${vetRecords.length} fiches vétérinaires`);
  }

  const vaccineCount = await prisma.petVaccine.count();
  if (vaccineCount < 10) {
    const allVaccines = clientUsers.flatMap((u) => createPetVaccines({ ownerId: u.id, count: 8 }));
    await prisma.petVaccine.createMany({
      data: allVaccines.map((v) => ({
        ownerId: v.ownerId,
        petName: v.petName,
        animalType: v.animalType,
        vaccineType: v.vaccineType,
        dateAdministered: v.dateAdministered,
        expiryDate: v.expiryDate,
        nextDue: v.nextDue,
        batchNumber: v.batchNumber,
        vetNotes: v.vetNotes,
        status: v.status,
      })),
    });
    console.log(`✅ ${allVaccines.length} vaccins`);
  }

  const blogCount = await prisma.blogArticle.count();
  if (blogCount === 0) {
    for (let i = 0; i < defaultBlogArticles.length; i += 1) {
      const article = defaultBlogArticles[i];
      const publishedAt = new Date();
      publishedAt.setDate(publishedAt.getDate() - i * 14);
      await prisma.blogArticle.create({
        data: { ...article, isPublished: true, publishedAt },
      });
    }
    console.log(`✅ ${defaultBlogArticles.length} articles blog`);
  }

  await seedRefunds();
  await seedTeleconsultAppointments();
  await seedModeratorData();

  const fmCount = await prisma.petFoundMeReport.count();
  if (fmCount === 0) {
    const fmRows = createFoundMeDemoReports(primaryClient.id);
    for (const row of fmRows) {
      await prisma.petFoundMeReport.create({
        data: {
          ...row,
          lastSeenAt: row.lastSeenAt ? new Date(row.lastSeenAt) : undefined,
        },
      });
    }
    console.log(`✅ ${fmRows.length} signalements Retrouvé Moi`);
  }

  const orderCount = await prisma.order.count();
  if (orderCount === 0) {
    const livreur = await prisma.user.findFirst({ where: { role: 'livreur' } });
    const orders = generateOrders(50);
    let created = 0;
    let invoices = 0;
    for (const order of orders) {
      const items = order.items
        .map((item) => ({
          productId: item.productId?._id || item.productId,
          quantity: Number(item.quantity),
          price: Number(item.price),
        }))
        .filter((item) => item.productId);

      if (!items.length) continue;

      const resolvedRegion = order.region || resolveRegionFromAddress(order.address);
      const regionLivreur = resolvedRegion
        ? await prisma.user.findFirst({ where: { role: 'livreur', region: resolvedRegion } })
        : null;
      const assignedLivreurId =
        order.status !== 'pending' && order.status !== 'cancelled'
          ? regionLivreur?.id || livreur?.id
          : null;

      const createdOrder = await prisma.order.create({
        data: {
          userId: primaryClient.id,
          total: Number(order.total),
          status: order.status,
          paymentMethod: order.paymentMethod || 'cash',
          address: order.address,
          phone: order.phone,
          region: resolvedRegion,
          deliveryLocation: order.deliveryLocation || {},
          assignedLivreurId,
          createdAt: new Date(order.createdAt),
          updatedAt: new Date(order.updatedAt || order.createdAt),
          items: { create: items },
        },
      });
      created += 1;

      if (order.status !== 'cancelled') {
        await prisma.invoice.create({
          data: {
            userId: primaryClient.id,
            orderId: createdOrder.id,
            amount: Number(order.total),
            status: order.status === 'paid' ? 'paid' : 'pending',
            paymentMethod: order.paymentMethod || 'cash',
            issuedAt: new Date(order.createdAt),
            paidAt: order.status === 'paid' ? new Date(order.updatedAt || order.createdAt) : null,
          },
        });
        invoices += 1;
      }
    }
    console.log(`✅ ${created} commandes, ${invoices} factures`);
  } else {
    console.log(`ℹ️  ${orderCount} commande(s) déjà présentes`);
  }

  const messageCount = await prisma.message.count();
  if (messageCount === 0) {
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, role: true },
    });
    const userIdByRole = (role) => allUsers.find((u) => u.role === role)?.id;
    const userIdByEmail = (email) => allUsers.find((u) => u.email === email)?.id;
    const resolveDemoUserId = (demoId, type) => {
      const map = {
        demo_admin: userIdByEmail('admin@petfood.tn'),
        demo_client: userIdByEmail('client@petfood.tn'),
        demo_livreur: userIdByEmail('livreur@petfood.tn'),
        demo_vet: userIdByEmail('vet@petfood.tn'),
      };
      if (map[demoId]) return map[demoId];
      if (String(demoId).includes('@')) return userIdByEmail(demoId);
      return userIdByRole(type) || primaryClient.id;
    };

    const messages = generateMessages();
    const messageInserts = messages
      .map((msg) => {
        const senderId = resolveDemoUserId(msg.sender?.userId, msg.sender?.type);
        const receiverId = resolveDemoUserId(msg.receiver?.userId, msg.receiver?.type);
        if (!senderId || !receiverId) return null;
        return {
          senderType: msg.sender?.type || 'client',
          senderId,
          receiverType: msg.receiver?.type || 'admin',
          receiverId,
          orderId: msg.orderId || null,
          message: msg.message,
          isRead: Boolean(msg.isRead),
          createdAt: new Date(msg.createdAt),
          updatedAt: msg.updatedAt ? new Date(msg.updatedAt) : new Date(msg.createdAt),
        };
      })
      .filter(Boolean);

    if (messageInserts.length) {
      await prisma.message.createMany({ data: messageInserts });
    }
    console.log(`✅ ${messageInserts.length} messages`);
  }

  // Vet : npm run seed:vet-live (appelé par seed:platform-live)

  const summary = {
    users: await prisma.user.count(),
    clients: await prisma.user.count({ where: { role: 'client' } }),
    products: await prisma.product.count(),
    orders: await prisma.order.count(),
    invoices: await prisma.invoice.count(),
    pets: await prisma.pet.count(),
    appointments: await prisma.petAppointment.count(),
    prescriptions: await prisma.prescription.count(),
    messages: await prisma.message.count(),
    vaccines: await prisma.petVaccine.count(),
    vetRecords: await prisma.veterinaryRecord.count(),
  };
  console.log('📊 Résumé plateforme:', JSON.stringify(summary));
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
