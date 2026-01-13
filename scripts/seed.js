const fetch = require('node-fetch'); // Assuming node-fetch or native fetch in Node 18+

const API_URL = 'http://localhost:3000';

const products = [
  {
    name: "Sony WH-1000XM5 Noise Canceling Headphones",
    description: "Industry-leading noise cancellation, crystal clear hands-free calling, and 30-hour battery life.",
    price: 8999.00,
    category: "Electronics",
    stock: 50,
    images: ["https://m.media-amazon.com/images/I/51SKmu2G9FL._AC_UF894,1000_QL80_.jpg"],
    vendorId: "v123",
    bnplEligible: true
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    description: "The ultimate Galaxy smartphone with AI features, titanium frame, and 200MP camera.",
    price: 28999.00,
    category: "Mobile",
    stock: 20,
    images: ["https://images.samsung.com/is/image/samsung/p6pim/za/2401/gallery/za-galaxy-s24-s928-sm-s928bztkafa-thumb-539301048"],
    vendorId: "v123",
    bnplEligible: true
  },
  {
    name: "Nike Air Max 270",
    description: "Max Air unit delivers unrivaled comfort for all-day wear.",
    price: 2699.00,
    category: "Fashion",
    stock: 100,
    images: ["https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/awj6y2kbp00i0w0w5p7j/air-max-270-mens-shoes-KkLcGR.png"],
    vendorId: "v123",
    bnplEligible: true
  },
  {
    name: "Instant Pot Duo 7-in-1",
    description: "Electric Pressure Cooker, Slow Cooker, Rice Cooker, Steamer, Sauté, Yogurt Maker.",
    price: 2199.00,
    category: "Home & Kitchen",
    stock: 35,
    images: ["https://m.media-amazon.com/images/I/71WtwEvYDOS._AC_UF894,1000_QL80_.jpg"],
    vendorId: "v456", // Different vendor
    bnplEligible: true
  }
];

async function seedProducts() {
  console.log('🌱 Seeding Products...');
  
  for (const product of products) {
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Created: ${product.name}`);
      } else {
        console.error(`❌ Failed: ${product.name}`, await response.text());
      }
    } catch (error) {
      console.error(`❌ Error connecting to API:`, error.message);
    }
  }
}

seedProducts();
