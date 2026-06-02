import { Module } from '@nestjs/common';
import { MrhalalApiController } from './mrhalal-api.controller';
import { MrhalalApiService } from './mrhalal-api.service';

@Module({
  imports: [],
  controllers: [MrhalalApiController],
  providers: [MrhalalApiService],
})
export class MrhalalApiModule {}
