import { Module } from '@nitrostack/core';
import { LifeBrainController } from './life-brain.controller';
import { LifeBrainService } from './life-brain.service';

@Module({
  providers: [LifeBrainController, LifeBrainService],
  exports: [LifeBrainService],
})
export class AppModule {}
