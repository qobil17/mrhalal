import { Controller, Get } from '@nestjs/common';
import { MrhalalApiService } from './mrhalal-api.service';

@Controller()
export class MrhalalApiController {
  constructor(private readonly mrhalalApiService: MrhalalApiService) {}

  @Get()
  getHello(): string {
    return this.mrhalalApiService.getHello();
  }
}
