# 🚀 TruthLens AI - Backend

Este é o servidor da aplicação **TruthLens AI**, construído com **NestJS**. Ele é responsável pelo processamento orquestrado, integração com IA multimodal e gerenciamento de persistência.

## 🛠️ Tecnologias

- **Framework**: [NestJS](https://nestjs.com/)
- **IA**: [Google Generative AI (Gemini 2.5 Flash)](https://ai.google.dev/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Validação & Guardrails**: [Zod](https://zod.dev/)
- **Scraping**: [Cheerio](https://cheerio.js.org/) & [Axios](https://axios-http.com/)
- **Processamento de Imagem**: Suporte nativo do Gemini para visão computacional.

## 🏗️ Arquitetura Técnica

### 🧠 Inteligência Artificial & Guardrails
O coração do backend utiliza o modelo `gemini-2.5-flash` com suporte a **Multimodalidade** e **Google Search Grounding**. 
- **Grounding**: Permite que o modelo verifique informações em tempo real na web antes de gerar o veredito, garantindo precisão factual.
- **Multimodalidade**: Processamento direto de imagens para OCR e análise de contexto visual.
- **Guardrails (Zod)**: Todas as respostas da IA são validadas contra esquemas rigorosos, garantindo que o frontend receba dados estruturados e tipados (JSON), eliminando alucinações de formato.

### 🔌 Estrutura de Módulos
- `AnalysisModule`: Orquestra a lógica de extração de conteúdo (scraping) e análise via IA.
- `PrismaModule`: Gerenciamento centralizado da camada de dados.
- `UploadModule`: Gerenciamento de arquivos e buffers para análise de imagens.

## 🚀 Instalação e Execução

1. **Instale as dependências**:
   ```bash
   yarn install
   ```

2. **Configure o ambiente**:
   Crie um arquivo `.env` baseado no `.env.example`:
   ```env
   DATABASE_URL="postgresql://..." # Ou SQLite para dev local
   GEMINI_API_KEY="SUA_CHAVE_AQUI"
   ```

3. **Prepare o banco de dados**:
   ```bash
   yarn migrate
   ```

4. **Inicie o servidor**:
   ```bash
   yarn dev
   ```

## 🧪 Testes

```bash
# Unitários
yarn test

# E2E
yarn test:e2e
```

---
<p align="center">Parte do ecossistema TruthLens AI para combate à desinformação.</p>

