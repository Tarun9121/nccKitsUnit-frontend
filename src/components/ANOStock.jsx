import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ANOStock() {
  const [stocks, setStocks] = useState([]);
  const [newStock, setNewStock] = useState({
    itemName: '',
    quantity: '',
    cost: '',
    receivedDate: '',
    itemType: 'retentional',
  });
  const [issueStockData, setIssueStockData] = useState({
    itemCode: '',
    regimentalNo: '',
    issuedAt: '',
    returnDate: '',
    quantity: 1,
    remarks: ''
  });
  const [loading, setLoading] = useState(true);
  const [showAddStockForm, setShowAddStockForm] = useState(false);
  const [showIssueStockForm, setShowIssueStockForm] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItemType, setSelectedItemType] = useState('all');
  const [availableItems, setAvailableItems] = useState([]);
  const [searchBy, setSearchBy] = useState('name'); // 'name' or 'code'

  const navigate = useNavigate();

  useEffect(() => {
    fetchAllStocks();
  }, []);

  useEffect(() => {
    if (showIssueStockForm) {
      fetchAvailableItems();
    }
  }, [showIssueStockForm]);

  const fetchAllStocks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('http://localhost:8080/api/stock/all');
      setStocks(res.data);
    } catch (err) {
      console.error('Error fetching stock items:', err);
      setError('Failed to load stock items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableItems = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/stock/available');
      setAvailableItems(res.data);
    } catch (err) {
      console.error('Error fetching available items:', err);
    }
  };

  const handleStockClick = (stock) => {
    navigate(`/cadets-issued/${stock.id}`, { state: { stock } });
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        ...newStock,
        quantity: parseInt(newStock.quantity, 10),
        cost: parseFloat(newStock.cost),
      };
      await axios.post('http://localhost:8080/api/stocks', payload);
      fetchAllStocks();
      setNewStock({
        itemName: '',
        quantity: '',
        cost: '',
        receivedDate: '',
        itemType: 'retentional',
      });
      setShowAddStockForm(false);
      setSuccess('Stock item added successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error adding stock:', err);
      setError(err.response?.data?.message || 'Failed to add stock item. Please check your inputs and try again.');
    }
  };

  const handleIssueStockSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('itemCode', issueStockData.itemCode);
      params.append('regimentalNo', issueStockData.regimentalNo);
      params.append('issuedAt', issueStockData.issuedAt);
      params.append('returnDate', issueStockData.returnDate);
      params.append('quantity', issueStockData.quantity);
      params.append('remarks', issueStockData.remarks || '');

      await axios.post(
        'http://localhost:8080/api/issued-stocks/issue-stock',
        null,
        { params }
      );

      setSuccess('Stock issued successfully!');
      setIssueStockData({
        itemCode: '',
        regimentalNo: '',
        issuedAt: '',
        returnDate: '',
        quantity: 1,
        remarks: ''
      });
      setShowIssueStockForm(false);
      fetchAllStocks();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error issuing stock:', err);
      setError(err.response?.data?.message || 'Failed to issue stock. Please try again.');
    }
  };

  const filteredStocks = stocks.filter(stock => {
    // Search by either name or code based on searchBy state
    const matchesSearch = searchBy === 'name' 
      ? stock.itemName.toLowerCase().includes(searchTerm.toLowerCase())
      : stock.itemCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedItemType === 'all' || stock.itemType === selectedItemType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">NCC Stock Management</h1>
          <p className="text-gray-600 mt-1">Track and manage all NCC inventory items</p>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <button
            onClick={() => setShowAddStockForm(!showAddStockForm)}
            className={`px-4 py-2 rounded-lg flex items-center ${
              showAddStockForm ? 'bg-gray-600 text-white' : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {showAddStockForm ? 'Cancel' : 'Add Item'}
          </button>
          <button
            onClick={() => setShowIssueStockForm(!showIssueStockForm)}
            className={`px-4 py-2 rounded-lg flex items-center ${
              showIssueStockForm ? 'bg-gray-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            {showIssueStockForm ? 'Cancel' : 'Issue Item'}
          </button>
          <button
            onClick={() => navigate('/pending-cadets')}
            className="px-4 py-2 rounded-lg flex items-center bg-red-600 hover:bg-red-700 text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Pending Cadets
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-lg flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p>{success}</p>
        </div>
      )}

      {/* Add Stock Form */}
      {showAddStockForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
          <h3 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Stock Item
          </h3>
          <form onSubmit={handleStockSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Item Name*</label>
              <input
                type="text"
                name="itemName"
                value={newStock.itemName}
                onChange={(e) => setNewStock({ ...newStock, itemName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., NCC Uniform"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Item Type*</label>
              <select
                value={newStock.itemType}
                onChange={(e) => setNewStock({ ...newStock, itemType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="retentional">Retentional</option>
                <option value="non-retentional">Non-Retentional</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Quantity*</label>
              <input
                type="number"
                name="quantity"
                value={newStock.quantity}
                onChange={(e) => setNewStock({ ...newStock, quantity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter quantity"
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Cost per Unit (₹)*</label>
              <input
                type="number"
                name="cost"
                value={newStock.cost}
                onChange={(e) => setNewStock({ ...newStock, cost: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter cost"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Received Date*</label>
              <input
                type="date"
                name="receivedDate"
                value={newStock.receivedDate}
                onChange={(e) => setNewStock({ ...newStock, receivedDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Add Stock Item
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Issue Stock Form */}
      {showIssueStockForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
          <h3 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Issue Stock to Cadet
          </h3>
          <form onSubmit={handleIssueStockSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Item*</label>
              <input
                type="text"
                name="itemCode"
                value={issueStockData.itemCode}
                onChange={(e) => setIssueStockData({ ...issueStockData, itemCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter cadet regimental number"
                required
              />
            </div>
{/* value={issueStockData.itemCode} */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Regimental No*</label>
              <input
                type="text"
                name="regimentalNo"
                value={issueStockData.regimentalNo}
                onChange={(e) => setIssueStockData({ ...issueStockData, regimentalNo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter cadet regimental number"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Issue Date*</label>
              <input
                type="date"
                name="issuedAt"
                value={issueStockData.issuedAt}
                onChange={(e) => setIssueStockData({ ...issueStockData, issuedAt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Return Date*</label>
              <input
                type="date"
                name="returnDate"
                value={issueStockData.returnDate}
                onChange={(e) => setIssueStockData({ ...issueStockData, returnDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Quantity*</label>
              <input
                type="number"
                name="quantity"
                value={issueStockData.quantity}
                onChange={(e) => setIssueStockData({ ...issueStockData, quantity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Remarks</label>
              <textarea
                name="remarks"
                value={issueStockData.remarks}
                onChange={(e) => setIssueStockData({ ...issueStockData, remarks: e.target.value })}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any special instructions"
              />
            </div>

            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Issue Stock
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stock Inventory Section */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-800">Current Stock Inventory</h3>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder={`Search by ${searchBy === 'name' ? 'item name' : 'item code'}...`}
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <div className="flex gap-3">
                <select
                  value={searchBy}
                  onChange={(e) => setSearchBy(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="name">Search by Name</option>
                  <option value="code">Search by Code</option>
                </select>
                
                <select
                  value={selectedItemType}
                  onChange={(e) => setSelectedItemType(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="retentional">Retentional</option>
                  <option value="non-retentional">Non-Retentional</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredStocks.length === 0 ? (
          <div className="p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h4 className="mt-2 text-lg font-medium text-gray-900">
              {searchTerm 
                ? "No matching items found" 
                : "No stock items available"}
            </h4>
            <p className="mt-1 text-gray-500">
              {searchTerm 
                ? "Try a different search term" 
                : "Add new stock items to get started"}
            </p>
            <button
              onClick={() => setShowAddStockForm(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Stock Item
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Code
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStocks.map((stock) => (
                  <tr key={stock.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{stock.itemName}</div>
                          <div className="text-xs text-gray-400">
                            Received: {new Date(stock.receivedDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {stock.itemCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">{stock.quantity}</div>
                      <div className="text-xs text-gray-500">units in stock</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      ₹{parseFloat(stock.cost).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        stock.itemType === 'retentional' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {stock.itemType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleStockClick(stock)}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        View Issued
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}