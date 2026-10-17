# 💰 Money Flow — Magagnini Edition

> **Hub de Gestão e Inteligência Financeira Pessoal**  
> Interface web analítica moderna em React 19 + TypeScript, integrada a bot do Telegram com inteligência artificial (Whisper + GPT) e backend em Spring Boot com PostgreSQL.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4_/_4.0-6DB33F?logo=spring-boot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)

---

## 🌟 Destaques do Projeto

- **⚡ Pronto para Vercel (1-Click Deploy)**: Configurado com `vercel.json` e fallback de rotas SPA.
- **✨ Modo Demonstração Interativo**: Permite testar o painel completo diretamente na Vercel (com persistência local em `localStorage`), mesmo antes de subir o backend Java!
- **📊 Dashboard Analítico Completo**:
  - Saldo acumulado por moeda (**BRL**, **EUR**, **USD** sem conversão arbitrária).
  - Histórico de saldo com gráficos interativos em Recharts.
  - Divisão de despesas por categoria com Donut Chart e ranking percentual.
  - Comparativo mensal de entradas vs saídas.
  - Lançamento e edição rápida de transações diretamente na interface web.
- **📑 Relatórios & Inteligência**:
  - Cálculo automático de Taxa de Poupança (Savings Rate).
  - Exportação instantânea para relatórios **CSV** e **JSON**.
  - Impressão otimizada para fechamento mensal.
- **🤖 Bot de Telegram com Inteligência Artificial**:
  - Transcrição de áudios via **OpenAI Whisper**.
  - Extração inteligente de transações com **GPT** a partir de linguagem natural ("*gastei 35 reais no almoço com Nubank*").
  - Onboarding guiado e link seguro por convite de 15 minutos.

---

## 🏗️ Arquitetura do Sistema

```
                      ┌────────────────────────────┐
                      │    Vercel / Cloud CDN      │
                      │  React 19 + TypeScript SPA │
                      │   Tailwind 4 + Recharts    │
                      └─────────────┬──────────────┘
                                    │
                                    │ HTTPS (REST API)
                                    ▼
                      ┌────────────────────────────┐
                      │    Spring Boot REST API    │
                      │ (Java 25, Security + JWT)  │
                      └──────┬──────────────┬──────┘
                             │              │
           ┌─────────────────▼───┐      ┌───▼───────────────┐
           │   PostgreSQL 17     │      │   OpenAI Cloud    │
           │  Flyway Migrations  │      │  Whisper + GPT-4o │
           └─────────────────────┘      └───────────────────┘
                                                  ▲
                                                  │ Webhook
                                        ┌─────────┴─────────┐
                                        │ Telegram Bot API  │
                                        └───────────────────┘
```

---

## 🚀 Como Fazer o Deploy no Vercel

O projeto foi totalmente adaptado para deploy imediato no **Vercel**:

### Opção 1: Importar Repositório no Dashboard do Vercel
1. Acesse [vercel.com/new](https://vercel.com/new) e conecte sua conta do GitHub.
2. Selecione o repositório `MONEYFLOW-COPIA`.
3. O Vercel detectará automaticamente as configurações de build a partir do `vercel.json` e `package.json` raiz:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm --prefix frontend run build`
   - **Output Directory**: `frontend/dist`
4. *(Opcional)* Em **Environment Variables**, adicione:
   ```env
   VITE_API_BASE_URL=https://sua-api.seu-servidor.com/api
   ```
   *(Se não definir uma URL de backend, você pode clicar em **"Testar no Modo Demonstração"** para navegar interativamente no sistema com todos os dados simulados!)*
5. Clique em **Deploy**! Em menos de 1 minuto seu dashboard estará online.

---

## 💻 Executando Localmente

### 1. Clonando o Repositório
```bash
git clone https://github.com/magagnini/MONEYFLOW-COPIA.git
cd MONEYFLOW-COPIA
```

### 2. Frontend (React 19 + Vite + Tailwind v4)
```bash
cd frontend
npm install
npm run dev
```
Acesse `http://localhost:5173` no seu navegador.

### 3. Backend Completo via Docker Compose
Caso queira subir o banco de dados PostgreSQL e o backend Spring Boot com um único comando:

1. Configure as variáveis de ambiente necessárias (OpenAI API Key, Telegram Bot Token):
```bash
cp .env.example .env
```
2. Execute:
```bash
docker compose up -d
```
O PostgreSQL iniciará na porta `5432` e o Spring Boot na porta `8080`.

---

## 📂 Estrutura de Pastas

```
MONEYFLOW-COPIA/
├── frontend/                     # Interface do usuário (React 19 + Vite + Tailwind v4)
│   ├── src/
│   │   ├── components/           # Componentes modulares (Charts, Dialogs, Sidebar, KPIs)
│   │   ├── contexts/             # Contexto de moeda e estado global
│   │   ├── hooks/                # Hooks personalizados de autenticação, contas e relatórios
│   │   ├── lib/                  # Camada de API, utilitários monetários e mockStore
│   │   └── pages/                # Telas: Dashboard, Contas, Relatórios, Configurações, Login
│   ├── vercel.json               # Configuração local para Vercel
│   └── package.json
├── backend/                      # API Spring Boot (Java 25 + Maven)
│   ├── src/main/java/            # Controllers, Services, Repositories, Security e Bot
│   ├── src/main/resources/       # Migrações Flyway SQL e application.properties
│   └── pom.xml
├── docs/                         # Capturas de tela e diagramas explicativos
├── docker-compose.yml            # Orquestração de containers para produção/local
├── vercel.json                   # Configuração de build e rotas na raiz para o Vercel
├── package.json                  # Scripts globais de orquestração
└── README.md
```

---

## 🛡️ Segurança e Modelo de Dados

- **Isolamento de Contas e Moedas**: Cada conta financeira opera na sua moeda nativa (`BRL`, `EUR`, `USD`), prevenindo distorções causadas por flutuação cambial em despesas correntes.
- **Precisão Financeira**: Todos os cálculos numéricos utilizam `NUMERIC` no banco e `BigDecimal` no backend, evitando erros de ponto flutuante.
- **Autenticação Segura**: JWT com expiração, senhas criptografadas com BCrypt e tokens com escopo individualizado por usuário.

---

## 📄 Licença

Distribuído sob a licença **MIT**. Veja `LICENSE` para mais informações.
