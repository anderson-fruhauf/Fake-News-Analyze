# 🚀 Fake News Analyzer - Backend

Este é o servidor da aplicação Fake News Analyzer, construído com **NestJS**. Ele é responsável pelo processamento pesado, integração com IA e gerenciamento de dados.

## 🛠️ Tecnologias

- **Framework**: [NestJS](https://nestjs.com/)
- **Linguagem**: TypeScript
- **IA**: [Google Generative AI (Gemini 2.5 Flash)](https://ai.google.dev/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Validação**: [Zod](https://zod.dev/)
- **Scraping**: [Cheerio](https://cheerio.js.org/) & [Axios](https://axios-http.com/)

## 🏗️ Arquitetura Técnica

### 🧠 Inteligência Artificial & Guardrails
O coração do backend utiliza o modelo `gemini-2.5-flash` com suporte a **Multimodalidade** e **Google Search Grounding**. 
- **Grounding**: Permite que o modelo verifique informações em tempo real na web antes de gerar o veredito.
- **Guardrails (Zod)**: Todas as respostas da IA passam por um esquema de validação rigoroso. Isso garante que o frontend receba sempre um JSON estruturado, evitando erros de "alucinação" de formato pela IA.

### 🔌 Estrutura de Módulos
- `AnalysisModule`: Orquestra a lógica de análise de links e imagens.
- `PrismaModule`: Centraliza a conexão com o banco de dados.
- `Common/Pipes/Filters`: Tratamento global de erros e validação de entrada.

## 🚀 Instalação e Execução

1. Instale as dependências:
   ```bash
   yarn install
   ```

2. Configure as variáveis de ambiente no `.env`:
   ```env
   DATABASE_URL="file:./dev.db"
   GEMINI_API_KEY="SUA_CHAVE_AQUI"
   ```

3. Execute as migrações do banco:
   ```bash
   yarn migrate
   ```

4. Inicie o servidor:
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
Desenvolvido como parte dos estudos de integração de IA e arquitetura NestJS.
