# 🛠️ Guia de Desenvolvimento Local

## 🚀 **Como Executar o Projeto**

### **Desenvolvimento (sem anúncios)**
```bash
npm run dev
# ou
yarn dev
```

### **Produção (com anúncios)**
```bash
npm run build
npm run start
```

## 📱 **O que você verá em cada ambiente:**

### **Desenvolvimento (`npm run dev`)**
- ✅ Site funciona normalmente
- 🚧 Placeholders no lugar dos anúncios
- 🔍 Console mostra: "AdSense script não carregado em desenvolvimento"
- ⚡ Hot reload ativo
- 🚫 Nenhuma chamada para o AdSense

### **Produção (`npm run build && npm run start`)**
- ✅ Site funciona normalmente  
- 📢 Anúncios reais do AdSense carregam
- 🔍 Console mostra: "Carregando script do AdSense..."
- 💰 Anúncios podem gerar receita
- ⚠️ Não clique nos próprios anúncios!

## 🎨 **Placeholders em Desenvolvimento**

Os placeholders mostram:
- 🚧 Texto "AdSense Placeholder"
- 📋 ID do slot configurado
- 📐 Formato do anúncio
- 🎯 Posição onde aparecerá o anúncio real

## 🔧 **Estrutura dos Componentes**

```
src/
├── components/
│   ├── AdSenseScript.tsx    # Carrega script do Google
│   ├── AdSenseAd.tsx        # Componente de anúncio
│   └── Script.tsx           # Algoritmo Needleman-Wunsch
├── app/
│   ├── layout.tsx           # Layout principal
│   ├── page.tsx             # Página principal (3 anúncios)
│   ├── privacy/page.tsx     # Política de privacidade
│   └── ...
```

## 📍 **Localização dos Anúncios**

### **Página Principal (`/`)**
1. **Banner Superior** - Linha ~58
2. **Retângulo Central** - Linha ~86  
3. **Banner Inferior** - Linha ~197

### **Outras Páginas**
- Atualmente sem anúncios
- Podem ser adicionados após aprovação

## 🧪 **Como Testar Anúncios**

### **Antes da Aprovação (agora)**
```bash
# Desenvolvimento - sem anúncios
npm run dev

# Abrir: http://localhost:3000
# Você verá placeholders cinzas
```

### **Após Aprovação AdSense**
```bash
# Teste local em modo produção
npm run build
npm run start

# Abrir: http://localhost:3000
# Você verá anúncios reais (não clique!)
```

### **Deploy na Vercel**
```bash
# Push para GitHub
git add .
git commit -m "AdSense configurado"
git push

# Vercel faz deploy automático
# Site em produção terá anúncios reais
```

## 🔍 **Debug e Monitoramento**

### **Console do Navegador**
- `F12` → Console
- Mensagens do AdSense aparecerão aqui
- Erros de carregamento também

### **Network Tab**
- `F12` → Network
- Filtrar por "adsbygoogle"
- Ver se scripts estão carregando

### **Verificar Ambiente**
```javascript
// No console do navegador:
console.log('Ambiente:', process.env.NODE_ENV)
console.log('Produção?', process.env.NODE_ENV === 'production')
```

## 🚨 **Problemas Comuns**

### **"Anúncios não aparecem em produção"**
- ✅ Verificar se está em modo produção
- ✅ Aguardar 5-10 minutos após deploy
- ✅ Testar navegação anônima
- ✅ Verificar console por erros

### **"Placeholders não aparecem em dev"**
- ✅ Verificar se está em modo desenvolvimento
- ✅ Limpar cache do navegador
- ✅ Verificar console por erros JavaScript

### **"Erro de CORS ou crossOrigin"**
- ✅ Já foi corrigido na implementação atual
- ✅ Script carrega diretamente via DOM API

## 📝 **Próximos Passos**

1. **✅ Desenvolvimento:** Site funciona com placeholders
2. **⏳ AdSense:** Candidatar no painel Google AdSense
3. **⏳ Aprovação:** Aguardar 1-14 dias
4. **🔄 Slots:** Criar anúncios e pegar IDs reais
5. **💰 Produção:** Site gera receita!

---

## 💡 **Dicas de Desenvolvimento**

- Use `npm run dev` para desenvolvimento diário
- Teste `npm run build && npm run start` antes de fazer deploy
- Mantenha o console aberto para ver mensagens do AdSense
- Não se preocupe com placeholders - é comportamento esperado!

**Happy coding! 🚀** 