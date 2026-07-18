import { Module, McpApp } from '@nitrostack/core';
import { EducationController } from './education.controller';
import { EducationService } from './education.service';

@Module({
  name: 'AppModule',
  providers: [EducationController, EducationService],
  exports: [EducationService],
})
export class AppModule {}

@McpApp({ module: AppModule })
export class Application {}