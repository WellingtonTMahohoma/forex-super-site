// Example: update indicator cards with definition, application, prediction
function updateIndicatorCard(id, title, definition, application, prediction) {
  const card = document.getElementById(id);
  card.innerHTML = `
    <h3>${title}</h3>
    <p><strong>Definition:</strong> ${definition}</p>
    <p><strong>Application:</strong> ${application}</p>
    <p><strong>Prediction:</strong> ${prediction}</p>
  `;
}

// Inside runDashboard after signals are calculated:
updateIndicatorCard("maCard", "Moving Average",
  "Average of closing prices over a set period.",
  "Compare 3-day vs 5-day averages.",
  signals[0]);

updateIndicatorCard("rsiCard", "RSI (Relative Strength Index)",
  "Momentum oscillator measuring speed and change of price movements.",
  "Calculate gains vs losses over recent days.",
  signals[1]);

updateIndicatorCard("macdCard", "MACD",
  "Difference between short EMA and long EMA.",
  "Compare 3-day EMA vs 6-day EMA.",
  signals[2]);

updateIndicatorCard("bollingerCard", "Bollinger Bands",
  "Bands plotted two standard deviations above and below a moving average.",
  "Check if price is outside or inside the bands.",
  signals[3]);

updateIndicatorCard("newsCard", "News Sentiment",
  "Text analysis of headlines for positive/negative words.",
  "Scan for 'rise', 'bullish' vs 'fall', 'bearish'.",
  "See feed below");
