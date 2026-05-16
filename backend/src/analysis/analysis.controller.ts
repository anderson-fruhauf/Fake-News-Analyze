import { Controller, Post, Body, UseInterceptors, UploadedFile, HttpException, HttpStatus, Get, Param } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { z } from 'zod';

const LinkDtoSchema = z.object({
  url: z.string().url(),
});

@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('link')
  async analyzeLink(@Body() body: any) {
    try {
      const { url } = LinkDtoSchema.parse(body);
      return await this.analysisService.analyzeLink(url);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new HttpException('URL inválida fornecida', HttpStatus.BAD_REQUEST);
      }
      throw error;
    }
  }

  @Post('image')
  @UseInterceptors(FileInterceptor('image', {
    limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        return cb(new HttpException('Apenas imagens (jpg, jpeg, png, webp) são permitidas!', HttpStatus.BAD_REQUEST), false);
      }
      cb(null, true);
    }
  }))
  async analyzeImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('Nenhuma imagem enviada', HttpStatus.BAD_REQUEST);
    }

    // Processamento em memória e deleção (o Multer por padrão com FileInterceptor guarda em memória se não usar o diskStorage)
    return await this.analysisService.analyzeImage(file.buffer, file.mimetype);
  }

  @Get(':id')
  async getAnalysis(@Param('id') id: string) {
    return await this.analysisService.getAnalysisById(id);
  }
}
