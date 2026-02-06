// API Endpoints
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const API_ENDPOINTS = {
    btc: `${COINGECKO_API}/coins/bitcoin`,
    eth: `${COINGECKO_API}/coins/ethereum`,
    sol: `${COINGECKO_API}/coins/solana`,
    fearGreed: 'https://api.alternative.me/fng/'
};

// Local data file
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

// Agent analysis data
let agentData = {
    shideAnalysis: {},
    opportunities: [],
    alerts: [],
    marketSentiment: {}
};

// Charts
let priceChart = null;
let miniCharts = {
    btc: null,
    eth: null,
    sol: null
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
    return new Date(date).toLocaleString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Generate random price history for charts
function generatePriceHistory(basePrice, points = 20) {
    const history = [];
    let price = basePrice;
    const now = Date.now();

    for (let i = points; i >= 0; i--) {
        const change = (Math.random() - 0.5) * basePrice * 0.05; // +/- 2.5%
        price += change;
        history.push({
            x: now - i * 5 * 60 * 1000, // 5 minutes intervals
            y: price
        });
    }

    return history;
}

// Initialize main price chart
function initPriceChart() {
    const ctx = document.getElementById('priceChart');
    if (!ctx) return;

    if (priceChart) {
        priceChart.destroy();
    }

    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#94a3b8',
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(19, 24, 66, 0.95)',
                    titleColor: '#f8fafc',
                    bodyColor: '#94a3b8',
                    borderColor: '#8b5cf6',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        color: 'rgba(30, 41, 59, 0.5)'
                    },
                    ticks: {
                        color: '#64748b',
                        maxTicksLimit: 8
                    }
                },
                y: {
                    display: true,
                    grid: {
                        color: 'rgba(30, 41, 59, 0.5)'
                    },
                    ticks: {
                        color: '#64748b',
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Initialize mini charts for each asset
function initMiniCharts() {
    ['btc', 'eth', 'sol'].forEach(coinId => {
        const ctx = document.getElementById(`${coinId}MiniChart`);
        if (!ctx) return;

        if (miniCharts[coinId]) {
            miniCharts[coinId].destroy();
        }

        miniCharts[coinId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    borderColor: getChartColor(coinId),
                    borderWidth: 2,
                    fill: true,
                    backgroundColor: getChartColor(coinId, 0.1),
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                scales: {
                    x: { display: false },
                    y: { display: false }
                },
                elements: {
                    point: { radius: 0 }
                }
            }
        });
    });
}

function getChartColor(coinId, alpha = 1) {
    const colors = {
        btc: `rgba(247, 147, 26, ${alpha})`,
        eth: `rgba(108, 122, 137, ${alpha})`,
        sol: `rgba(14, 165, 233, ${alpha})`
    };
    return colors[coinId] || `rgba(139, 92, 246, ${alpha})`;
}

// Update main price chart
function updatePriceChart() {
    if (!priceChart) return;

    const labels = [];
    const btcData = [];
    const ethData = [];
    const solData = [];

    if (cryptoData.btc) {
        const history = generatePriceHistory(cryptoData.btc.price);
        history.forEach((point, index) => {
            labels.push(new Date(point.x).toLocaleTimeString());
            btcData.push(point.y);
        });
    }

    if (cryptoData.eth) {
        const history = generatePriceHistory(cryptoData.eth.price);
        history.forEach(point => {
            ethData.push(point.y);
        });
    }

    if (cryptoData.sol) {
        const history = generatePriceHistory(cryptoData.sol.price);
        history.forEach(point => {
            solData.push(point.y);
        });
    }

    priceChart.data.labels = labels;
    priceChart.data.datasets = [
        {
            label: 'BTC',
            data: btcData,
            borderColor: '#f7931a',
            backgroundColor: 'rgba(247, 147, 26, 0.1)',
            tension: 0.4,
            pointRadius: 0,
            fill: true
        },
        {
            label: 'ETH',
            data: ethData,
            borderColor: '#6c7a89',
            backgroundColor: 'rgba(108, 122, 137, 0.1)',
            tension: 0.4,
            pointRadius: 0,
            fill: true
        },
        {
            label: 'SOL',
            data: solData,
            borderColor: '#0ea5e9',
            backgroundColor: 'rgba(14, 165, 233, 0.1)',
            tension: 0.4,
            pointRadius: 0,
            fill: true
        }
    ];

    priceChart.update('none');
}

