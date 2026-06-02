import { Injectable } from '@nestjs/common';

@Injectable()
export class MrhalalApiService {
  getHello(): string {
    return 'Hello World!';
  }
}
