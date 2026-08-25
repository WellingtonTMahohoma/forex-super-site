export default async function handler(req, res) {
  const alphaKey = process.env.ALPHA_VANTAGE_KEY;
  const response = await fetch(
    `https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=EUR&to_symbol=USD&interval=5min&apikey=${alphaKey}`
  );
  const data = await response.json();
  res.status(200).json(data);
}
