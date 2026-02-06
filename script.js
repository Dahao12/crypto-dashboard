// API Endpoints
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const API_ENDPOINTS = {
    btc: `${COINGECKO_API}/coins/bitcoin`,
    eth: `${COINGECKO_API}/coins/ethereum`,
    sol: `${COINGECKO_API}/coins/solana`,
    fearGreed: 'https://api.alternative.me/fng/'
};

// Local data file (updated by agents)
const DATA_FILE = 'data.json';

// Data storage
let cryptoData = {
    btc: null,
    eth: null,
    sol: null,
    fearGreed: null,
    alerts: [],
    notes: []
};

// Agent analysis data (from data.json)
let agentData = {
    shideAnalysis: {},
    opportunities: [],
    alerts: [],
    marketSentiment: {}
};

// Format utilities
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

function formatPercent(value) {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
}

function formatNumber(value) {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
}

function formatTime(date) {
    return date.toLocaleString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Fetch crypto data
async function fetchCryptoData(coinId, apiEndpoint) {
    try {
        const response = await fetch(apiEndpoint);
        const data = await response.json();
        return {
            id: coinId,
            price: data.market_data.current_price.usd,
            change24h: data.market_data.price_change_percentage_24h,
            high24h: data.market_data.high_24h.usd,
            low24h: data.market_data.low_24h.usd,
            marketCap: data.market_data.market_cap.usd,
            volume: data.market_data.total_volume.usd,
            rank: data.market_cap_rank
        };
    } catch (error) {
        console.error(`Error fetching ${coinId}:`, error);
        return null;
    }
}

// Fetch Fear & Greed Index
async function fetchFearGreed() {
    try {
        const response = await fetch(API_ENDPOINTS.fearGreed);
        const data = await response.json();
        return {
            value: parseInt(data.data[0].value),
            classification: data.data[0].value_classification
        };
    } catch (error) {
        console.error('Error fetching Fear & Greed:', error);
        return null;
    }
}

// Load agent data from data.json
async function loadAgentData() {
    try {
        const response = await fetch(DATA_FILE);
        const data = await response.json();
        agentData = data;
        console.log('Agent data loaded:', agentData);
    } catch (error) {
        console.error('Error loading agent data:', error);
        // Use default values if file doesn't exist
        agentData = {
            shideAnalysis: {},
            opportunities: [],
            alerts: [],
            marketSentiment: {}
        };
    }
}

// Update UI for Fear & Greed
function updateFearGreedUI(data) {
    const valueEl = document.getElementById('fearGreedValue');
    const sentimentEl = document.getElementById('fearGreedSentiment');

    if (data) {
        valueEl.textContent = data.value;
        sentimentEl.textContent = data.classification;

        // Set color based on value
        const sentimentClass = getSentimentClass(data.value);
        sentimentEl.className = `sentiment ${sentimentClass}`;

        cryptoData.fearGreed = data;
    }
}

function getSentimentClass(value) {
    if (value <= 25) return 'extreme-fear';
    if (value <= 45) return 'fear';
    if (value <= 55) return 'neutral';
    if (value <= 75) return 'greed';
    return 'extreme-greed';
}

// Update UI for asset
function updateAssetUI(coinId, data) {
    const priceEl = document.getElementById(`${coinId}-price`);
    const changeEl = document.getElementById(`${coinId}-change`);
    const highEl = document.getElementById(`${coinId}-high`);
    const lowEl = document.getElementById(`${coinId}-low`);
    const mcapEl = document.getElementById(`${coinId}-mcap`);
    const volumeEl = document.getElementById(`${coinId}-volume`);
    const analysisEl = document.getElementById(`${coinId}-analysis-text`);

    if (data) {
        priceEl.textContent = formatCurrency(data.price);

        const changeText = formatPercent(data.change24h);
        changeEl.textContent = changeText;
        changeEl.className = `price-change ${data.change24h >= 0 ? 'positive' : 'negative'}`;

        highEl.textContent = formatCurrency(data.high24h);
        lowEl.textContent = formatCurrency(data.low24h);
        mcapEl.textContent = formatNumber(data.marketCap);
        volumeEl.textContent = formatNumber(data.volume);

        // Use agent analysis if available, otherwise generate basic one
        const agentAnalysis = agentData.shideAnalysis[coinId];
        if (agentAnalysis) {
            analysisEl.textContent = `🤖 Shide: ${agentAnalysis}`;
        } else {
            analysisEl.textContent = generateBasicAnalysis(coinId, data);
        }

        cryptoData[coinId] = data;
    }
}

// Generate basic analysis text (fallback)
function generateBasicAnalysis(coinId, data) {
    const trend = data.change24h >= 0 ? '📈 ALTA' : '📉 BAIXA';
    const risk = Math.abs(data.change24h) > 5 ? 'ALTO' : 'MODERADO';

    const analyses = {
        btc: `${trend} | Recuperação de fundo US$${formatNumber(data.low24h)}. ` +
              `Volume forte em ${formatNumber(data.volume)}. ` +
              `Risco: ${risk}. ${data.change24h > 0 ? 'Compras em pullback sugeridas.' : 'Aguarde fundo confirmado.'}`,
        eth: `${trend} | Correlação com BTC ${data.change24h > 0 ? 'positiva' : 'negativa'}. ` +
              `Market Cap ${formatNumber(data.marketCap)}. ` +
              `Risco: ${risk}.`,
        sol: `${trend} | Beta alto. Volatilidade extrema. ` +
              `Última alta: ${formatCurrency(data.high24h)}. ` +
              `Risco: ${risk}. Cautela recomendada.`
    };

    return analyses[coinId] || 'Análise não disponível.';
}

// Update summary
function updateSummary() {
    const totalMcap = [cryptoData.btc, cryptoData.eth, cryptoData.sol]
        .filter(d => d)
        .reduce((sum, d) => sum + d.marketCap, 0);

    const totalVolume = [cryptoData.btc, cryptoData.eth, cryptoData.sol]
        .filter(d => d)
        .reduce((sum, d) => sum + d.volume, 0);

    const activeAssets = [cryptoData.btc, cryptoData.eth, cryptoData.sol].filter(d => d).length;

    document.getElementById('marketCapTotal').textContent = formatNumber(totalMcap);
    document.getElementById('volume24h').textContent = formatNumber(totalVolume);
    document.getElementById('activeAssets').textContent = activeAssets;
}

// Update alerts
function updateAlerts() {
    const alertsList = document.getElementById('alerts-list');
    const alerts = [];

    // First: Add agent alerts
    if (agentData.alerts && agentData.alerts.length > 0) {
        agentData.alerts.forEach(alert => {
            alerts.push({
                level: alert.level,
                coin: alert.asset,
                message: alert.message,
                time: new Date(alert.time)
            });
        });
    }

    // Then: Check for significant price moves
    ['btc', 'eth', 'sol'].forEach(coinId => {
        if (cryptoData[coinId]) {
            const data = cryptoData[coinId];
            const changeAbs = Math.abs(data.change24h);

            if (changeAbs > 10) {
                alerts.push({
                    level: 'critical',
                    coin: coinId.toUpperCase(),
                    message: `Movimento EXTREMO de ${formatPercent(data.change24h)}`,
                    time: new Date()
                });
            } else if (changeAbs > 5) {
                alerts.push({
                    level: 'high',
                    coin: coinId.toUpperCase(),
                    message: `Movimento forte de ${formatPercent(data.change24h)}`,
                    time: new Date()
                });
            }
        }
    });

    // Check Fear & Greed
    if (cryptoData.fearGreed) {
        if (cryptoData.fearGreed.value <= 10) {
            alerts.push({
                level: 'critical',
                coin: 'MARKET',
                message: 'Extreme Fear detectado - oportunidade de compra?',
                time: new Date()
            });
        } else if (cryptoData.fearGreed.value >= 80) {
            alerts.push({
                level: 'medium',
                coin: 'MARKET',
                message: 'Extreme Greed alertado - cautela recomendada',
                time: new Date()
            });
        }
    }

    if (alerts.length > 0) {
        alertsList.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.level}">
                <div class="time">${formatTime(alert.time)}</div>
                <div class="message">${alert.coin}: ${alert.message}</div>
            </div>
        `).join('');
    } else {
        alertsList.innerHTML = '<p class="no-alerts">Nenhum alerta ativo</p>';
    }
}

// Update analysis notes
function updateNotes() {
    const notesEl = document.getElementById('analysis-notes');
    const notes = [];

    // Add agent analysis notes first
    if (agentData.shideAnalysis) {
        Object.entries(agentData.shideAnalysis).forEach(([asset, analysis]) => {
            if (analysis) {
                notes.push({
                    time: agentData.lastUpdate ? new Date(agentData.lastUpdate) : new Date(),
                    text: `🤖 Shide - ${asset.toUpperCase()}: ${analysis}`
                });
            }
        });
    }

    // Add market sentiment note
    if (agentData.marketSentiment && agentData.marketSentiment.classification) {
        const fg = agentData.marketSentiment;
        notes.push({
            time: new Date(),
            text: `🎭 Sentimento: ${fg.value} (${fg.classification}). ` +
                  `${fg.value < 25 ? 'Mercado em pânico - oportunidades de entrada.' : 
                    fg.value > 75 ? 'Euforia no mercado - proteja lucros.' : 
                    'Mercado em equilíbrio.'}`
        });
    }

    // Add opportunities
    if (agentData.opportunities && agentData.opportunities.length > 0) {
        const opp = agentData.opportunities[0];
        notes.push({
            time: agentData.lastUpdate ? new Date(agentData.lastUpdate) : new Date(),
            text: `💡 Oportunidade: ${opp.asset} ${opp.type} | ` +
                  `Entry: ${formatNumber(opp.entry)} | ` +
                  `Target: ${formatNumber(opp.target)} | ` +
                  `Probabilidade: ${opp.probability}%`
        });
    }

    notesEl.innerHTML = notes.map(note => `
        <p>
            ${note.text}
            <br><em>${formatTime(note.time)}</em>
        </p>
    `).join('');
}

// Update last update time
function updateLastUpdateTime() {
    const el = document.getElementById('lastUpdate');
    const updateTime = agentData.lastUpdate ? new Date(agentData.lastUpdate) : new Date();
    el.textContent = formatTime(updateTime);
}

// Main update function
async function updateDashboard() {
    console.log('Updating dashboard...');

    // Load agent data first
    await loadAgentData();

    // Fetch data in parallel
    const [btcData, ethData, solData, fearGreedData] = await Promise.all([
        fetchCryptoData('btc', API_ENDPOINTS.btc),
        fetchCryptoData('eth', API_ENDPOINTS.eth),
        fetchCryptoData('sol', API_ENDPOINTS.sol),
        fetchFearGreed()
    ]);

    // Update UI
    updateFearGreedUI(fearGreedData);
    updateAssetUI('btc', btcData);
    updateAssetUI('eth', ethData);
    updateAssetUI('sol', solData);
    updateSummary();
    updateAlerts();
    updateNotes();
    updateLastUpdateTime();

    console.log('Dashboard updated');
}

// Initialize
function init() {
    updateDashboard();
    // Auto-refresh every 5 minutes
    setInterval(updateDashboard, 5 * 60 * 1000);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}