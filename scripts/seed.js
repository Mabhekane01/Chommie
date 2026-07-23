// Seeds the Chommie catalogue with real SA staples (do.md blueprint) plus a
// couple of discretionary marketplace items, then seeds a demo buying circle
// with a pooled basket so the discovery engine's circle affinity (Route B) is
// demonstrable. Run the gateway + services first, then: npm run seed
const API_URL = process.env.API_URL || 'http://localhost:3000';

// Node 18+ has global fetch; fall back to node-fetch if needed.
const fetchFn =
  typeof fetch !== 'undefined' ? fetch : (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const STAPLES = [
  {
    name: 'Grade A Large Eggs (30 Tray)',
    brand: 'Ekhaya Farms', sku: 'CHM-EGG-30', unitValue: 30, unitMeasure: 'egg', specifications: { 'Grade': 'A', 'Size': 'Large', 'Pack': '30 eggs', 'Origin': 'Gauteng, South Africa' }, bulkPricing: [{ minQuantity: 5, discountPercentage: 5 }, { minQuantity: 20, discountPercentage: 12 }],
    description: 'Farm-fresh large eggs, tray of 30. A Chommie staple priced close to landed cost.',
    price: 69.99, retailPrice: 84.99, landedCost: 62.0,
    category: 'Eggs', stock: 400, isStaple: true,
    blackOwned: true, localProducer: true, producerName: 'Ekhaya Poultry Co-op',
    deliveryRegions: ['Gauteng', 'Soweto'], reliabilityScore: 0.9,
    images: ['https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600'],
    supplierId: 'v-ekhaya', bnplEligible: false,
  },
  {
    name: 'Super Maize Meal 10kg',
    brand: 'Vukani', sku: 'CHM-MZE-10', unitValue: 10, unitMeasure: 'kg', specifications: { 'Type': 'Super maize meal', 'Weight': '10kg', 'Fortified': 'Vitamin A + minerals' }, bulkPricing: [{ minQuantity: 10, discountPercentage: 6 }, { minQuantity: 50, discountPercentage: 15 }],
    description: 'Fine white super maize meal, 10kg. Everyday pap staple.',
    price: 84.99, retailPrice: 99.99, landedCost: 76.0,
    category: 'Maize Meal', stock: 300, isStaple: true,
    blackOwned: true, localProducer: true, producerName: 'Vukani Grain Mills',
    deliveryRegions: ['Gauteng'], reliabilityScore: 0.85,
    images: ['https://images.unsplash.com/photo-1614961233913-a5113a4a34ed?w=600'],
    supplierId: 'v-vukani', bnplEligible: false,
  },
  {
    name: 'Sunflower Cooking Oil 5L',
    brand: 'Cape Oils', sku: 'CHM-OIL-5', unitValue: 5, unitMeasure: 'L', specifications: { 'Type': 'Pure sunflower', 'Volume': '5L', 'Cholesterol': 'Free' }, bulkPricing: [{ minQuantity: 6, discountPercentage: 8 }],
    description: 'Pure sunflower cooking oil, 5 litre.',
    price: 179.99, retailPrice: 209.99, landedCost: 166.0,
    category: 'Cooking Oil', stock: 250, isStaple: true,
    blackOwned: false, localProducer: true, producerName: 'Cape Oils',
    deliveryRegions: ['Western Cape', 'Cape Town'], reliabilityScore: 0.8,
    images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600'],
    supplierId: 'v-capeoils', bnplEligible: false,
  },
  {
    name: 'Long Grain Parboiled Rice 10kg',
    brand: 'iRice', sku: 'CHM-RCE-10', unitValue: 10, unitMeasure: 'kg', specifications: { 'Grain': 'Long, parboiled', 'Weight': '10kg' }, bulkPricing: [{ minQuantity: 10, discountPercentage: 10 }],
    description: 'Long grain parboiled rice, 10kg bag.',
    price: 149.99, retailPrice: 174.99, landedCost: 138.0,
    category: 'Rice', stock: 200, isStaple: true,
    blackOwned: false, localProducer: false, producerName: 'iRice SA',
    deliveryRegions: [], reliabilityScore: 0.75,
    images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600'],
    supplierId: 'v-irice', bnplEligible: false,
  },
  {
    name: 'White Sugar 10kg',
    brand: 'KZN Sugar', sku: 'CHM-SGR-10', unitValue: 10, unitMeasure: 'kg', specifications: { 'Type': 'White granulated', 'Weight': '10kg' }, bulkPricing: [{ minQuantity: 10, discountPercentage: 7 }],
    description: 'Pure white sugar, 10kg.',
    price: 174.99, retailPrice: 199.99, landedCost: 162.0,
    category: 'Sugar', stock: 180, isStaple: true,
    blackOwned: false, localProducer: true, producerName: 'KZN Sugar',
    deliveryRegions: ['KwaZulu-Natal', 'Durban'], reliabilityScore: 0.82,
    images: ['https://images.unsplash.com/photo-1610137213222-8f9a1a9f9f9f?w=600'],
    supplierId: 'v-kznsugar', bnplEligible: false,
  },
  {
    name: 'Sugar Beans 5kg',
    brand: 'Limpopo Pulses', sku: 'CHM-BNS-5', unitValue: 5, unitMeasure: 'kg', specifications: { 'Type': 'Dried sugar beans', 'Weight': '5kg' }, bulkPricing: [{ minQuantity: 8, discountPercentage: 9 }],
    description: 'Dried sugar beans, 5kg.',
    price: 189.99, retailPrice: 224.99, landedCost: 174.0,
    category: 'Legumes', stock: 150, isStaple: true,
    blackOwned: true, localProducer: true, producerName: 'Limpopo Pulses Co-op',
    deliveryRegions: ['Limpopo', 'Gauteng'], reliabilityScore: 0.88,
    images: ['https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=600'],
    supplierId: 'v-limpopo', bnplEligible: false,
  },
  {
    name: 'Full Cream Long-Life Milk (6 x 1L)',
    brand: 'Free State Dairies', sku: 'CHM-MLK-6', unitValue: 6, unitMeasure: 'L', specifications: { 'Type': 'UHT full cream', 'Pack': '6 x 1L' }, bulkPricing: [{ minQuantity: 4, discountPercentage: 6 }],
    description: 'UHT full cream milk, six 1-litre cartons.',
    price: 89.99, retailPrice: 104.99, landedCost: 82.0,
    category: 'Dairy', stock: 220, isStaple: true,
    blackOwned: false, localProducer: true, producerName: 'Free State Dairies',
    deliveryRegions: ['Free State', 'Gauteng'], reliabilityScore: 0.8,
    images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600'],
    supplierId: 'v-fsdairy', bnplEligible: false,
  },
  {
    name: 'Cake Flour 10kg',
    brand: 'Sizwe', sku: 'CHM-FLR-10', unitValue: 10, unitMeasure: 'kg', specifications: { 'Type': 'Cake flour', 'Weight': '10kg' }, bulkPricing: [{ minQuantity: 10, discountPercentage: 8 }],
    description: 'All-purpose cake flour, 10kg.',
    price: 129.99, retailPrice: 149.99, landedCost: 120.0,
    category: 'Flour', stock: 160, isStaple: true,
    blackOwned: true, localProducer: false, producerName: 'Sizwe Milling',
    deliveryRegions: ['Gauteng', 'Mpumalanga'], reliabilityScore: 0.83,
    images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600'],
    supplierId: 'v-sizwe', bnplEligible: false,
  },
];

// Discretionary marketplace tier (normal margin, ad-eligible — NOT staples core)
const MARKETPLACE = [
  {
    name: 'Chest Freezer 200L',
    brand: 'KIC', sku: 'CHM-FRZ-200', specifications: { 'Capacity': '200L', 'Energy rating': 'A+', 'Warranty': '2 years' }, badges: ['BEST_SELLER'],
    description: 'Energy-efficient chest freezer, ideal for bulk buying and stokvel storage.',
    price: 3499.0, category: 'Appliances', stock: 30, isStaple: false,
    images: ['https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600'],
    supplierId: 'v456', bnplEligible: true,
  },
  {
    name: '2-Plate Gas Stove',
    brand: 'Cadac', sku: 'CHM-STV-2', specifications: { 'Plates': '2', 'Fuel': 'LPG' },
    description: 'Portable two-plate gas stove.',
    price: 899.0, category: 'Appliances', stock: 60, isStaple: false,
    images: ['https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600'],
    supplierId: 'v456', bnplEligible: true,
  },
];

async function post(path, body) {
  const res = await fetchFn(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} → ${res.status} ${await res.text()}`);
  return res.json();
}

async function seed() {
  console.log('🌱 Seeding Chommie staples + marketplace...');
  const createdIds = [];
  for (const product of [...STAPLES, ...MARKETPLACE]) {
    try {
      const data = await post('/products', product);
      createdIds.push(data._id || data.id);
      console.log(`✅ ${product.name}`);
    } catch (e) {
      console.error(`❌ ${product.name}: ${e.message}`);
    }
  }

  // Seed a demo buying circle with a pooled basket → circle affinity (Route B).
  try {
    console.log('\n🤝 Seeding a demo buying circle...');
    const circle = await post('/circles', {
      name: 'Soweto Staples Stokvel',
      type: 'STOKVEL',
      region: 'Soweto',
      userId: 'seed-user-1',
      payoutCycle: 'MONTH_END',
    });
    const circleId = circle && circle.id;
    if (circleId && createdIds.length >= 2) {
      for (const productId of createdIds.slice(0, 3)) {
        await post(`/circles/${circleId}/basket`, { productId, quantity: 2, userId: 'seed-user-1' });
      }
      console.log(`✅ Circle "${circle.name}" — id=${circleId}, invite=${circle.inviteCode}`);
      console.log(`   Try: GET ${API_URL}/ai/discovery?region=Soweto&circleId=${circleId}`);
    }
  } catch (e) {
    console.error(`⚠️  Circle seed skipped (is circle-service running?): ${e.message}`);
  }

  console.log('\n✨ Done. Try the discovery feed: GET ' + API_URL + '/ai/discovery?region=Soweto');
}

seed();
