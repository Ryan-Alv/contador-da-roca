# RBAC — Como aplicar e configurar

## O que mudou

- **`prisma/schema.prisma`**: novo `enum Role { ADMIN USER }`; o model `usuarios`
  ganhou `role` (padrão `USER`) e `produtor_id` (opcional, único) ligando um
  login a um produtor específico. O model `produtores` ganhou a relação
  reversa `usuarios`.
- **`lib/auth.ts`**: configuração central do NextAuth (Credentials + Google).
  O login por e-mail/senha agora passa pelo NextAuth (antes era uma rota
  `/api/login` própria que gerava um JWT salvo no `localStorage` — isso foi
  removido porque não dava para proteger rotas no servidor/middleware com um
  token só no `localStorage`).
- **`middleware.ts`**: protege `/` (só ADMIN) e `/produtor/:path*` (ADMIN vê
  tudo; USER só acessa o próprio `produtorId`). `/produtor/novo` é só ADMIN.
- **`lib/api-guard.ts`** + as 4 rotas de API em `app/api/produtor/[produtorId]/ativos-biologicos/*`
  e `.../imobilizado/*`: agora exigem sessão válida e checam `role`/`produtorId`
  antes de qualquer leitura/escrita. Antes dessa correção, essas rotas não
  tinham nenhuma checagem de autenticação — qualquer pessoa que soubesse a URL
  conseguia ler ou alterar dados de qualquer produtor direto pela API, mesmo
  com o middleware bloqueando a navegação pela tela.
- **`app/pendente/page.tsx`**: página para usuários autenticados mas sem
  `produtorId` vinculado (cadastro público em `/registro` ainda não linkado
  pelo admin, ou primeiro login via Google). Antes, o middleware mandava essas
  pessoas de volta para `/login`, o que era confuso — elas estavam logadas,
  só não tinham painel para ver. Agora caem numa tela explicando a situação,
  com botão de Sair.
- Cada página de produtor (`page.tsx`, `ativos-biologicos/page.tsx`,
  `imobilizado/page.tsx`, `produtor/novo/page.tsx`) e a home (`app/page.tsx`)
  também checam a sessão no servidor como segunda camada de proteção, além
  do middleware.
- Botão **Sair** (`components/LogoutButton.tsx`) adicionado no cabeçalho do
  painel do admin e no rodapé da barra lateral do produtor.
- No modal de "Editar Produtor" (painel admin), há uma seção **Acesso ao
  Sistema** para criar/atualizar o e-mail e senha de login daquele produtor
  (isso preenche `usuarios.produtor_id`). Essa ação agora também reconhece
  quando o e-mail informado já pertence a uma conta existente (por exemplo,
  alguém que se cadastrou sozinho em `/registro`) e vincula essa conta ao
  produtor em vez de tentar criar uma duplicata e falhar por e-mail repetido.

## Anti-duplicidade de CPF/CNPJ, telefone e e-mail dos produtores

- **`lib/formatadores.ts`**: normaliza (`apenasDigitos`, `normalizarEmail`) antes
  de salvar/comparar, e formata (`formatarCpfCnpj`, `formatarTelefone`) só na
  hora de exibir. Assim "123.456.789-09" e "12345678909" são tratados como o
  mesmo valor, e o CPF/CNPJ sempre fica salvo no banco só com dígitos.
- **`prisma/schema.prisma`**: `cpf_cnpj`, `telefone` e `email` agora são
  `@unique` no model `produtores`.
- **Cadastro e edição de produtor** (`app/produtor/novo/page.tsx`,
  `app/page.tsx`): antes de gravar, checam se já existe outro produtor com o
  mesmo CPF/CNPJ, telefone ou e-mail normalizado, e mostram um aviso na tela
  em vez de deixar o Prisma estourar um erro feio.
- **`scripts/normalizar-produtores.js`**: script de limpeza única para os
  dados que já existiam antes dessa mudança — normaliza os valores e avisa
  se encontrar uma duplicata **real** (não só diferença de formatação) que
  precise ser corrigida manualmente antes de travar a constraint no banco.

⚠️ **Importante**: como já existem produtores com CPF/CNPJ duplicado no seu
banco atual (visto em tela), rode o script de normalização **antes** do
próximo `npx prisma db push`, senão o `db push` vai recusar aplicar a
constraint:

```bash
npm run normalizar-produtores
```

Se ele apontar uma duplicata real, corrija um dos dois registros pela tela
de edição do admin e rode o comando de novo até ele terminar sem erro.
Só depois disso rode `npx prisma db push`.

## Passo a passo

1. **Gerar e aplicar a migração** (com o banco configurado no `.env`):
   ```bash
   npx prisma migrate dev --name add_rbac_role
   ```
   Isso cria a coluna `role`, a coluna `produtor_id` e a constraint única em
   `usuarios`, além do enum `Role` no MySQL.

2. **Criar o primeiro usuário ADMIN** (não existe tela para isso de propósito
   — é uma operação sensível):
   ```bash
   npm run criar-admin -- "Seu Nome" admin@seudominio.com senhaSegura123
   ```
   Rodar de novo com o mesmo e-mail atualiza a senha e garante `role: ADMIN`.

3. **Login**: o admin loga normalmente em `/login` com esse e-mail/senha e
   cai no painel geral (`/`). Produtores comuns só conseguem logar depois que
   o admin criar o acesso deles na tela de edição do produtor.

4. **Vincular um produtor a um login**: no painel admin, clique em editar
   (ícone de lápis) em um produtor → seção "Acesso ao Sistema" → informe
   e-mail e senha → Criar Acesso. A partir daí esse e-mail/senha loga
   direto no painel daquele produtor (`/produtor/[id]`).

## Observações importantes

- O cadastro público (`/registro`) continua criando um usuário com
  `role: USER` mas **sem** `produtor_id` — ele não vai conseguir entrar em
  nenhum painel até um admin vincular esse login a um produtor (via passo 4)
  ou até você decidir mudar esse fluxo.
- Login via Google também recebe `role: USER` por padrão (sem produtor
  vinculado). Se quiser que um admin entre via Google, rode o script
  `criar-admin` com o mesmo e-mail da conta Google usada.
- Se o admin mudar a `role` ou o `produtor_id` de alguém que já está logado,
  a mudança só é refletida no próximo login (a sessão fica guardada dentro
  do JWT do cookie).
