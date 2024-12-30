import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
    const [stocks, setStocks] = useState([]);
    const [stockForm, setStockForm] = useState({
        id: null,
        name: '',
        ticker: '',
        quantity: 0,
        buyPrice: 0.0
    });

    const totalValue = stocks.reduce((sum, stock) => {
        const quantity = Number(stock.quantity) || 0; // Ensure quantity is a number
        const buyPrice = Number(stock.buyPrice) || 0; // Ensure buy_price is a number
        return sum + quantity * buyPrice;
    }, 0);
    
    const totalQuantity = stocks.reduce((sum, stock) => sum + stock.quantity, 0);

    const fetchStocks = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/stocks'); // Replace with your backend URL
            const data = await response.json();
            setStocks(data); // Update the stocks state with fetched data
        } catch (error) {
            console.error('Error fetching stocks:', error);
        }
    };


    const addOrEditStock = async (event) => {
      event.preventDefault();
    
      try {
        const apiUrl = stockForm.id
          ? `http://localhost:5000/api/stocks/${stockForm.id}` // For updating an existing stock
          : 'http://localhost:5000/api/stocks'; // For adding a new stock
    
        const method = stockForm.id ? 'PUT' : 'POST'; // Use PUT for updates, POST for new
    
        const response = await fetch(apiUrl, {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(stockForm),
        });
    
        if (!response.ok) {
          throw new Error(`Failed to ${stockForm.id ? 'update' : 'add'} stock`);
        }
    
        fetchStocks(); // Refresh the stocks list
        resetForm(); // Reset the form
      } catch (error) {
        console.error(`Error ${stockForm.id ? 'updating' : 'adding'} stock:`, error);
      }
    };
    
    const editStock = (stock) => {
      setStockForm({
          id: stock._id, // Ensure the correct ID is passed (use `_id` as MongoDB uses it)
          name: stock.name,
          ticker: stock.ticker,
          quantity: stock.quantity,
          buyPrice: stock.buy_price,
      });
  };
  

  const deleteStock = async (id) => {
    console.log(`deleteStock function called with ID: ${id}`); // Log function call
    try {
        const response = await fetch(`http://localhost:5000/api/stocks/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }, // Include headers
        });

        console.log(`API call completed with status: ${response.status}`); // Log API response

        if (!response.ok) {
            throw new Error(`Failed to delete stock with ID: ${id}. Status: ${response.status}`);
        }

        const result = await response.json();
        console.log(`Response from server:`, result); // Log server response
        fetchStocks(); // Refresh stocks list
    } catch (error) {
        console.error('Error in deleteStock:', error.message); // Log error
    }
};



  
    const resetForm = () => {
        setStockForm({
            id: null,
            name: '',
            ticker: '',
            quantity: 0,
            buyPrice: 0.0
        });
    };
    

    return (
        <div className="container py-4 ">
            <h1 className="text-center mb-4">Stock Portfolio Dashboard</h1>

            {/* Dashboard */}
            <div className="card mb-4">
                <div className="card-body">
                    <h2 className="card-title" style={{ color: 'yellow' }}>Portfolio Metrics</h2>
                    <p>Total Value: {totalValue.toFixed(2)}</p>
                    <p>Total Quantity: {totalQuantity}</p>
                </div>
            </div>

            {/* Form to Add/Edit Stock */}
            <div className="card mb-4">
                <div className="card-body">
                    <h2 className="card-title" style={{ color: 'yellow' }}>Add/Edit Stock</h2>
                    <form onSubmit={addOrEditStock}>
                        <div className="mb-3">
                            <label htmlFor="stockName" className="form-label">Stock Name</label>
                            <input
                                type="text"
                                id="stockName"
                                className="form-control"
                                value={stockForm.name}
                                onChange={(e) => setStockForm({ ...stockForm, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="stockTicker" className="form-label">Ticker</label>
                            <input
                                type="text"
                                id="stockTicker"
                                className="form-control"
                                value={stockForm.ticker}
                                onChange={(e) => setStockForm({ ...stockForm, ticker: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="stockQuantity" className="form-label">Quantity</label>
                            <input
                                type="number"
                                id="stockQuantity"
                                className="form-control"
                                value={stockForm.quantity}
                                onChange={(e) => setStockForm({ ...stockForm, quantity: parseInt(e.target.value, 10) || 0 })}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="buyPrice" className="form-label">Buy Price</label>
                            <input
                                type="number"
                                id="buyPrice"
                                className="form-control"
                                value={stockForm.buyPrice}
                                onChange={(e) => setStockForm({ ...stockForm, buyPrice: parseFloat(e.target.value) || 0.0 })}
                                step="0.01"
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">
                            {stockForm.id === null ? 'Add Stock' : 'Update Stock'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Current Stock Holdings */}
            <div className="card">
                <div className="card-body">
                    <h2 className="card-title" style={{ color: 'yellow' }}>Current Holdings</h2>
                    <table className="table table-bordered table-striped">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Ticker</th>
                                <th>Quantity</th>
                                <th>Buy Price</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stocks.map((stock, index) => (
                                <tr key={stock.id}>
                                    <td>{index + 1}</td>
                                    <td>{stock.name}</td>
                                    <td>{stock.ticker}</td>
                                    <td>{stock.quantity}</td>
                                    <td>{stock.buyPrice ? stock.buyPrice.toFixed(2) : 'N/A'}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-warning me-2"
                                            onClick={() => editStock(stock)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => {
                                              console.log(`Delete button clicked for ID: ${stock._id}`);
                                              deleteStock(stock._id)}}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default App;