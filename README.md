# Crypto Dashboard - Shide Agent

Dashboard em tempo real para monitoramento de criptomoedas com análise automática do agente Shide.

## 📁 Estrutura

```
crypto-dashboard/
├── index.html    # Página principal
├── style.css     # Estilização (tema dark)
└── script.js     # Lógica de atualização automática
└── data.json     # Dados persistentes (criado automaticamente)
└── README.md     # Este arquivo
```

## 🚀 Como Usar

### Inicialização Manual

1. **Abra o dashboard:**
   ```bash
   open /Users/clowd/.openclaw/workspace/crypto-dashboard/index.html
   ```

2. **Ou via navegador:**
   - Arraste `index.html` para o navegador
   - Acessa via file:// (não precisa de servidor)

### Atualização Automática

- **Auto-refresh:** 5 minutos (configurável em `script.js`)
- **API:** CoinGecko (grátis, sem autenticação)
- **Fear & Greed:** Alternative.me

## 📊 Monitoramento

### Ativos
- Bitcoin (BTC) - #1 por market cap
- Ethereum (ETH) - #2 por market cap
- Solana (SOL) - #5 por market cap

### Dados Exibidos
- Preço atual em USD
- Variação 24h (%)
- Máximo/Mínimo 24h
- Market Cap
- Volume de negociação
- Análise automática Shide

### Outros Indicadores
- Fear & Greed Index
- Alertas automáticos (movimentos >5%, >10%)
- Notas de mercado em tempo real
- Market Cap total dos ativos
- Volume total 24h

## 🤖 Integração com Agents

### Atualização por Agentes

**Shide Agent (Crypto Analyst):**

Quando Shide faz uma análise cripto, pode atualizar `data.json`:

```json
{
  "lastUpdate": "2026-02-06T23:30:00Z",
  "shideAnalysis": {
    "btc": "Recuperação agressiva de crash. Risco moderado em pullback US$ 68K.",
    "eth": "Seguindo BTC momentum. Correlação positiva.",
    "sol": "Alta volatilidade. Cautela recomendada."
  },
  "opportunities": [
    {
      "asset": "BTC",
      "type": "long",
      "entry": 68000,
      "target": 75000,
      "stop": 64000,
      "probability": 65
    }
  ],
  "alerts": [
    {
      "level": "high",
      "asset": "BTC",
      "message": "Movimento forte de +12.2% em 24h",
      "time": "2026-02-06T23:25:00Z"
    }
  ]
}
```

**Para atualizar de outro agent:**

1. **Ler dados atuais:**
   ```javascript
   import { read } from '@openclaw/core';
   const data = JSON.parse(read('crypto-dashboard/data.json'));
   ```

2. **Adicionar análise:**
   ```javascript
   data.shideAnalysis.btc = novaAnaliseBTC;
   ```

3. **Salvar:**
   ```javascript
   import { write } from '@openclaw/core';
   write('crypto-dashboard/data.json', JSON.stringify(data, null, 2));
   ```

## 🎨 Personalização

### Alterar Tema

Edite `style.css` - variáveis CSS no topo:

```css
:root {
    --background: #0d1117;  /* Fundo */
    --accent: #58a6ff;      /* Cor destacada */
    --success: #238636;     /* Verde */
    --danger: #da3633;      /* Vermelho */
}
```

### Alterar Refresh Auto

Edite `script.js`:

```javascript
// 5 minutos (padrão)
setInterval(updateDashboard, 5 * 60 * 1000);

// 1 minuto (rápido)
setInterval(updateDashboard, 1 * 60 * 1000);

// 30 segundos (muito rápido - pode bater limites da API)
setInterval(updateDashboard, 30 * 1000);
```

### Adicionar Novos Ativos

1. Adicionar card em `index.html` (copiar estrutura de BTC)
2. Adicionar endpoint em `script.js`:
   ```javascript
   const API_ENDPOINTS = {
       // ... existing
       ada: `${COINGECKO_API}/coins/cardano`,
       dot: `${COINGECKO_API}/coins/polkadot`
   };
   ```
3. Atualizar `fetchCryptoData()` and `updateDashboard()`

## 🌐 Hospedagem

### Local (via GitHub Pages)

1. Criar repositório `crypto-dashboard`
2. Fazer upload dos arquivos
3. Ativar GitHub Pages
4. Acessar: `https://usuario.github.io/crypto-dashboard`

### Hosting com WebSocket (tempo real)

Para atualizações em tempo real (não polling):

1. Usar WebSocket Server (Node.js)
2. Agents enviam updates via WebSocket
3. Frontend recebe updates instantaneamente
4. Necessita servidor backend

## 📱 Responsivo

- Desktop: Grid multi-coluna
- Tablet: 2 colunas
- Mobile: 1 coluna (stack vertical)

## ⚠️ Limitações

### API CoinGecko
- Rate limit: ~30 req/min (free tier)
- Dados com 60-90 segundos de delay
- Sem autenticação necessária (até limite)

### Navegador (file://)
- Apenas HTTP/HTTPS fetch direto
- CORS pode bloquear algumas APIs
- Para WebSocket: precisa de servidor local (ver acima)

## 🔧 Troubleshooting

### Dados não atualizam
- Cheque console do navegador (F12)
- Verifique se API CoinGecko está online
- Confirme taxa de refresh não muito alta

### Layout quebrado
- Limpe cache do navegador
- Verifique se `style.css` está na mesma pasta

### Erro de CORS
- Use navegador local (file://)
- Ou configure proxy local (veja seção "Streaming de dados" no README principal)

## 📈 Exemplos de Uso por Agents

### Agent Notifier
```javascript
// Verificar alertas críticos
function checkCriticalAlerts() {
    const data = readJSON('crypto-dashboard/data.json');
    const critical = data.alerts.filter(a => a.level === 'critical');
    if (critical.length > 0) {
        sendMessageToUser(`🚨 ALERTA CRÍTICO:\n${JSON.stringify(critical, null, 2)}`);
    }
}
```

### Agent Analysis Logger
```javascript
// Logar análises diárias
function logDailyAnalysis() {
    const data = readJSON('crypto-dashboard/data.json');
    const today = new Date().toISOString().split('T')[0];
    const logEntry = {
        date: today,
        btcPrice: data.btc.price,
        ethPrice: data.eth.price,
        shideAnalysis: data.shideAnalysis
    };
    appendToFile('crypto-dashboard/analysis-history.json', JSON.stringify(logEntry) + '\n');
}
```

## 🤝 Contribuindo

Para adicionar features:

1. Fazer fork do projeto
2. Criar feature branch
3. Testar localmente
4. Submit PR

---

**Maintainer:** Shide Agent
**Status:** ✅ Operacional
**Last Updated:** 2026-02-06
**License:** OpenClaw Internal