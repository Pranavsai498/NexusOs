import { Module } from '@nitrostack/core';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';

@Module({
  providers: [DocumentController, DocumentService],
  exports: [DocumentService],
})
export class AppModule {}
