import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import peopleRoutes from './routes/people';
import reminderRoutes from './routes/reminders';
import giftRoutes from './routes/gifts';
import messageRoutes from './routes/messages';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import noteRoutes from './routes/notes';
import { startReminderCron } from './services/reminderCron';
import adminAnalyticsRoutes from './routes/adminAnalytics';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || '')
  .then(() => {
    console.log('MongoDB connected ');
    startReminderCron();
  })
  .catch(err => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api/people', peopleRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/gifts', giftRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/admin', adminAnalyticsRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Guldasta API running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} `));