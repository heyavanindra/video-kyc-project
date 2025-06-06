import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
const app = express();

dotenv.config();

const PORT = process.env.PORT || 3000;
app.use(express.json());

connectDB();

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});