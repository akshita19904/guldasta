import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import peopleRoutes from './routes/people';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || '')
  .then(() => console.log('MongoDB connected '))
  .catch(err => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api/people', peopleRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Guldasta API running ' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} `));