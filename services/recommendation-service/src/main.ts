import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: Number(process.env.PORT) || 3007,
      },
    },
  );
  await app.listen();
  console.log(`Recommendation Microservice is listening on port ${process.env.PORT || 3007}`);
}
bootstrap();