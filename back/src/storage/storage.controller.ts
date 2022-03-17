import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { StorageService } from './storage.service';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {storage: diskStorage({
    destination: '../files',
  })}))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
    // write file to local storage './tmp/uploads'
    
  }
}
