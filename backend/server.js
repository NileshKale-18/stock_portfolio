const express = require('express'); // Import Express
const mongoose = require('mongoose'); // Import Mongoose
const bodyParser = require('body-parser'); // Middleware for parsing JSON
const cors = require('cors'); // Middleware for handling cross-origin requests

const app = express(); // Create an Express application

// Middleware
app.use(cors()); // Allow requests from any origin
app.use(bodyParser.json()); // Parse JSON request bodies

// MongoDB connection
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://kalenilesh8459:nilesh@stock.6oov4.mongodb.net/stockholder?retryWrites=true&w=majority&appName=Stock';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define stock schema and model
const stockSchema = new mongoose.Schema({

  name: String,
  ticker: String,
  quantity: Number,
  buyPrice: Number,
});

const Stock = mongoose.model('Stock', stockSchema);

// Define routes

// Add a new stock
app.post('/api/stocks', async (req, res) => {
  try {
    const stock = new Stock(req.body);
    await stock.save();
    res.status(201).json({ message: 'Stock added successfully', stock });
  } catch (error) {
    console.error('Error adding stock:', error.message);
    res.status(500).json({ error: 'Failed to add stock' });
  }
});

// Update an existing stock
app.put('/api/stocks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedStock = await Stock.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ message: 'Stock updated successfully', updatedStock });
  } catch (error) {
    console.error('Error updating stock:', error.message);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

//delete stock
app.delete('/api/stocks/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`Received DELETE request for ID: ${id}`); // Log incoming request
    try {
        const deletedStock = await Stock.findByIdAndDelete(id); // Attempt deletion

        if (!deletedStock) {
            console.log(`No stock found with ID: ${id}`);
            return res.status(404).json({ message: 'Stock not found' });
        }

        console.log(`Stock with ID: ${id} deleted successfully.`);
        res.json({ message: 'Stock deleted successfully', deletedStock });
    } catch (error) {
        console.error('Error in DELETE route:', error.message); // Log any error
        res.status(500).json({ error: 'Failed to delete stock' });
    }
});



// Fetch all stocks
app.get('/api/stocks', async (req, res) => {
  try {
    const stocks = await Stock.find();
    res.json(stocks);
  } catch (error) {
    console.error('Error fetching stocks:', error.message);
    res.status(500).json({ error: 'Failed to fetch stocks' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
