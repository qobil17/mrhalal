import { NestFactory } from '@nestjs/core';
import { MrhalalBatchModule } from './mrhalal-batch.module';

async function bootstrap() {
  const app = await NestFactory.create(MrhalalBatchModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
