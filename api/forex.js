export default async function handler(req, res) {
  const { from, to } = req.query;
  const apiKey = process.env.ALPHA_VANTAGE_KEY;

  // Use FX_DAILY instead of FX_INTRADAY
  const url = `https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=${from}&to_symbol=${to}&apikey=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching Alpha Vantage:", error);
    res.status(500).json({ error: "Failed to fetch forex data" });
  }
}
