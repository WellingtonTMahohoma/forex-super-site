export default async function handler(req, res) {
  const { from = "EUR", to = "USD" } = req.query; // defaults
  const alphaKey = process.env.ALPHA_VANTAGE_KEY;

  const response = await fetch(
    `https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=${from}&to_symbol=${to}&interval=5min&apikey=${alphaKey}`
  );
  const data = await response.json();
  res.status(200).json(data);
}
