import { Test, TestingModule } from '@nestjs/testing';
import { AnalysisService } from './analysis.service';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock do Gemini AI
jest.mock('@google/generative-ai');

describe('AnalysisService', () => {
  let service: AnalysisService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalysisService,
        {
          provide: PrismaService,
          useValue: {
            analysis: {
              create: jest.fn().mockResolvedValue({
                id: '123',
                verdict: 'FALSO',
                explanation: 'A alegação é comprovadamente falsa.',
                confidence: 0.95,
              }),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AnalysisService>(AnalysisService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve processar e salvar análise de link com sucesso', async () => {
    // Mock da extração de conteúdo
    jest.spyOn(service as any, 'fetchLinkContent').mockResolvedValue('Notícia falsa extraída');

    // Mock do Gemini AI retornando JSON válido (Guardrail compliance)
    const mockGenerateContent = jest.fn().mockResolvedValue({
      response: {
        text: () => JSON.stringify({
          verdict: 'FALSO',
          explanation: 'A alegação é comprovadamente falsa.',
          confidence: 0.95,
          centralClaims: ['Terra é plana']
        })
      }
    });

    (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: mockGenerateContent
      })
    }));

    // Forçamos a re-instanciação com o mock
    service['genAI'] = new GoogleGenerativeAI('dummy');

    const result = await service.analyzeLink('http://fakenews.com');

    expect(result.verdict).toBe('FALSO');
    expect(prismaService.analysis.create).toHaveBeenCalled();
  });
});
