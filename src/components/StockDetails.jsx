import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function StockDetails() {
  const { auth } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [unreturnedStocks, setUnreturnedStocks] = useState([]);
  const [pendingStocks, setPendingStocks] = useState([]);

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'unreturned', 'pending'
  const cadetId = auth.userId;

  useEffect(() => {
    if (!cadetId) {
      setError('Please log in to view your stock details');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`http://localhost:8080/api/issued-stocks/${cadetId}`);
        setStocks(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch stock details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cadetId]);

  const fetchUnreturnedStocks = async () => {
    setActiveTab('unreturned');
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/issued-stocks/cadet/${cadetId}/unreturned`);
      setUnreturnedStocks(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch unreturned stocks');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingStocks = async () => {
    setActiveTab('pending');
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/issued-stocks/cadet/${cadetId}/pending`);
      setPendingStocks(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch pending stocks');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStockCard = (item, isOverdue = false) => {
    const today = new Date();
    const returnDate = new Date(item.returnDate);
    const isPending = returnDate < today;

    return (
      <div key={item.id} className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${
        isPending ? 'border-red-500' : 'border-blue-500'
      }`}>
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-bold text-gray-800">{item.stock.itemName}</h3>
            <span className={`px-2 py-1 text-xs rounded-full ${
              item.stock.itemType === 'retentional' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-purple-100 text-purple-800'
            }`}>
              {item.stock.itemType}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm mb-4">
            <div>
              <p className="text-gray-500">Item Code</p>
              <p className="font-medium">{item.stock.itemCode}</p>
            </div>
            <div>
              <p className="text-gray-500">Quantity</p>
              <p className="font-medium">{item.quantity}</p>
            </div>
            <div>
              <p className="text-gray-500">Issued On</p>
              <p className="font-medium">{formatDate(item.issuedAt)}</p>
            </div>
            <div>
              <p className="text-gray-500">Return By</p>
              <p className={`font-medium ${
                isPending ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatDate(item.returnDate)}
              </p>
            </div>
          </div>

          {item.remarks && (
            <div className="bg-gray-50 p-3 rounded mb-3">
              <p className="text-xs text-gray-500">Remarks:</p>
              <p className="text-sm text-gray-700">{item.remarks}</p>
            </div>
          )}

          {isPending && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <button className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium">
                Request Extension
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Stock Inventory</h1>
          <p className="text-gray-600 mt-1">View and manage all items issued to you</p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg">
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-lg">
            <p>{success}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Items
          </button>
          <button
            onClick={fetchUnreturnedStocks}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'unreturned' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Unreturned Items
          </button>
          <button
            onClick={fetchPendingStocks}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'pending' 
                ? 'bg-red-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Overdue Items
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {activeTab === 'unreturned' && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Unreturned Items</h2>
                {unreturnedStocks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {unreturnedStocks.map(item => renderStockCard(item))}
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-3 text-lg font-medium text-gray-900">All items returned</h3>
                    <p className="mt-1 text-gray-500">You have no unreturned items</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'pending' && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Overdue Items</h2>
                {pendingStocks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingStocks.map(item => renderStockCard(item, true))}
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-3 text-lg font-medium text-gray-900">No overdue items</h3>
                    <p className="mt-1 text-gray-500">All your items are returned on time</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'all' && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">All Issued Items</h2>
                {stocks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stocks.map(item => renderStockCard(item))}
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <h3 className="mt-3 text-lg font-medium text-gray-900">No items issued yet</h3>
                    <p className="mt-1 text-gray-500">You haven't been issued any items yet</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default StockDetails;