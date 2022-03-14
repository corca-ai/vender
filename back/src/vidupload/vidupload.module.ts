import { Module } from '@nestjs/common';
import { ViduploadController } from './vidupload.controller';
import { ViduploadService } from './vidupload.service';

@Module({
  controllers: [ViduploadController],
  providers: [ViduploadService]
})
export class ViduploadModule {}
