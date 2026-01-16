import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

// Force rebuild 10
async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: Number(process.env.PORT) || 3001,
      },
    },
  );
  await app.listen();
  console.log(`Auth Microservice is listening on port ${process.env.PORT || 3001}`);
}
bootstrap();