// Update mini charts
function updateMiniCharts() {
    ['btc', 'eth', 'sol'].forEach(coinId => {
        if (!cryptoData[coinId] || !miniCharts[coinId]) return;

        const history = generatePriceHistory(cryptoData[coinId].price, 10);
        miniCharts[coinId].data.datasets[0].data = history.map(p => p.y);
        miniCharts[coinId].update('none');
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

// Load agent data
async function loadAgentData() {
    try {
        const response = await fetch(DATA_FILE);
        const data = await response.json();
        agentData = data;
    } catch (error) {
        console.error('Error loading agent data:', error);
        agentData = {
            shideAnalysis: {},
            opportunities: [],
            alerts: [],
            marketSentiment: {}
        };
    }
}

// Update Fear & Greed UI
function updateFearGreedUI(data) {
    const valueEl = document.getElementById('fearGreedValue');
    const sentimentEl = document.getElementById('fearGreedSentiment');
    const gaugeArc = document.getElementById('gaugeArc');

    if (data) {
        valueEl.textContent = data.value;
        sentimentEl.textContent = data.classification;

        // Update gauge
        const percentage = (data.value / 100);
        const circumference = 283; // 2 * PI * 45
        const offset = circumference - (circumference * percentage);
        gaugeArc.style.strokeDashoffset = offset;

        cryptoData.fearGreed = data;
    }
}

// Update asset UI
function updateAssetUI(coinId, data) {
    const priceEl = document.getElementById(`${coinId}-price`);
    const changeTextEl = document.getElementById(`${coinId}-change-text`);
    const changeBadgeEl = document.getElementById(`${coinId}-change-badge`);
    const highEl = document.getElementById(`${coinId}-high`);
    const lowEl = document.getElementById(`${coinId}-low`);
    const mcapEl = document.getElementById(`${coinId}-mcap`);
    const volumeEl = document.getElementById(`${coinId}-volume`);

    if (data) {
        priceEl.textContent = formatCurrency(data.price);

        const changeSign = data.change24h >= 0 ? '+' : '';
        const changeText = `${changeSign}${data.change24h.toFixed(2)}%`;
        changeTextEl.textContent = changeText;
        changeBadgeEl.textContent = changeText;

        // Determine color class
        const isPositive = data.change24h >= 0;
        changeTextEl.className = `price-change ${isPositive ? 'positive' : 'negative'}`;
        changeBadgeEl.className = `asset-change ${isPositive ? '' : 'negative'}`;

        highEl.textContent = formatCurrency(data.high24h);
        lowEl.textContent = formatCurrency(data.low24h);
        mcapEl.textContent = formatNumber(data.marketCap);
        volumeEl.textContent = formatNumber(data.volume);

        cryptoData[coinId] = data;
    }
}

// Update summary metrics
function updateSummary() {
    const totalMcap = [cryptoData.btc, cryptoData.eth, cryptoData.sol]
        .filter(d => d)
        .reduce((sum, d) => sum + d.marketCap, 0);

    const totalVolume = [cryptoData.btc, cryptoData.eth, cryptoData.sol]
        .filter(d => d)
        .reduce((sum, d) => sum + d.volume, 0);

    document.getElementById('marketCapTotal').textContent = formatNumber(totalMcap);
    document.getElementById('volume24h').textContent = formatNumber(totalVolume);

    // Mock changes for display
    document.getElementById('marketCapChange').textContent = '+12.2% 24h';
    document.getElementById('marketCapChange').className = 'metric-change positive';
    document.getElementById('volumeChange').textContent = '+8.5% 24h';
    document.getElementById('volumeChange').className = 'metric-change positive';

    // BTC Dominance (mock)
    if (cryptoData.btc && totalMcap > 0) {
        const dominance = (cryptoData.btc.marketCap / totalMcap * 100).toFixed(1);
        document.getElementById('btcDominance').textContent = `${dominance}%`;
    }

    // Active alerts
    const alertsCount = (agentData.alerts || []).length;
    document.getElementById('activeAlerts').textContent = alertsCount;
    const alertEl = document.getElementById('alertLevel');
    if (alertsCount > 0) {
        alertEl.textContent = alertsCount > 3 ? 'CRÍTICO' : alertsCount > 1 ? 'ALTO' : 'MÉDIO';
        alertEl.className = 'metric-change negative';
    } else {
        alertEl.textContent = 'NORMAL';
        alertEl.className = 'metric-change positive';
    }
}

// Update alerts
function updateAlerts() {
    const alertsContent = document.getElementById('alertsContent');
    const alerts = [];

    // Agent alerts
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

    // Price movement alerts
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

    // Fear & Greed alerts
    if (cryptoData.fearGreed) {
        if (cryptoData.fearGreed.value <= 10) {
            alerts.push({
                level: 'critical',
                coin: 'MARKET',
                message: 'Extreme Fear - oportunidade de compra?',
                time: new Date()
            });
        } else if (cryptoData.fearGreed.value >= 80) {
            alerts.push({
                level: 'medium',
                coin: 'MARKET',
                message: 'Extreme Greed - cautela recomendada',
                time: new Date()
            });
        }
    }

    if (alerts.length > 0) {
        alertsContent.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.level}">
                <div class="time">${formatTime(alert.time)}</div>
                <div class="message">${alert.coin}: ${alert.message}</div>
            </div>
        `).join('');
    } else {
        alertsContent.innerHTML = '<p class="no-alerts">Nenhum alerta ativo</p>';
    }
}

// Update analysis tab
function updateAnalysisTab() {
    const shideContent = document.getElementById('shideAnalysisContent');
    const opportunitiesContent = document.getElementById('opportunitiesContent');
    const notesContent = document.getElementById('notesContent');

    // Shide Analysis
    if (agentData.shideAnalysis) {
        const analyses = [];
        Object.entries(agentData.shideAnalysis).forEach(([asset, analysis]) => {
            if (analysis) {
                analyses.push(`<strong>${asset.toUpperCase()}:</strong> ${analysis}`);
            }
        });

        if (analyses.length > 0) {
            shideContent.innerHTML = analyses.map(a => `<p>${a}</p>`).join('');
        } else {
            shideContent.innerHTML = '<p>Nenhuma análise disponível</p>';
        }
    }

    // Opportunities
    if (agentData.opportunities && agentData.opportunities.length > 0) {
        opportunitiesContent.innerHTML = agentData.opportunities.map(opp => `
            <div class="alert-item ${opp.probability >= 70 ? 'critical' : opp.probability >= 50 ? 'high' : 'medium'}">
                <div class="message">
                    <strong>${opp.asset}</strong> ${opp.type.toUpperCase()} |
                    Entry: <strong>${formatNumber(opp.entry)}</strong> |
                    Target: <strong>${formatNumber(opp.target)}</strong> |
                    Probabilidade: <strong>${opp.probability}%</strong>
                </div>
            </div>
        `).join('');
    } else {
        opportunitiesContent.innerHTML = '<p>Nenhuma oportunidade identificada</p>';
    }

    // Notes
    const notes = [];
    if (agentData.marketSentiment && agentData.marketSentiment.classification) {
        const fg = agentData.marketSentiment;
        notes.push(`<strong>Sentimento:</strong> ${fg.value} (${fg.classification})`);
    }

    if (cryptoData.btc) {
        const btc = cryptoData.btc;
        notes.push(`<strong>BTC:</strong> ${btc.change24h >= 0 ? '📈 Alta' : '📉 Baixa'} (${formatPercent(btc.change24h)})`);
    }

    if (notes.length > 0) {
        notesContent.innerHTML = notes.map(note => `
            <p>${note}<br><em>${formatTime(new Date())}</em></p>
        `).join('');
    }
}

// Update last update time
function updateLastUpdateTime() {
    const el = document.getElementById('lastUpdate');
    el.textContent = `Atualizado: ${formatTime(new Date())}`;
}

// Tab switching
function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all tabs
            tabs.forEach(t => t.classList.remove('active'));

            // Add active to clicked tab
            tab.classList.add('active');

            // Hide all content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });

            // Show selected content
            const tabId = tab.dataset.tab;
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Clear alerts
window.clearAlerts = function() {
    if (confirm('Deseja limpar todos os alertas?')) {
        agentData.alerts = [];
        updateAlerts();
    }
};

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
    updatePriceChart();
    updateMiniCharts();
    updateAlerts();
    updateAnalysisTab();
    updateLastUpdateTime();

    console.log('Dashboard updated');
}

// Initialize
function init() {
    // Setup charts
    initPriceChart();
    initMiniCharts();

    // Setup tabs
    setupTabs();

    // Load initial data
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