import { Module } from '@nestjs/common';
import { ViduploadModule } from './vidupload/vidupload.module';

@Module({
  imports: [ViduploadModule],
})
export class AppModule {}
