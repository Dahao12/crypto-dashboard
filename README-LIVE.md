# 🚀 ShideMarketAnalyzer - Real-Time Dashboard

## ✨ Funcionalidades Ativas

### ⚡ Real-Time Data
- ✅ **WebSocket connection** para dados em tempo real
- ✅ **CoinGecko API** (atualização automática a cada 30s)
- ✅ **Fear & Greed Index** (atualização automática a cada 60s)
- ✅ **Live ticker** com preços BTC, ETH, SOL
- ✅ **Connection status** (verde quando conectado, vermelho quando desconectado)
- ✅ **Auto-reconnect** quando conexão cai

### 🤖 Chat AI Funcional
- ✅ **WebSocket chat** com Shide AI
- ✅ **Análises reais** de BTC, ETH, SOL
- ✅ **Setup detection** (entrada/stop/target)
- ✅ **Probabilidades** estimadas
- ✅ **Quick actions** (botões de comandos rápidos)
- ✅ **Histórico de chat** persistido
- ✅ **Suporte a múltiplos clientes** (vários ao mesmo tempo)

### 📊 Dashboard Interativo
- ✅ **Asset list** com métricas detalhadas
- ✅ **Seleção de ativos** (clique para trocar)
- ✅ **Live signals** (Fear & Greed, Market Tide)
- ✅ **Color coding** dinâmico (verde/vermelho)
- ✅ **Responsive design** (desktop e mobile)

---

## 🚀 Como Executar

### Pré-requisitos
```bash
Node.js >= 14.0.0
npm ou yarn
```

### Instalação
```bash
# 1. Entre na pasta
cd /Users/clowd/.openclaw/workspace/crypto-dashboard

# 2. Instale dependências
npm install

# 3. Inicie o servidor
npm start
```

### Acesso
```bash
# Local
http://localhost:3000

# Via ngrok (externally)
ngrok http 3000

# Via GitHub Pages
https://dahao12.github.io/crypto-dashboard/index-live.html
```

---

## 💾 Arquivos Importantes

### server.js**
Backend WebSocket com:
- Express API
- WebSocket Server
- CoinGecko API integration
- Chat message handling
- Real-time broadcast

### index-live.html**
Frontend com:
- WebSocket client
- Real-time crypto data
- Functional AI chat
- Interactive asset list

### package.json
Dependências:
- express (backend API)
- ws (WebSocket)
- cors (cross-origin)

---

## 🤖 Shide AI - Comandos Disponíveis

### Análise de Ativos
```
"Análise BTC"          -> Análise completa Bitcoin
"Análise ETH"          -> Análise completa Ethereum
"Análise SOL"          -> Análise completa Solana
```

### Setups Trading
```
"Setup"                -> Setup de alta probabilidade
"Setup de entrada"     -> Identifica zonas de compra
"Oportunidades"        -> Lista oportunidades ativas
```

### Mercado
```
"Sentimento"           -> Análise de sentimento
"Análise de mercado"   => Overview geral
"Fear & Greed"         -> Índice explicado
```

### Perguntas Livres
```
Qual é o preço do BTC?
Devo comprar agora?
O mercado está em tendência?
```

---

## 📊 Estrutura de Resposta do Shide

### Exemplo Resposta BTC
```
⚡ Bitcoin (BTC) Analysis

📊 Preço: $70,566 (+12.20%)

📈 Tendência: Alta forte

💎 Setup Entrada:
• Compra: $68,500
• Stop: $64,500
• Alvo: $74,000
• R:R: 1:1.5
• Probabilidade: 68%

⚠️ Risco: MODERADO

✅ Ação: Aguardar pullback em zona de compra
```

---

## 🔧 Configuração

### Alterar Intervalo de Atualização
```javascript
// No server.js

// Atualiza crypto a cada 30 segundos
setInterval(fetchCryptoData, 30000);

// Atualiza Fear & Greed a cada 60 segundos
setInterval(fetchFearGreed, 60000);
```

### Mudar Porta
```bash
# Via variável de ambiente
PORT=8080 npm start

# Ou no servidor node
const PORT = process.env.PORT || 3000;
```

