import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function PendingCadets() {
  const [pendingCadets, setPendingCadets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPendingCadets();
  }, []);

  const fetchPendingCadets = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:8080/api/issued-stocks/pending-cadets');
      
      // Handle 204 No Content response
      if (response.status === 204) {
        setPendingCadets([]);
        return;
      }

      setPendingCadets(response.data);
    } catch (err) {
      const errorMsg = err.response?.status === 204 
        ? 'No cadets with pending stock returns.' 
        : 'Failed to fetch pending cadets.';
      setError(errorMsg);
      console.error('Error fetching pending cadets:', err);
    } finally {
      setLoading(false);
    }
  };

  // Group cadets by stock item
  const groupByStock = () => {
    const grouped = {};
    
    pendingCadets.forEach(entry => {
      if (!entry.stock) return;
      
      const stockId = entry.stock.id;
      if (!grouped[stockId]) {
        grouped[stockId] = {
          stock: entry.stock,
          cadets: []
        };
      }
      grouped[stockId].cadets.push(entry.cadet);
    });
    
    return Object.values(grouped);
  };

  const groupedData = groupByStock();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-red-700">Pending Cadets</h2>

      {loading && <p className="text-center">Loading...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      {!loading && pendingCadets.length === 0 && !error && (
        <p className="text-center text-gray-600">No cadets with pending stock returns.</p>
      )}

      {!loading && pendingCadets.length > 0 && (
        <div className="space-y-8">
          {groupedData.map((group, index) => (
            <div key={index} className="bg-white shadow-md rounded-lg p-4 border border-red-300">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {group.stock.itemName} ({group.stock.itemCode})
              </h3>
              <p className="mb-4"><strong>Total Quantity:</strong> {group.stock.quantity}</p>
              
              <h4 className="text-lg font-semibold mb-2">Pending Cadets:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.cadets.map((cadet, idx) => (
                  <div key={idx} className="bg-gray-50 p-3 rounded border">
                    <h5 className="font-medium text-gray-800">
                      {cadet.fullName} ({cadet.regimentalNo})
                    </h5>
                    <p><strong>Email:</strong> {cadet.mailId}</p>
                    <p><strong>Mobile:</strong> {cadet.mobileNo}</p>
                    <p className="text-red-600 font-medium">⚠️ Return Deadline Crossed</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}