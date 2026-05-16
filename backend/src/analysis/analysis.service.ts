import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import * as cheerio from 'cheerio';
import axios from 'axios';

// Guardrails usando Zod para garantir que a saída da IA seja previsível e correta
const AnalysisResultSchema = z.object({
  verdict: z.enum(['VERDADEIRO', 'FALSO', 'PARCIALMENTE_VERDADEIRO', 'INCONCLUSIVO', 'NAO_APLICAVEL']),
  explanation: z.string().min(10),
  confidence: z.number().min(0).max(1),
  centralClaims: z.array(z.string()),
});

type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

@Injectable()
export class AnalysisService {
  private genAI: GoogleGenerativeAI;

  constructor(private prisma: PrismaService) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || 'dummy_key');
  }

  private async fetchLinkContent(url: string): Promise<string> {
    try {
      const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const $ = cheerio.load(response.data);
      // Remove scripts, styles e menus para pegar apenas o conteúdo principal
      $('script, style, nav, footer, header, aside').remove();
      const text = $('body').text().replace(/\s+/g, ' ').trim();
      return text.substring(0, 15000); // Limita o tamanho para o prompt
    } catch (error) {
      throw new HttpException('Falha ao extrair conteúdo do link', HttpStatus.BAD_REQUEST);
    }
  }

  private async analyzeWithGemini(promptContext: string, imagePart?: { inlineData: { data: string; mimeType: string } }): Promise<AnalysisResult> {
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      tools: [{ googleSearch: {} } as any]
    });

    const prompt = `
    Você é um assistente de checagem de fatos (Fact-Checker).
    A data de hoje é: ${new Date().toLocaleDateString('pt-BR')}. Leve isso em consideração ao avaliar datas e eventos recentes. Você tem acesso à busca do Google em tempo real.
    Analise o seguinte conteúdo (que pode ser texto extraído de um link ou o conteúdo de uma imagem anexada).
    Seu objetivo é classificar a veracidade das informações apresentadas.
    
    Conteúdo extraído:
    "${promptContext}"
    
    Retorne ESTRITAMENTE um objeto JSON válido que obedeça a este esquema:
    {
      "verdict": "VERDADEIRO" | "FALSO" | "PARCIALMENTE_VERDADEIRO" | "INCONCLUSIVO" | "NAO_APLICAVEL",
      "explanation": "Explicação detalhada e lógica do porquê desta classificação, citando falhas ou confirmando fatos. Se não for uma notícia, explique aqui.",
      "confidence": 0.0 a 1.0,
      "centralClaims": ["lista", "de", "alegações", "principais"]
    }
    
    Regras Importantes:
    1. Responda APENAS com o JSON. Não adicione markdown como \`\`\`json ou explicações fora das chaves.
    2. Se o conteúdo não for uma notícia, postagem com alegações factuais ou for irrelevante (ex: página de login, menu de site vazio, ou apenas a foto de um cachorro sem contexto), classifique o verdict como "NAO_APLICAVEL" e a confidence como 0.0.
    `;

    try {
      const contentParts: any[] = [prompt];
      if (imagePart) {
        contentParts.push(imagePart);
      }

      const result = await model.generateContent(contentParts);
      const responseText = result.response.text();
      
      // Validação de Guardrails com Zod
      // Tratando caso a IA ainda envie markdown no começo ou no fim
      const cleanJsonStr = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsedJson = JSON.parse(cleanJsonStr);
      const validatedResult = AnalysisResultSchema.parse(parsedJson);
      
      return validatedResult;
    } catch (error: any) {
      console.error('Erro na IA ou na validação do schema. Detalhes:');
      if (error instanceof z.ZodError) {
        console.error('Zod Validation Error:', (error as any).errors);
      } else {
        console.error(error.message);
      }
      
      throw new HttpException('Falha ao processar a análise. O conteúdo extraído pode não ser suportado ou a API falhou. Tente um link mais direto para o texto da notícia.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async analyzeLink(url: string) {
    const extractedText = await this.fetchLinkContent(url);
    const aiResult = await this.analyzeWithGemini(extractedText);

    // Salvar no banco (Cache/Histórico)
    const analysis = await this.prisma.analysis.create({
      data: {
        type: 'LINK',
        content: url,
        extractedText,
        verdict: aiResult.verdict,
        explanation: aiResult.explanation,
        confidence: aiResult.confidence,
        centralClaims: aiResult.centralClaims,
      },
    });

    return analysis;
  }

  async analyzeImage(fileBuffer: Buffer, mimeType: string) {
    // Conversão do buffer para o formato que a API do Gemini aceita
    const base64Image = fileBuffer.toString('base64');
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };

    const aiResult = await this.analyzeWithGemini('Por favor, extraia o texto desta imagem (OCR) e faça a verificação de fatos sobre o conteúdo apresentado.', imagePart);

    // Salvar no banco (Nota: as imagens não são salvas, apenas o resultado do processamento em memória, conforme solicitado)
    const analysis = await this.prisma.analysis.create({
      data: {
        type: 'IMAGE',
        content: 'Imagem enviada pelo usuário (Processada em memória)',
        extractedText: 'Extraído via IA Multimodal',
        verdict: aiResult.verdict,
        explanation: aiResult.explanation,
        confidence: aiResult.confidence,
        centralClaims: aiResult.centralClaims,
      },
    });

    return analysis;
  }

  async getAnalysisById(id: string) {
    const analysis = await this.prisma.analysis.findUnique({
      where: { id },
    });

    if (!analysis) {
      throw new HttpException('Análise não encontrada', HttpStatus.NOT_FOUND);
    }

    return analysis;
  }
}
