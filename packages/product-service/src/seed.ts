import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProductService } from './product/product.service';
import { CreateProductDto } from '@chommie/shared-types';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productService = app.get(ProductService);

  console.log('Seeding products...');

  // Optional: clear existing
  // await productService.deleteAll(); 

  const products: CreateProductDto[] = [
    {
      name: 'Samsung 55" QLED 4K Smart TV',
      description: 'Experience vivid colors and deep contrasts with this Quantum Dot technology TV. Perfect for gaming and movie nights.',
      price: 12999.00,
      category: 'Electronics',
      stock: 50,
      images: ['https://images.unsplash.com/photo-1593784653277-e4a34768391d?auto=format&fit=crop&q=80&w=800'],
      bnplEligible: true,
      vendorId: 'vendor-1',
    },
    {
      name: 'Sony PlayStation 5 Console',
      description: 'The latest generation of gaming. Lightning-fast loading, 3D audio, and haptic feedback triggers.',
      price: 13499.00,
      category: 'Gaming',
      stock: 20,
      images: ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=800'],
      bnplEligible: true,
      vendorId: 'vendor-1',
    },
    {
      name: 'MacBook Air M2',
      description: 'Supercharged by M2. 13.6-inch Liquid Retina display, 8GB RAM, 256GB SSD. Midnight color.',
      price: 23999.00,
      category: 'Computers',
      stock: 15,
      images: ['https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=800'],
      bnplEligible: true,
      vendorId: 'vendor-2',
    },
    {
      name: 'Modern L-Shape Sofa',
      description: 'Comfortable 3-seater sectional sofa in grey fabric. Perfect for modern living rooms.',
      price: 8500.00,
      category: 'Furniture',
      stock: 10,
      images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800'],
      bnplEligible: true,
      vendorId: 'vendor-3',
    },
    {
      name: 'Nespresso Vertuo Next',
      description: 'Versatile cup sizes, one-touch brewing, and Centrifusion technology for the perfect crema.',
      price: 3299.00,
      category: 'Appliances',
      stock: 30,
      images: ['https://images.unsplash.com/photo-1517036662719-5564c70287a2?auto=format&fit=crop&q=80&w=800'],
      bnplEligible: true,
      vendorId: 'vendor-1',
    },
    {
        name: 'Adidas Ultraboost 22',
        description: 'Responsive running shoes with energy-returning Boost midsole. Black/White.',
        price: 3499.00,
        category: 'Fashion',
        stock: 100,
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800'],
        bnplEligible: true,
        vendorId: 'vendor-4',
    }
  ];

  for (const product of products) {
    await productService.create(product);
    console.log(`Created: ${product.name}`);
  }

  console.log('Seeding complete.');
  await app.close();
}
bootstrap();
