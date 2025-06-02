import { Controller, Post, UploadedFile, UseInterceptors, Body, UploadedFiles } from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { multerProductOptions } from './upload-options';

@Controller('uploads')
export class UploadsController {
  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    {name: 'image', maxCount: 10}
  ], multerProductOptions))
  uploadMultiple(@UploadedFiles() files: any, @Body() body: any) {
    try {
      const uploadedFiles = files.image || [];

      const fileNames = uploadedFiles.map((file: any) => {
        return {src: file.filename}
      });

      return {
        success: true,
        uploadedFileNames: fileNames,
      };
    } catch (error) {
      console.error(error);
    }
  }
}
