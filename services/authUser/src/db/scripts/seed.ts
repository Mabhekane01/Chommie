import { query, shutdown } from '@packages/database';

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    // Create a test user
    const phoneNumber = '+1234567890';
    const name = 'Test User';
    const bio = 'This is a seeded test user.';
    const isPublic = true;

    // Upsert user
    const userResult = await query(
      `
      INSERT INTO users (phone_number, name, bio, is_public)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (phone_number) DO UPDATE SET
        name = EXCLUDED.name,
        bio = EXCLUDED.bio,
        is_public = EXCLUDED.is_public,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
      `,
      [phoneNumber, name, bio, isPublic]
    );

    const userId = userResult.rows[0].id;
    console.log('✅ Test user created/updated with ID:', userId);

    // Create a test login session for the user
    const ipAddress = '127.0.0.1';
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
    const device = 'desktop';
    const browser = 'Chrome 114.0';
    const os = 'Windows 10';
    const country = 'South Africa';
    const city = 'Johannesburg';

    await query(
      `
      INSERT INTO user_logins (user_id, ip_address, user_agent, device, browser, os, country, city)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT DO NOTHING
      `,
      [userId, ipAddress, userAgent, device, browser, os, country, city]
    );

    console.log('✅ Test login session created');

    console.log('🎉 Database seeding completed');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await shutdown();
  }
}

seedDatabase();
