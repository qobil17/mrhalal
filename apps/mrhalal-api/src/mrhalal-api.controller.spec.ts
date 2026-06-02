import { Test, TestingModule } from '@nestjs/testing';
import { MrhalalApiController } from './mrhalal-api.controller';
import { MrhalalApiService } from './mrhalal-api.service';

describe('MrhalalApiController', () => {
  let mrhalalApiController: MrhalalApiController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MrhalalApiController],
      providers: [MrhalalApiService],
    }).compile();

    mrhalalApiController = app.get<MrhalalApiController>(MrhalalApiController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(mrhalalApiController.getHello()).toBe('Hello World!');
    });
  });
});
