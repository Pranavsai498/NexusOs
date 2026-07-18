import { Module, McpApp } from '@nitrostack/core';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';

@Module({
  name: 'AppModule',
  providers: [FinanceController, FinanceService],
  exports: [FinanceService],
})
export class AppModule {}

@McpApp({ module: AppModule })
export class Application {}