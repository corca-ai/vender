import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // enable cors with credentials
  app.enableCors({
    origin: 'http://211.58.102.6:8002',
    credentials: true,
  });

  await app.listen(8003);
}
bootstrap();
