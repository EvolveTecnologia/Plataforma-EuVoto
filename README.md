# Plataforma Eu Voto — "Seu Voto, Sua Voz"

Plataforma cívica e analítica de pesquisas eleitorais e simulação de votação para as **Eleições Gerais 2026**, desenvolvida com rigor estatístico, conformidade com a legislação eleitoral (Lei nº 9.504/1997 e Resoluções do TSE) e estrito cumprimento da LGPD (Lei nº 13.709/2018).

---

## 1. Visão Geral da Arquitetura

```
Frontend (React 18 + TypeScript + Vite + Tailwind CSS)
   │  (PWA, responsivo: 360 / 768 / 1024 / 1440)
   ▼
API REST / Servidor Express (Cloud Functions / Cloud Run)
   │
   ├── Motor de ETL TSE (Processador CSV Latin-1 + Resolução de Chapas/Vices)
   ├── Firebase Auth (Autenticação Google + E-mail/Senha com claim admin:true)
   ├── Firestore Database (Regras de Segurança 'Fortress' + Voto Único)
   ├── Firebase Storage (Fotos WebP dos Candidatos + Metadados)
   ├── FCM (Notificações Push por Tópicos de UF)
   └── Gemini 2.5 API (Insights Eleitorais Executivos + "Pergunte aos Dados")
```

### Principais Componentes:
- **Landing Page Institucional & Cívica**: Apresentação da plataforma, cards de pesquisas organizadas por estado, apuração em tempo real, aviso legal PesqEle/TSE obrigatório e seções editáveis pelo CMS.
- **Autenticação & Cadastro Complementar Obrigatório**: Fluxo com validação real dos dois dígitos verificadores do CPF, celular com máscara, sexo, faixa etária e consentimento LGPD com armazenamento exclusivo do hash SHA-256 do documento.
- **Urna Eletrônica Oficial (Simulador Fiel)**:
  - Ordem oficial do TSE: Deputado Federal (4 dígitos), Deputado Estadual/Distrital (5 dígitos), Senador 1ª vaga (3 dígitos), Senador 2ª vaga (3 dígitos — impede repetição da 1ª vaga), Governador (2 dígitos), Presidente (2 dígitos).
  - Consulta automática da API de candidatos, exibição de fotos, vices e suplentes.
  - Teclado numérico físico com sons de clique e alerta de voto nulo para números inexistentes.
  - Som oficial "Pililiiii" de confirmação sintetizado via Web Audio API e tela "FIM".
- **Painel Administrativo & Governança**:
  - Dashboard analítico com KPIs e gráficos interativos (Recharts).
  - Amostragem demográfica protegida (sexo, faixa etária, UFs) restrita aos administradores.
  - Gestor de Pesquisas com publicação instantânea.
  - Esteira ETL para upload de CSVs do TSE com logs de auditoria.
  - Disparador de Notificações Push (FCM).
  - Painel de IA com modelos Gemini para relatórios semanais e chat interativo.
  - Verificador técnico automatizado dos testes T1 a T7 integrado na interface.

---

## 2. Pré-Requisitos e Setup Local

### Requisitos:
- **Node.js**: v20.x ou superior
- **npm**: v10.x ou superior

### Passo a Passo:

1. **Clonar o Repositório e Instalar Dependências:**
   ```bash
   git clone https://github.com/sua-organizacao/plataforma-eu-voto.git
   cd plataforma-eu-voto
   npm install
   ```

