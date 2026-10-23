# Meu Caixa - PWA de Gestão Financeira

Um app de controle financeiro pessoal com:
- ✅ Login com Google (Firebase Auth)
- ✅ PWA instalável (funciona offline)
- ✅ 100% responsivo (mobile-first)
- ✅ Gráficos de despesas por categoria
- ✅ Categorias pré-definidas (Alimentação, Transporte, Parcela da Moto, Conta de Luz, Supermercado, Lazer, Salário, Renda Extra, Bico, Comissão)
- ✅ Tabela de transações com edição/exclusão
- ✅ Sincronização em tempo real (Firestore)
- ✅ Deploy gratuito no Vercel

---

## 🚀 Como rodar localmente

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar Firebase
O arquivo `src/services/firebase.ts` já está configurado com seu projeto. Se precisar alterar, edite o objeto `firebaseConfig`.

**Importante:** No console do Firebase:
- **Authentication** → **Sign-in method** → **Google** → **Ativar**
- **Firestore Database** → **Criar banco** → **Modo de teste** → Localização `southamerica-east1` (São Paulo)

### 3. Rodar em desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:3000`

### 4. Build para produção
```bash
npm run build
```
Os arquivos ficam na pasta `dist/`

### 5. Preview do build
```bash
npm run preview
```

---

## 📱 Instalar como PWA

### No celular (Chrome/Edge):
1. Abra o app no navegador
2. Toque no menu (⋮) → **"Instalar app"** ou **"Adicionar à tela inicial"**
3. O app abre como nativo, sem barra do navegador

### No desktop:
1. Chrome/Edge: Ícone de instalação na barra de endereços
2. Funciona offline após primeira carga

---

## 🔧 Deploy no Vercel (Gratuito)

### Opção 1: Via GitHub (Recomendado)
1. Faça push deste projeto para um repositório GitHub
2. Acesse [vercel.com](https://vercel.com) → **Add New Project**
3. Importe o repositório
4. **Framework Preset**: Vite
5. **Build Command**: `npm run build`
6. **Output Directory**: `dist`
7. **Deploy**

### Opção 2: Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

### Variáveis de ambiente (opcional)
No painel do Vercel → Settings → Environment Variables:
```
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc
```

---

## 📁 Estrutura do Projeto

```
meu-caixa-pwa/
├── public/
│   ├── favicon.svg
│   ├── manifest.webmanifest
│   ├── pwa-192x192.png      # Gerar a partir do SVG
│   └── pwa-512x512.png      # Gerar a partir do SVG
├── src/
│   ├── components/
│   │   ├── ui/              # Button, Input, Select, Modal
│   │   ├── LoginScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── TransactionForm.tsx
│   │   ├── TransactionList.tsx
│   │   ├── SummaryCards.tsx
│   │   ├── ExpenseChart.tsx
│   │   └── CategoryLegend.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useTransactions.ts
│   ├── services/
│   │   └── firebase.ts
│   ├── types/
│   │   └── index.ts
│   ├── styles/
│   │   └── index.css
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🎨 Personalização

### Cores (Tailwind)
Edite `vite.config.ts` → `manifest.theme_color` e `src/styles/index.css`

### Categorias
Edite `src/types/index.ts` → array `CATEGORIES`

### Regras do Firestore (Produção)
No console Firebase → Firestore → Regras:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /transactions/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

---

## 🛠️ Tecnologias

- **React 18** + **TypeScript** + **Vite**
- **Firebase Auth** (Google OAuth)
- **Firestore** (Database em tempo real)
- **Chart.js** + **react-chartjs-2** (Gráficos)
- **date-fns** (Datas)
- **lucide-react** (Ícones)
- **vite-plugin-pwa** (PWA + Service Worker)
- **Workbox** (Cache offline)

---

## 📄 Licença

MIT - Use livremente para projetos pessoais ou comerciais.