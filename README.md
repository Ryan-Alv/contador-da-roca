# Agrocont — Sistema de Gestão Rural

Um sistema simples para controle de produtores rurais e suas propriedades, com cadastro, edição e recursos básicos de apoio contábil/fiscal. Este repositório contém a aplicação Next.js + Prisma usada durante o desenvolvimento.

Resumo rápido
- Framework: Next.js 16 (App Router)
- ORM: Prisma (MySQL)
- UI: Tailwind CSS + componentes simples
- Auth/email: next-auth / resend (dependências presentes)
- Linguagem: TypeScript / React

Índice
- [Funcionalidades](#funcionalidades)
- [Requisitos](#requisitos)
- [Instalação e execução local](#instalação-e-execução-local)
- [Configurar banco de dados (Prisma)](#configurar-banco-de-dados-prisma)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Adicionar novos tipos (enum) — exemplo: Tipo de Produção](#adicionar-novos-tipos-enum---exemplo-tipo-de-produção)
- [Boas práticas de commits / EOL (line endings)](#boas-práticas-de-commits--eol-line-endings)
- [Segurança — segredos e `.env`](#segurança----segredos-e-env)
- [Troubleshooting / Erros comuns](#troubleshooting--erros-comuns)
- [Contribuindo](#contribuindo)
- [Deploy](#deploy)
- [Licença](#licença)

---

## Funcionalidades
- CRUD de Produtores e Propriedades
- Formulários com validação básica no frontend
- Modelagem com Prisma (modelos: `produtores`, `propriedades`, `usuarios`, etc.)
- Painel administrativo básico (layout e navegação)
- Ações server-side (server actions) em formulários Next.js (app router)

---

## Requisitos
- Node.js >= 18 (recomendado)
- npm (compatível), ou yarn/pnpm
- MySQL local ou remoto (acesso a DATABASE_URL)
- Git

---

## Instalação e execução local

1. Clone o repositório:
   git clone https://github.com/Ryan-Alv/contador-da-roca.git
   cd contador-da-roca

2. Instale dependências:
   npm install

3. Prepare variáveis de ambiente: copie um arquivo de exemplo `.env.example` (abaixo há um modelo) para `.env` e preencha:

4. Inicialize o banco (Prisma) e rode a aplicação:
   - Gerar client Prisma (após configurar schema e .env):
     npx prisma generate
   - Aplicar migrations (recomendado):
     npx prisma migrate dev --name init
   - Iniciar dev server:
     npm run dev
   - Acesse: http://localhost:3000

Scripts úteis (package.json):
- npm run dev — rodar em dev
- npm run build — build de produção
- npm run start — iniciar build em produção
- npm run lint — rodar eslint

---

## Variáveis de ambiente

Crie um arquivo `.env` com as seguintes variáveis (exemplo, NÃO cole chaves reais aqui — use placeholders):

.env.example