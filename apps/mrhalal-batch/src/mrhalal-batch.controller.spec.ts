import { Test, TestingModule } from '@nestjs/testing';
import { MrhalalBatchController } from './mrhalal-batch.controller';
import { MrhalalBatchService } from './mrhalal-batch.service';

describe('MrhalalBatchController', () => {
  let mrhalalBatchController: MrhalalBatchController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MrhalalBatchController],
      providers: [MrhalalBatchService],
    }).compile();

    mrhalalBatchController = app.get<MrhalalBatchController>(MrhalalBatchController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(mrhalalBatchController.getHello()).toBe('Hello World!');
    });
  });
});
