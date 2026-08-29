// --- Utility Functions ---

// Moving Average
function movingAverage(data, window) {
  let result = [];
  for (let i = 0; i <= data.length - window; i++) {
    const slice = data.slice(i, i + window);
    const avg = slice.reduce((a,b) => a+b, 0) / window;
    result.push(avg);
  }
  return result;
}

// RSI
function getRSISignal(prices) {
  let gains = 0, losses = 0;
  for (let i = 1; i < prices.length; i++) {
    let diff = prices[i] - prices[i-1];
    if (diff > 0) gains += diff; else losses -= diff;
  }
  const rs = gains / (losses || 1);
  const rsi = 100 - (100 / (1 + rs));
  return rsi > 70 ? "📉 Overbought" : rsi < 30 ? "📈 Oversold" : "➡ Neutral";
}

// MACD
function getMACDSignal(prices) {
  const shortEMA = movingAverage(prices, 3).at(-1);
  const longEMA = movingAverage(prices, 6).at(-1);
  const macd = shortEMA - longEMA;
  return macd > 0 ? "📈 Bullish" : "📉 Bearish";
}

// Bollinger Bands
function getBollingerSignal(prices) {
  const ma = movingAverage(prices, 5).at(-1);
  const stdDev = Math.sqrt(prices.map(p => Math.pow(p - ma,2)).reduce((a,b)=>a+b) / prices.length);
  const upper = ma + 2*stdDev;
  const lower = ma - 2*stdDev;
  const lastPrice = prices.at(-1);
  return lastPrice > upper ? "📉 Above band" : lastPrice < lower ? "📈 Below band" : "➡ Within band";
}

// News Sentiment
function analyzeSentiment(text) {
  const positiveWords = ["rise","gain","bullish","strong","up"];
  const negativeWords = ["fall","drop","bearish","weak","down"];
  let score = 0;
  positiveWords.forEach(word => { if (text.toLowerCase().includes(word)) score++; });
  negativeWords.forEach(word => { if (text.toLowerCase().includes(word)) score--; });
  return score > 0 ? "📈 Positive" : score < 0 ? "📉 Negative" : "➡ Neutral";
}

// --- API Calls ---

// Fetch forex prices (Daily)
async function getLivePrices(from="EUR", to="USD") {
  const res = await fetch(`/api/forex?from=${from}&to=${to}`);
  const data = await res.json();

  if (!data["Time Series FX (Daily)"]) return [];

  const prices = Object.values(data["Time Series FX (Daily)"])
    .map(p => parseFloat(p["4. close"]));

  return prices.reverse(); // oldest → newest
}

// Fetch news
async function loadNews() {
  const res = await fetch('/api/news');
  const data = await res.json();
  const feed = document.getElementById("newsFeed");
  feed.innerHTML = "";
  if (!data.articles) return;
  data.articles.slice(0,5).forEach(article => {
    const sentiment = analyzeSentiment(article.title + " " + article.description);
    const li = document.createElement("li");
    li.innerHTML = `<a href="${article.url}" target="_blank">${article.title}</a> → Prediction: ${sentiment}`;
    feed.appendChild(li);
  });
}

// --- Chart Loader ---
function loadChart(from, to) {
  if (typeof TradingView !== "undefined") {
    new TradingView.widget({
      "width": "100%",
      "height": 400,
      "symbol": `FX:${from}${to}`,
      "interval": "D",   // Daily candles
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "container_id": "tradingview_chart"
    });
  } else {
    setTimeout(() => loadChart(from, to), 1000);
  }
}

// --- UI Helpers ---
function updateIndicatorCard(id, title, definition, application, prediction) {
  const card = document.getElementById(id);
  card.innerHTML = `
    <h3>${title}</h3>
    <p><strong>Definition:</strong> ${definition}</p>
    <p><strong>Application:</strong> ${application}</p>
    <p><strong>Prediction:</strong> ${prediction}</p>
  `;
}

// --- Dashboard Runner ---
async function runDashboard() {
  const from = document.getElementById("fromCurrency").value;
  const to = document.getElementById("toCurrency").value;

  const prices = await getLivePrices(from, to);
  if (prices.length === 0) return;

  // Signals
  const maSignal = (movingAverage(prices,3).at(-1) > movingAverage(prices,5).at(-1)) ? "📈 Rising" : "📉 Falling";
  const rsiSignal = getRSISignal(prices);
  const macdSignal = getMACDSignal(prices);
  const bollingerSignal = getBollingerSignal(prices);

  // Update cards
  updateIndicatorCard("maCard", "Moving Average",
    "Average of closing prices over a set period.",
    "Compare 3-day vs 5-day averages.",
    maSignal);

  updateIndicatorCard("rsiCard", "RSI (Relative Strength Index)",
    "Momentum oscillator measuring speed and change of price movements.",
    "Calculate gains vs losses over recent days.",
    rsiSignal);

  updateIndicatorCard("macdCard", "MACD",
    "Difference between short EMA and long EMA.",
    "Compare 3-day EMA vs 6-day EMA.",
    macdSignal);

  updateIndicatorCard("bollingerCard", "Bollinger Bands",
    "Bands plotted two standard deviations above and below a moving average.",
    "Check if price is outside or inside the bands.",
    bollingerSignal);

  updateIndicatorCard("newsCard", "News Sentiment",
    "Text analysis of headlines for positive/negative words.",
    "Scan for 'rise', 'bullish' vs 'fall', 'bearish'.",
    "See feed below");

  // Consensus
  const signals = [maSignal, rsiSignal, macdSignal, bollingerSignal];
  const bullish = signals.filter(s => s.includes("📈")).length;
  const bearish = signals.filter(s => s.includes("📉")).length;
  let consensus = bullish > bearish ? "Consensus: 📈 Rising" : bearish > bullish ? "Consensus: 📉 Falling" : "Consensus: ➡ Neutral";
  document.getElementById("consensus").innerText = consensus;

  // Chart
  loadChart(from, to);
}

// --- Auto Refresh ---
setInterval(() => {
  runDashboard();
  loadNews();
}, 60000);

// Initial load
window.onload = () => {
  runDashboard();
  loadNews();
};