### Adicionar Novos Ativos
```javascript
// No server.js - fetchCryptoData()
// Adicione ao endpoint da API CoinGecko:
ids=bitcoin,ethereum,solana,cardano,polkadot

// No frontend - index-live.html
// Adicione novos asset-item e IDs correspondentes
```

---

## 🌐 Deploy Opções

### Local/Desenvolvimento
```bash
npm start
# http://localhost:3000
```

### Ngrok (Acesso Externo Rápido)
```bash
# Terminal 1
npm start

# Terminal 2
ngrok http 3000

# URL gerada: https://random.ngrok-free.app
```

### GitHub Pages (Estático Sem WebSocket)
```bash
# Apenas frontend (sem chat, dados não atualizam em tempo real)
https://dahao12.github.io/crypto-dashboard/index-live.html
```

### VPS/Nuvem (Produção com WebSocket)
```bash
# No VPS
git clone repositorio
cd crypto-dashboard
npm install
npm start

# Use nginx como proxy
# Configure SSL (WebSocket pede HTTPS em produção)
```

---

## 📱 WebSocket Protocol

### Client → Server
```json
{
  "type": "chat_message",
  "text": "Análise BTC"
}
```

### Server → Client (Crypto Update)
```json
{
  "type": "crypto_update",
  "data": {
    "btc": { "price": 70566, "change": 12.2, ... },
    "eth": { "price": 3421, "change": 8.1, ... },
    "sol": { "price": 142, "change": -3.2, ... },
    "fearGreed": { "value": 12, "classification": "Extreme Fear" }
  }
}
```

### Server → Client (Chat Message)
```json
{
  "type": "chat_message",
  "data": {
    "sender": "ai",
    "text": "⚡ Bitcoin Analysis...",
    "timestamp": "2026-02-07T00:14:00Z"
  }
}
```

---

## 🔍 Troubleshooting

### WebSocket não conecta
- Verifique se o servidor está rodando (npm start)
- Verifique se não há firewall bloqueando a porta 3000
- Abra o DevTools e veja Console para mensagens de erro

### Dados não atualizam
- Verifique a conexão CoinGecko (API pode ter rate limit)
- Verifique logs do servidor (logs no terminal)
- Pode ser problema de internet

### Chat não funciona
- Use localhost ou https (ws:// funciona apenas em http)
- Em produção, precisa de wss:// (WebSocket Secure)
- Verifique se o WebSocket está conectado (status verde)

---

## 🚀 Próximos Passos

### Short-term
- [ ] Configurar WebSocket Secure (wss://) para produção
- [ ] Adicionar trading charts reais (TradingView API)
- [ ] Implementar mais indicadores técnicos

### Medium-term
- [ ] Integrar OpenAI API para respostas mais avançadas
- [ ] Adicionar backtesting
- [ ] Mobile app (React Native)

### Long-term
- [ ] Machine learning para predições
- [ ] Trading bot integration
- [ ] Institutional features

---

## 📊 Exemplo de Uso

### 1. Iniciar Servidor
```bash
cd /Users/clowd/.openclaw/workspace/crypto-dashboard
npm install
npm start
```

### 2. Acessar Dashboard
```bash
# Navegador
http://localhost:3000
```

### 3. Usar Chat
```
Você: Análise completa BTC
Shide: ⚡ Bitcoin (BTC) Analysis...

Você: Setup de alta probabilidade
Shide: ⚡ Setup Identificado...

Você: Devo comprar agora?
Shide: ⚡ Recomendação: Aguardar pullback...
```

---

## 🎯 Features em Real-Time

✅ **BTC Price**: $70,566 (updating every 30s)
✅ **ETH Price**: $3,421 (updating every 30s)
✅ **SOL Price**: $142 (updating every 30s)
✅ **Fear & Greed**: 12 Extreme Fear (updating every 60s)
✅ **Chat**: Instant responses via WebSocket
✅ **Connection Status**: Green = Live

---

**Pronto para usar!** 🚀

Execute `npm start` e acesse `http://localhost:3000`