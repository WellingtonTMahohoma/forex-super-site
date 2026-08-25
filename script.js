// Replace with your API keys
const alphaKey = "CMOFYBX6E09TVMNU";
const newsKey = "wk_ZqBdItxFX4Yo5lG-1lG_HRvJ9yDQa6RN0c0biXtdSL2L1cDtk4ltzNP23ObwJkeA";

// Fetch live forex prices (EUR/USD)
async function getLivePrices() {
  const res = await fetch(`https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=EUR&to_symbol=USD&interval=5min&apikey=${alphaKey}`);
  const data = await res.json();
  const prices = Object.values(data["Time Series FX (5min)"]).map(p => parseFloat(p["4. close"]));
  return prices.reverse(); // latest first
}

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

async function loadNews() {
  const res = await fetch(`https://newsapi.org/v2/everything?q=forex&apiKey=${newsKey}`);
  const data = await res.json();
  const feed = document.getElementById("newsFeed");
  feed.innerHTML = "";
  data.articles.slice(0,5).forEach(article => {
    const sentiment = analyzeSentiment(article.title + " " + article.description);
    const li = document.createElement("li");
    li.innerHTML = `<a href="${article.url}" target="_blank">${article.title}</a> → Prediction: ${sentiment}`;
    feed.appendChild(li);
  });
}

// Dashboard
async function runDashboard() {
  const prices = await getLivePrices();
  const signals = [];
  signals.push("Moving Average: " + (movingAverage(prices,3).at(-1) > movingAverage(prices,5).at(-1) ? "📈 Rising" : "📉 Falling"));
  signals.push("RSI: " + getRSISignal(prices));
  signals.push("MACD: " + getMACDSignal(prices));
  signals.push("Bollinger: " + getBollingerSignal(prices));

  const list = document.getElementById("signals");
  list.innerHTML = "";
  signals.forEach(sig => {
    const li = document.createElement("li");
    li.innerText = sig;
    list.appendChild(li);
  });

  // Consensus
  const bullish = signals.filter(s => s.includes("📈")).length;
  const bearish = signals.filter(s => s.includes("📉")).length;
  let consensus = bullish > bearish ? "Consensus: 📈 Rising" : bearish > bullish ? "Consensus: 📉 Falling" : "Consensus: ➡ Neutral";
  document.getElementById("consensus").innerText = consensus;
}

// Auto-refresh every minute
setInterval(() => {
  runDashboard();
  loadNews();
}, 60000);

// Initial load
runDashboard();
loadNews();
