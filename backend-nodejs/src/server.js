const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const connectDB = require('./config/db');
const descriptionRoutes = require('./routes/descriptionRoutes');
const activityLogRoutes = require('./routes/activityLogRoutes');
const searchRoutes = require('./routes/searchRoutes');
const authRoutes = require('./routes/authRoutes');
const uinfoRoutes = require('./routes/uinfoRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const venueRoutes = require('./routes/venueRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');

const app = express();
const PORT = process.env.NODEJS_PORT || process.env.PORT || 3001;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

app.use('/api/descriptions', descriptionRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/uinfo', uinfoRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/events', eventRoutes);
app.use('/api', registrationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'MongoDB Layer', timestamp: new Date().toISOString() });
});

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`MongoDB API running on port ${PORT}`));
};

startServer().catch((err) => {
  console.error('Failed to start MongoDB API:', err);
  process.exit(1);
});
