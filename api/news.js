export default async function handler(req, res) {
  const newsKey = process.env.NEWSAPI_KEY;
  const response = await fetch(
    `https://newsapi.org/v2/everything?q=forex&apiKey=${newsKey}`
  );
  const data = await response.json();
  res.status(200).json(data);
}
