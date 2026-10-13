const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding StyleMate database...');

  // 1. Create or upsert default user Aryan
  const user = await prisma.user.upsert({
    where: { email: 'aryan@example.com' },
    update: {},
    create: {
      name: 'Aryan Sharma',
      email: 'aryan@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
  });

  // Clean old items for a fresh clean seed
  await prisma.outfitHistory.deleteMany({ where: { userId: user.id } });
  await prisma.outfitItem.deleteMany({});
  await prisma.outfit.deleteMany({ where: { userId: user.id } });
  await prisma.availabilityRecord.deleteMany({});
  await prisma.closetItem.deleteMany({ where: { userId: user.id } });
  await prisma.userPreference.deleteMany({ where: { userId: user.id } });

  // 2. Create User Preferences
  await prisma.userPreference.create({
    data: {
      userId: user.id,
      preferredStyles: JSON.stringify(['Smart Casual', 'Casual', 'Minimal']),
      preferredColors: JSON.stringify(['White', 'Navy', 'Black', 'Beige', 'Olive']),
      dislikedColors: JSON.stringify(['Neon Green', 'Hot Pink']),
      preferredFit: 'Regular',
      otherPreferences: 'Clean modern cuts with versatile layering',
    },
  });

  // 3. Realistic wardrobe items with aesthetic fashion images
  const itemsData = [
    {
      name: 'White Oxford Shirt',
      category: 'Tops',
      type: 'Shirt',
      color: 'White',
      pattern: 'Solid',
      material: '100% Oxford Cotton',
      fit: 'Regular',
      style: 'Smart Casual',
      occasions: JSON.stringify(['College Presentation', 'Office', 'Dinner', 'Interview']),
      seasons: JSON.stringify(['All Season', 'Summer']),
      brand: 'Uniqlo',
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
      isFavorite: true,
      wearCount: 8,
      notes: 'Classic button-down collar. Extremely versatile.',
    },
    {
      name: 'Black Casual Shirt',
      category: 'Tops',
      type: 'Shirt',
      color: 'Black',
      pattern: 'Solid',
      material: 'Linen Blend',
      fit: 'Slim',
      style: 'Casual',
      occasions: JSON.stringify(['Party', 'Date', 'Casual Outing', 'Dinner']),
      seasons: JSON.stringify(['Summer', 'All Season']),
      brand: 'Zara',
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
      isFavorite: false,
      wearCount: 4,
      notes: 'Lightweight and breathable for evenings.',
    },
    {
      name: 'Blue Denim Shirt',
      category: 'Tops',
      type: 'Shirt',
      color: 'Blue',
      pattern: 'Solid',
      material: 'Lightweight Denim',
      fit: 'Regular',
      style: 'Casual',
      occasions: JSON.stringify(['Casual Outing', 'College', 'Travel']),
      seasons: JSON.stringify(['All Season']),
      brand: "Levi's",
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
      isFavorite: true,
      wearCount: 6,
      notes: 'Western yoke detail, great for casual layering.',
    },
    {
      name: 'Grey Heavyweight T-Shirt',
      category: 'Tops',
      type: 'T-Shirt',
      color: 'Grey',
      pattern: 'Solid',
      material: 'Heavy Cotton',
      fit: 'Relaxed',
      style: 'Streetwear',
      occasions: JSON.stringify(['College', 'Casual Outing', 'Travel', 'Gym']),
      seasons: JSON.stringify(['Summer', 'All Season']),
      brand: 'Uniqlo U',
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      isFavorite: false,
      wearCount: 12,
      notes: 'Durable boxy cut everyday tee.',
    },
    {
      name: 'Minimal Beige Polo',
      category: 'Tops',
      type: 'Polo',
      color: 'Beige',
      pattern: 'Solid',
      material: 'Pique Cotton',
      fit: 'Regular',
      style: 'Smart Casual',
      occasions: JSON.stringify(['College Presentation', 'Office', 'Casual Outing', 'Date']),
      seasons: JSON.stringify(['Summer', 'All Season']),
      brand: 'Ralph Lauren',
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1625910513413-5bc0b2c1f7a0?auto=format&fit=crop&w=800&q=80',
      isFavorite: false,
      wearCount: 3,
      notes: 'Refined knit collar with tonal buttons.',
    },
    {
      name: 'Black Minimalist Hoodie',
      category: 'Outerwear',
      type: 'Hoodie',
      color: 'Black',
      pattern: 'Solid',
      material: 'Fleece Cotton',
      fit: 'Oversized',
      style: 'Streetwear',
      occasions: JSON.stringify(['College', 'Casual Outing', 'Travel']),
      seasons: JSON.stringify(['Winter', 'Mild']),
      brand: 'Essentials',
      status: 'TEMPORARILY_UNAVAILABLE', // Unavailable item #1
      unavailableReason: 'Repair',
      unavailableUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
      isFavorite: true,
      wearCount: 15,
      notes: 'At the tailor for zipper replacement.',
    },
    {
      name: 'Navy Tailored Blazer',
      category: 'Outerwear',
      type: 'Coat',
      color: 'Navy',
      pattern: 'Solid',
      material: 'Italian Wool Blend',
      fit: 'Tailored',
      style: 'Formal',
      occasions: JSON.stringify(['Interview', 'Formal Event', 'College Presentation', 'Dinner']),
      seasons: JSON.stringify(['Mild', 'Winter', 'All Season']),
      brand: 'Massimo Dutti',
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
      isFavorite: true,
      wearCount: 5,
      notes: 'Unstructured shoulders with horn buttons.',
    },
    {
      name: 'Olive Field Overshirt',
      category: 'Outerwear',
      type: 'Jacket',
      color: 'Olive',
      pattern: 'Solid',
      material: 'Ripstop Cotton',
      fit: 'Regular',
      style: 'Casual',
      occasions: JSON.stringify(['Casual Outing', 'College', 'Travel']),
      seasons: JSON.stringify(['Mild', 'All Season']),
      brand: 'Barbour',
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
      isFavorite: false,
      wearCount: 7,
      notes: 'Utility chest pockets with muted brass hardware.',
    },
    {
      name: 'Beige Slim Chinos',
      category: 'Bottoms',
      type: 'Chinos',
      color: 'Beige',
      pattern: 'Solid',
      material: 'Stretch Cotton Twill',
      fit: 'Slim',
      style: 'Smart Casual',
      occasions: JSON.stringify(['College Presentation', 'Office', 'Casual Outing', 'Date']),
      seasons: JSON.stringify(['All Season', 'Summer']),
      brand: 'Dockers',
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80',
      isFavorite: true,
      wearCount: 9,
      notes: 'Pairs effortlessly with white shirts and navy jackets.',
    },
    {
      name: 'Black Pleated Trousers',
      category: 'Bottoms',
      type: 'Trousers',
      color: 'Black',
      pattern: 'Solid',
      material: 'Wool Blend',
      fit: 'Tailored',
      style: 'Formal',
      occasions: JSON.stringify(['College Presentation', 'Interview', 'Office', 'Formal Event']),
      seasons: JSON.stringify(['All Season']),
      brand: 'Selected Homme',
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
      isFavorite: true,
      wearCount: 11,
      notes: 'Single front pleat, slightly cropped leg opening.',
    },
    {
      name: 'Blue Vintage Jeans',
      category: 'Bottoms',
      type: 'Jeans',
      color: 'Blue',
      pattern: 'Solid',
      material: 'Selvedge Denim',
      fit: 'Regular',
      style: 'Casual',
      occasions: JSON.stringify(['Casual Outing', 'College', 'Travel', 'Party']),
      seasons: JSON.stringify(['All Season']),
      brand: "Levi's 501",
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80',
      isFavorite: false,
      wearCount: 14,
      notes: 'Medium wash with natural fading.',
    },
    {
      name: 'Black Slim Jeans',
      category: 'Bottoms',
      type: 'Jeans',
      color: 'Black',
      pattern: 'Solid',
      material: 'Stay-Black Denim',
      fit: 'Slim',
      style: 'Casual',
      occasions: JSON.stringify(['Party', 'Casual Outing', 'College', 'Date']),
      seasons: JSON.stringify(['All Season']),
      brand: 'Zara Man',
      status: 'TEMPORARILY_UNAVAILABLE', // Unavailable item #2 (Demonstration item for prompt scenario!)
      unavailableReason: 'Laundry',
      unavailableUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
      imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
      isFavorite: true,
      wearCount: 18,
      notes: 'Currently in the laundry cycle. Available tomorrow.',
    },
    {
      name: 'Minimal White Sneakers',
      category: 'Shoes',
      type: 'Sneakers',
      color: 'White',
      pattern: 'Solid',
      material: 'Calfskin Leather',
      fit: 'Regular',
      style: 'Smart Casual',
      occasions: JSON.stringify(['College Presentation', 'Casual Outing', 'Date', 'Office', 'Travel']),
      seasons: JSON.stringify(['All Season', 'Summer']),
      brand: 'Veja Campo',
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
      isFavorite: true,
      wearCount: 22,
      notes: 'Clean silhouette. Works with both chinos and jeans.',
    },
    {
      name: 'Brown Penny Loafers',
      category: 'Shoes',
      type: 'Loafers',
      color: 'Brown',
      pattern: 'Solid',
      material: 'Burnished Calf Leather',
      fit: 'Regular',
      style: 'Formal',
      occasions: JSON.stringify(['College Presentation', 'Interview', 'Office', 'Dinner', 'Formal Event']),
      seasons: JSON.stringify(['All Season', 'Summer', 'Mild']),
      brand: 'Cole Haan',
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80',
      isFavorite: true,
      wearCount: 10,
      notes: 'Rich patina with comfortable cushioned sole.',
    },
    {
      name: 'Black Leather Sneakers',
      category: 'Shoes',
      type: 'Sneakers',
      color: 'Black',
      pattern: 'Solid',
      material: 'Full Grain Leather',
      fit: 'Regular',
      style: 'Casual',
      occasions: JSON.stringify(['Casual Outing', 'College', 'Party']),
      seasons: JSON.stringify(['All Season', 'Rainy']),
      brand: 'Adidas Samba',
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
      isFavorite: false,
      wearCount: 13,
      notes: 'Low profile classic trainer with gum sole.',
    },
    {
      name: 'Minimalist Steel & Leather Watch',
      category: 'Accessories',
      type: 'Watch',
      color: 'Black',
      pattern: 'Solid',
      material: 'Stainless Steel & Black Leather',
      fit: 'Regular',
      style: 'Minimal',
      occasions: JSON.stringify(['College Presentation', 'Interview', 'Office', 'Date', 'Formal Event']),
      seasons: JSON.stringify(['All Season']),
      brand: 'Seiko',
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
      isFavorite: true,
      wearCount: 25,
      notes: '40mm clean sunray dial with sapphire crystal.',
    },
    {
      name: 'Brown Classic Leather Belt',
      category: 'Accessories',
      type: 'Belt',
      color: 'Brown',
      pattern: 'Solid',
      material: 'Full Grain Italian Leather',
      fit: 'Regular',
      style: 'Smart Casual',
      occasions: JSON.stringify(['College Presentation', 'Office', 'Interview', 'Date']),
      seasons: JSON.stringify(['All Season']),
      brand: 'Fossil',
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80',
      isFavorite: false,
      wearCount: 16,
      notes: 'Brushed brass buckle, matches brown loafers.',
    },
    {
      name: 'Black Baseball Cap',
      category: 'Accessories',
      type: 'Cap',
      color: 'Black',
      pattern: 'Solid',
      material: 'Cotton Twill',
      fit: 'Regular',
      style: 'Streetwear',
      occasions: JSON.stringify(['College', 'Casual Outing', 'Travel']),
      seasons: JSON.stringify(['Summer', 'All Season']),
      brand: 'New Era',
      status: 'TEMPORARILY_UNAVAILABLE', // Unavailable item #3
      unavailableReason: 'Packed',
      unavailableUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
      isFavorite: false,
      wearCount: 7,
      notes: 'Packed in travel duffle bag for weekend trip.',
    },
  ];

  const createdItems = [];
  for (const item of itemsData) {
    const created = await prisma.closetItem.create({
      data: {
        ...item,
        userId: user.id,
      },
    });
    createdItems.push(created);

    // If temporarily unavailable, record in availability log
    if (item.status === 'TEMPORARILY_UNAVAILABLE') {
      await prisma.availabilityRecord.create({
        data: {
          closetItemId: created.id,
          status: 'TEMPORARILY_UNAVAILABLE',
          reason: item.unavailableReason,
          startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          endDate: item.unavailableUntil,
        },
      });
    }
  }

  console.log(`Created ${createdItems.length} wardrobe items.`);

  // 4. Create sample recent outfits and outfit history
  const whiteShirt = createdItems.find((i) => i.name === 'White Oxford Shirt');
  const blackTrousers = createdItems.find((i) => i.name === 'Black Pleated Trousers');
  const beigeChinos = createdItems.find((i) => i.name === 'Beige Slim Chinos');
  const whiteSneakers = createdItems.find((i) => i.name === 'Minimal White Sneakers');
  const brownLoafers = createdItems.find((i) => i.name === 'Brown Penny Loafers');
  const watch = createdItems.find((i) => i.name.includes('Watch'));
  const denimShirt = createdItems.find((i) => i.name === 'Blue Denim Shirt');

  if (whiteShirt && blackTrousers && whiteSneakers) {
    const outfit1 = await prisma.outfit.create({
      data: {
        userId: user.id,
        title: 'White Oxford & Black Trousers',
        occasion: 'College Presentation',
        style: 'Smart Casual',
        weather: 'Mild',
        score: 94,
        explanation:
          'The white shirt creates a clean formal base, while black trousers keep the look professional. White sneakers make the outfit slightly more relaxed and suitable for a college presentation.',
        isFavorite: true,
        isWorn: true,
        plannedDate: new Date(Date.now() - 48 * 60 * 60 * 1000),
      },
    });

    await prisma.outfitItem.createMany({
      data: [
        { outfitId: outfit1.id, closetItemId: whiteShirt.id, role: 'TOP' },
        { outfitId: outfit1.id, closetItemId: blackTrousers.id, role: 'BOTTOM' },
        { outfitId: outfit1.id, closetItemId: whiteSneakers.id, role: 'FOOTWEAR' },
        ...(watch ? [{ outfitId: outfit1.id, closetItemId: watch.id, role: 'ACCESSORY' }] : []),
      ],
    });

    await prisma.outfitHistory.create({
      data: {
        userId: user.id,
        outfitId: outfit1.id,
        wornAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        notes: 'Wore for mid-term research symposium presentation.',
      },
    });
  }

  if (denimShirt && beigeChinos && whiteSneakers) {
    const outfit2 = await prisma.outfit.create({
      data: {
        userId: user.id,
        title: 'Denim Shirt & Beige Chinos',
        occasion: 'Casual Outing',
        style: 'Casual',
        weather: 'Warm',
        score: 91,
        explanation:
          'The textured blue denim creates casual depth against the warmth of beige chinos, anchored by clean white footwear.',
        isFavorite: false,
        isWorn: true,
        plannedDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    });

    await prisma.outfitItem.createMany({
      data: [
        { outfitId: outfit2.id, closetItemId: denimShirt.id, role: 'TOP' },
        { outfitId: outfit2.id, closetItemId: beigeChinos.id, role: 'BOTTOM' },
        { outfitId: outfit2.id, closetItemId: whiteSneakers.id, role: 'FOOTWEAR' },
      ],
    });

    await prisma.outfitHistory.create({
      data: {
        userId: user.id,
        outfitId: outfit2.id,
        wornAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        notes: 'Casual Saturday afternoon coffee and stroll.',
      },
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
