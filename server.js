const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Store connected clients
const clients = new Set();

// Crypto data storage
let cryptoData = {
    btc: null,
    eth: null,
    sol: null,
    fearGreed: null,
    lastUpdate: null
};

// Chat messages storage
const chatMessages = [];

// Fetch crypto data from API
async function fetchCryptoData() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true');
        const data = await response.json();

        cryptoData.btc = {
            price: data.bitcoin.usd,
            change: data.bitcoin.usd_24h_change,
            mcap: data.bitcoin.usd_market_cap,
            volume: data.bitcoin.usd_24h_vol
        };

        cryptoData.eth = {
            price: data.ethereum.usd,
            change: data.ethereum.usd_24h_change,
            mcap: data.ethereum.usd_market_cap,
            volume: data.ethereum.usd_24h_vol
        };

        cryptoData.sol = {
            price: data.solana.usd,
            change: data.solana.usd_24h_change,
            mcap: data.solana.usd_market_cap,
            volume: data.solana.usd_24h_vol
        };

        cryptoData.lastUpdate = new Date().toISOString();

        console.log('✅ Crypto data fetched:', new Date().toISOString());
        broadcastCryptoData();
    } catch (error) {
        console.error('❌ Error fetching crypto data:', error);
    }
}

// Fetch Fear & Greed
async function fetchFearGreed() {
    try {
        const response = await fetch('https://api.alternative.me/fng/');
        const data = await response.json();

        cryptoData.fearGreed = {
            value: parseInt(data.data[0].value),
            classification: data.data[0].value_classification
        };

        console.log('✅ Fear & Greed fetched:', cryptoData.fearGreed);
        broadcastCryptoData();
    } catch (error) {
        console.error('❌ Error fetching Fear & Greed:', error);
    }
}

// Generate AI response (Shide simulation)
async function generateAIResponse(message) {
    const lowerMsg = message.toLowerCase();
    let response = '';

    // BTC Analysis
    if (lowerMsg.includes('btc') || lowerMsg.includes('bitcoin')) {
        if (cryptoData.btc) {
            const btc = cryptoData.btc;
            response = `⚡ **Bitcoin (BTC)** Analysis\n\n`;
            response += `📊 Preço: $${btc.price.toLocaleString()} (${btc.change >= 0 ? '+' : ''}${btc.change.toFixed(2)}%)\n\n`;
            response += `📈 Tendência: ${btc.change >= 5 ? 'Alta forte' : btc.change >= 0 ? 'Recuperação' : 'Correção'}\n\n`;
            response += `💎 Setup Entrada:\n`;
            response += `• ZonaCompra: $${(btc.price * 0.97).toLocaleString()} - $${(btc.price * 0.98).toLocaleString()}\n`;
            response += `• Alvo: $${(btc.price * 1.05).toLocaleString()}\n`;
            response += `• Stop: $${(btc.price * 0.92).toLocaleString()}\n\n`;
            response += `📊 Probabilidades:\n`;
            response += `• Continuação: 65%\n`;
            response += `• Reversão: 35%\n\n`;
            response += `⚠️ Risco: ${Math.abs(btc.change) > 5 ? 'ALTO' : 'MODERADO'}`;
        } else {
            response = '📊 Carregando dados BTC...';
        }
    }
    // ETH Analysis
    else if (lowerMsg.includes('eth') || lowerMsg.includes('ethereum')) {
        if (cryptoData.eth) {
            const eth = cryptoData.eth;
            response = `⚡ **Ethereum (ETH)** Analysis\n\n`;
            response += `📊 Preço: $${eth.price.toLocaleString()} (${eth.change >= 0 ? '+' : ''}${eth.change.toFixed(2)}%)\n\n`;
            response += `📈 Tendência: Seguindo BTC momentum\n\n`;
            response += `💎 Correlação:\n`;
            response += `• Com BTC: Positiva (0.85)\n`;
            response += `• Market Cap: $${(eth.mcap / 1e9).toFixed(2)}B\n\n`;
            response += `🔥 Próximos Níveis:\n`;
            response += `• Resistência: $${(eth.price * 1.03).toLocaleString()}\n`;
            response += `• Suporte: $${(eth.price * 0.97).toLocaleString()}`;
        } else {
            response = '📊 Carregando dados ETH...';
        }
    }
    // SOL Analysis
    else if (lowerMsg.includes('sol') || lowerMsg.includes('solana')) {
        if (cryptoData.sol) {
            const sol = cryptoData.sol;
            response = `⚡ **Solana (SOL)** Analysis\n\n`;
            response += `📊 Preço: $${sol.price.toLocaleString()} (${sol.change >= 0 ? '+' : ''}${sol.change.toFixed(2)}%)\n\n`;
            response += `⚠️ Beta Extremo: Alta volatilidade\n\n`;
            response += `💎 Setup:\n`;
            response += `• Caution: Volatilidade elevada\n`;
            response += `• Apenas se BTC confirmar uptrend\n`;
            response += `• Stop Tight: 2-3%\n\n`;
            response += `🔥 Risco: ALTO`;
        } else {
            response = '📊 Carregando dados SOL...';
        }
    }
    // General market analysis
    else if (lowerMsg.includes('análise') || lowerMsg.includes('analise') || lowerMsg.includes('mercad')) {
        if (cryptoData.btc && cryptoData.fearGreed) {
            response = `⚡ **Market Analysis**\n\n`;
            response += `📊 BTC Dominance: ${((cryptoData.btc.mcap / (cryptoData.btc.mcap + cryptoData.eth.mcap + cryptoData.sol.mcap)) * 100).toFixed(1)}%\n\n`;
            response += `🎭 Sentimento: ${cryptoData.fearGreed.value} (${cryptoData.fearGreed.classification})\n\n`;
            response += `🌊 Fase de Mercado: ${cryptoData.btc.change > 0 ? 'Recuperação' : 'Correção'}\n\n`;
            response += `💡 Oportunidades:\n`;
            response += `• BTC: Pullback para compra\n`;
            response += `• ETH: Seguir BTC\n`;
            response += `• SOL: Aguardar confirmação\n\n`;
            response += `⚠️ Alertas:\n`;
            response += `• Fear & Greed extremo = Oportunidade`;
        } else {
            response = '📊 Carregando dados de mercado...';
        }
    }
    // Setup request
    else if (lowerMsg.includes('setup') || lowerMsg.includes('entrada') || lowerMsg.includes('comprar')) {
        if (cryptoData.btc) {
            response = `⚡ **Setup de Alta Probabilidade**\n\n`;
            response += `📊 BTC Setup Identificado:\n\n`;
            response += `💎 **LONG**\n`;
            response += `• Entry: $${(cryptoData.btc.price * 0.97).toLocaleString()}\n`;
            response += `• Stop: $${(cryptoData.btc.price * 0.92).toLocaleString()}\n`;
            response += `• Target 1: $${(cryptoData.btc.price * 1.05).toLocaleString()}\n`;
            response += `• Target 2: $${(cryptoData.btc.price * 1.08).toLocaleString()}\n\n`;
            response += `📊 **Métricas**\n`;
            response += `• Risco:Reward: 1:1.5\n`;
            response += `• Probabilidade: 65%\n`;
            response += `• Timeframe: 24-48h\n\n`;
            response += `✅ **Ação:** Aguardar pullback em zona de compra`;
        } else {
            response = '📊 Carregando dados...';
        }
    }
    // Default response
    else {
        response = `⚡ Shide AI Assistant\n\n`;
        response += `Posso帮你 com:\n\n`;
        response += `📊 **Análises:**\n`;
        response += `• "Análise BTC"\n`;
        response += `• "Análise ETH"\n`;
        response += `• "Análise SOL"\n`;
        response += `• "Setup de entrada"\n`;
        response += `• "Análise de mercado"\n\n`;
        response += `💡 **Quick Commands:**\n`;
        response += `• "Setup"\n`;
        response += `• "Sentimento"\n`;
        response += `• "Oportunidades"\n\n`;
        response += `📝 **Escolha um comando ou digite sua pergunta!**`;
    }

    return response;
}

