import { NestFactory } from '@nestjs/core';
import { MrhalalApiModule } from './mrhalal-api.module';

async function bootstrap() {
  const app = await NestFactory.create(MrhalalApiModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
