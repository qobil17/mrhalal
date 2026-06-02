import { Controller, Get } from '@nestjs/common';
import { MrhalalBatchService } from './mrhalal-batch.service';

@Controller()
export class MrhalalBatchController {
  constructor(private readonly mrhalalBatchService: MrhalalBatchService) {}

  @Get()
  getHello(): string {
    return this.mrhalalBatchService.getHello();
  }
}
