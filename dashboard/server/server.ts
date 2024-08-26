import express from 'express';
import cors from 'cors';

const app = express();
const port = 3001;

const API_KEY = "my_api_key";


app.use(cors());

const authenticateApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const apiKey = req.get('Api_key');
  if (apiKey === API_KEY) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized: Invalid API key' });
  }
};

app.get('/api/sensor-data', authenticateApiKey, (req, res) => {

  const data = {
    temperature: Math.random() * 30 + 10, 
    humidity: Math.random() * 60 + 20, 
    pressure: Math.random() * 200 + 900, 
    timestamp: new Date().toISOString(),
  };
  res.json(data);
});

app.listen(port, () => {
  console.log(`Mock ESP32 server running at http://localhost:${port}`);
});