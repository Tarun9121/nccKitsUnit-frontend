import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import axios from 'axios';

export default function CadetsIssuedPage() {
  const { stockId } = useParams();
  const location = useLocation();
  const [cadetsIssued, setCadetsIssued] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const stock = location.state?.stock;

  useEffect(() => {
    const fetchCadets = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`http://localhost:8080/api/issued-stocks/stock/${stockId}/cadets`);
        setCadetsIssued(res.data.map((item) => ({
          ...item.cadet,
          issueDate: item.issuedAt,
          returnDate: item.returnDate,
          quantity: item.quantity
        })));
      } catch (err) {
        console.error('Error fetching cadets:', err);
        setError('Failed to load cadet data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCadets();
  }, [stockId]);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Stock
          </Link>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            Cadets Issued with: <span className="text-blue-600">{stock?.itemName || 'Selected Item'}</span>
          </h2>
          <p className="text-gray-600 mt-1">Item Code: {stock?.itemCode || 'N/A'}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {stock?.itemType === 'retentional' ? 'Retentional' : 'Non-Retentional'}
          </span>
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

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Cadets List */}
      {!loading && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                {cadetsIssued.length} Cadet{cadetsIssued.length !== 1 ? 's' : ''} Issued
              </h3>
              <div className="mt-2 sm:mt-0 text-sm text-gray-500">
                Total Quantity Issued: {cadetsIssued.reduce((sum, cadet) => sum + cadet.quantity, 0)}
              </div>
            </div>
          </div>

          {cadetsIssued.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cadet
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Issue Info
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cadetsIssued.map((cadet) => (
                    <tr key={cadet.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {cadet.fullName.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{cadet.fullName}</div>
                            <div className="text-sm text-gray-500">{cadet.regimentalNo}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{cadet.mailId}</div>
                        <div className="text-sm text-gray-500">{cadet.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <span className="font-medium">Issued:</span> {new Date(cadet.issueDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          <span className="font-medium">Return:</span> {new Date(cadet.returnDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          <span className="font-medium">Qty:</span> {cadet.quantity}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(cadet.returnDate) > new Date() ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Returned
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No cadets issued this item</h3>
              <p className="mt-1 text-gray-500">This stock item hasn't been issued to any cadets yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}