// Broadcast crypto data to all clients
function broadcastCryptoData() {
    const message = JSON.stringify({
        type: 'crypto_update',
        data: cryptoData
    });

    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// Broadcast chat message
function broadcastChatMessage(message) {
    const chatMsg = JSON.stringify({
        type: 'chat_message',
        data: message
    });

    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(chatMsg);
        }
    });
}

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('✅ New client connected');

    clients.add(ws);

    // Send current crypto data immediately
    if (cryptoData.btc) {
        ws.send(JSON.stringify({
            type: 'crypto_update',
            data: cryptoData
        }));
    }

    // Send chat history
    if (chatMessages.length > 0) {
        ws.send(JSON.stringify({
            type: 'chat_history',
            data: chatMessages
        }));
    }

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === 'chat_message') {
                // Generate AI response
                const aiResponse = await generateAIResponse(data.text);

                // User message
                const userMsg = {
                    sender: 'user',
                    text: data.text,
                    timestamp: new Date().toISOString()
                };

                // AI response
                const aiMsg = {
                    sender: 'ai',
                    text: aiResponse,
                    timestamp: new Date().toISOString()
                };

                chatMessages.push(userMsg, aiMsg);

                // Keep only last 50 messages
                if (chatMessages.length > 50) {
                    chatMessages.splice(0, chatMessages.length - 50);
                }

                // Broadcast to all clients
                broadcastChatMessage(userMsg);
                broadcastChatMessage(aiMsg);
            }
        } catch (error) {
            console.error('❌ Error handling message:', error);
        }
    });

    ws.on('close', () => {
        console.log('❌ Client disconnected');
        clients.delete(ws);
    });

    ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
        clients.delete(ws);
    });
});

// API Routes
app.get('/api/crypto', (req, res) => {
    res.json(cryptoData);
});

app.get('/api/chat/history', (req, res) => {
    res.json(chatMessages);
});

// Start server
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║        🚀 ShideMarketAnalyzer Server - Started!          ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log(`║   Server: http://localhost:${PORT}                          ║`);
    console.log(`║   WebSocket: ws://localhost:${PORT}                         ║`);
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║   Features:                                                ║');
    console.log('║   • Real-time crypto data (CoinGecko API)                  ║');
    console.log('║   • Live WebSocket chat with Shide AI                       ║');
    console.log('║   • Fear & Greed index                                     ║');
    console.log('║   • Multi-client support                                   ║');
    console.log('║                                                              ║');
    console.log('║   Auto-refresh every 30 seconds                            ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');

    // Initial data fetch
    fetchCryptoData();
    fetchFearGreed();

    // Fetch data every 30 seconds
    setInterval(fetchCryptoData, 30000);
    setInterval(fetchFearGreed, 60000);
});