2. **Configuração de Variáveis de Ambiente:**
   Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```
   Preencha sua chave do Gemini em `GEMINI_API_KEY` (no Google AI Studio ou Google Cloud Console).

3. **Executar em Modo de Desenvolvimento:**
   ```bash
   npm run dev
   ```
   O servidor iniciará automaticamente na porta `3000` (http://localhost:3000) executando o Express backend em conjunto com o Vite middleware.

4. **Compilação de Produção:**
   ```bash
   npm run build
   ```
   Compila os assets estáticos do Vite em `dist/` e empacota o backend Node em `dist/server.cjs`.

5. **Iniciar em Produção:**
   ```bash
   npm start
   ```

---

## 3. Variáveis de Ambiente (`.env.example`)

| Variável | Descrição | Obrigatório |
| :--- | :--- | :---: |
| `GEMINI_API_KEY` | Chave de API do Google Gemini para geração de insights analíticos e chat de dados | Sim (para recursos de IA) |
| `APP_URL` | URL pública onde a aplicação está hospedada | Sim (produção) |
| `PORT` | Porta de escuta do servidor (padrão `3000`) | Opcional |

---

## 4. Como Rodar o ETL com Dados Oficiais do TSE

A esteira ETL (`server/etl.ts`) foi desenvolvida para ingerir os arquivos oficiais `consulta_cand_ANO_UF.csv` disponibilizados no Portal de Dados Abertos do TSE.

### Regras de Negócio e Segurança do ETL:
1. **Encoding & Delimitador**: Processamento de arquivos codificados em Latin-1 (ISO-8859-1) ou UTF-8, separados por ponto-e-vírgula (`;`).
2. **Higienização de PII (LGPD)**: Todos os campos de CPF, Título de Eleitor e dados sensíveis do candidato são **descartados na leitura** e nunca persistem no banco.
3. **Resolução de Chapa Majoritária**: Cruza candidatos titulares e vices/suplentes via `SQ_COLIGACAO`, vinculando automaticamente a chapa para exibição na urna.
4. **Armazenamento de Fotos**: Gera paths canônicos imutáveis `/fotos/:ano/:uf/:numero.webp` servidos com cache de 1 ano.

### Execução via Painel Administrativo:
1. Acesse o menu **Admin** (com a conta `aplicativoeduca@gmail.com`).
2. Abra a aba **Upload TSE (ETL)**.
3. Selecione a UF desejada e cole o conteúdo do CSV ou faça upload do arquivo.
4. Clique em **Executar Parse e Carga**. O sistema registrará os registros inseridos, rejeitados e o status no log de auditoria `etl_logs`.

---

## 5. Como Fazer Deploy

### Opção A: Cloud Run (Container Full-Stack)
A aplicação está configurada com build nativo de contêiner:
```bash
# Build e deploy no Cloud Run
gcloud builds submit --tag gcr.io/SEU_PROJETO/plataforma-eu-voto
gcloud run deploy plataforma-eu-voto \
  --image gcr.io/SEU_PROJETO/plataforma-eu-voto \
  --platform managed \
  --port 3000 \
  --set-env-vars GEMINI_API_KEY="SUA_CHAVE"
```

### Opção B: Firebase (Hosting + Cloud Functions)
```bash
# 1. Instalar Firebase CLI
npm install -g firebase-tools

# 2. Login e deploy de regras e funções
firebase login
firebase deploy --only firestore:rules,storage:rules,functions,hosting
```

---

## 6. Roteiro de Testes Obrigatórios (T1 a T7)

A plataforma conta com uma suíte de testes automatizados integrada no painel de administração e verificável via chamadas HTTP REST:

| Teste | Descrição | Chamada de Verificação | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **T1** | Candidato Presidencial Nacional | `GET /api/v1/candidatos?uf=BR&cargo=1&numero=13` | Retorna `200 OK`, `nomeUrna: "LULA"`, partido `PT`, vice `GERALDO ALCKMIN` e `fotoUrl` WebP. |
| **T2** | Candidato Presidencial Oposição | `GET /api/v1/candidatos?uf=BR&cargo=1&numero=22` | Retorna `200 OK`, `nomeUrna: "FLAVIO BOLSONARO"`, partido `PL`, vice `ALFREDO GASPAR`. |
| **T3** | Deputado Estadual PA | `GET /api/v1/candidatos?uf=PA&cargo=7&numero=12345` | Retorna `200 OK`, `nomeUrna: "RODRIGO CUNHA"`, `cargoCd: 7`. |
| **T4** | Senador PA com Suplentes | `GET /api/v1/candidatos?uf=PA&cargo=5&numero=151` | Retorna `200 OK`, `nomeUrna: "HELDER"`, com 1º Suplente `JADER BARBALHO`. |
| **T5** | Consulta Número Inexistente | `GET /api/v1/candidatos?uf=BR&cargo=1&numero=9999` | Retorna `404 Not Found`, acionando aviso sonoro e voto nulo na urna. |
| **T6** | Bloqueio de Voto Duplo | `POST /api/v1/votos` com o mesmo `pesquisaId` e `uid` | Segunda tentativa rejeitada com `409 Conflict` (`VOTE_ALREADY_EXISTS`). |
| **T7** | Push ao Publicar Pesquisa | `PATCH /api/v1/pesquisas/:id` definindo `status="publicada"` | Dispara notificação push FCM automática para os tópicos das UFs participantes. |

### Exemplo de execução rápida dos testes via terminal:
```bash
# Executar teste T1
curl -s "http://localhost:3000/api/v1/candidatos?uf=BR&cargo=1&numero=13"

# Executar teste T5
curl -s -i "http://localhost:3000/api/v1/candidatos?uf=BR&cargo=1&numero=9999"
```

---

## 7. Segurança e LGPD

- **Sigilo do Voto**: O voto computado não possui associação reversível com dados pessoais de contato.
- **Prevenção de Fraude**: O ID de chave primária `{pesquisaId}_{uid}` no banco assegura idempotência e bloqueia matematicamente a duplicidade de votação.
- **Anonimização de CPF**: O número de CPF nunca é armazenado em texto claro; apenas o hash criptográfico SHA-256 com sal é persistido.
- **Amostragem Demográfica**: Acesso a gráficos de sexo, faixa etária e distribuição por município é estritamente restrito a usuários com perfil de administrador (`admin:true`).
