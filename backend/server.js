require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const ticketRoutes = require('./routes/tickets');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/tickets', ticketRoutes);

const PORT = process.env.PORT || 5000;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;
    
    // For local agent testing due to SRV dns issues
    if (process.env.USE_MEMORY_DB === 'true') {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      console.log('Using in-memory MongoDB');
    }

    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
  }
};

connectDB();
