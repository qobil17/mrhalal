import { Module } from '@nestjs/common';
import { MrhalalBatchController } from './mrhalal-batch.controller';
import { MrhalalBatchService } from './mrhalal-batch.service';

@Module({
  imports: [],
  controllers: [MrhalalBatchController],
  providers: [MrhalalBatchService],
})
export class MrhalalBatchModule {}
