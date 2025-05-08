import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function CampMembers() {
  const { campId } = useParams();
  const [campName, setCampName] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [cadetDetails, setCadetDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [viewMode, setViewMode] = useState('pending'); // 'pending', 'accepted', or 'all'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCampDetails();
  }, []);

  const fetchCampDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch camp info
      const campRes = await axios.get(`http://localhost:8080/camps/${campId}`);
      setCampName(campRes.data.name);

      // Fetch all camp registrations
      const regRes = await axios.get(`http://localhost:8080/camp-registrations/camp/${campId}/cadets`);
      setRegistrations(regRes.data);

      // Get unique cadet IDs
      const cadetIds = [...new Set(regRes.data.map(reg => reg.cadetId))];

      // Fetch cadet details for all unique cadets
      const details = {};
      await Promise.all(cadetIds.map(async id => {
        const res = await axios.get(`http://localhost:8080/api/cadets/${id}`);
        details[id] = res.data;
      }));
      
      setCadetDetails(details);
    } catch (err) {
      console.error('Error fetching camp members:', err);
      setError('Failed to load camp members. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationStatus = async (registrationId, isAccepted) => {
    try {
      await axios.put(
        `http://localhost:8080/camp-registrations/${registrationId}/accept`,
        null,
        { params: { isAccepted } }
      );
      setSuccess(`Cadet registration ${isAccepted ? 'accepted' : 'rejected'} successfully!`);
      fetchCampDetails(); // Refresh the list
    } catch (err) {
      console.error('Error updating registration status:', err);
      setError(err.response?.data?.message || `Failed to ${isAccepted ? 'accept' : 'reject'} cadet. Please try again.`);
    }
  };

  // Auto-dismiss messages
  useEffect(() => {
    const timer = setTimeout(() => {
      setSuccess(null);
      setError(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [success, error]);

  const getCurrentRegistrations = () => {
    let filteredRegistrations = [];
    switch(viewMode) {
      case 'pending': 
        filteredRegistrations = registrations.filter(reg => !reg.accepted); 
        break;
      case 'accepted': 
        filteredRegistrations = registrations.filter(reg => reg.accepted); 
        break;
      case 'all': 
        filteredRegistrations = registrations; 
        break;
      default: 
        filteredRegistrations = [];
    }

    if (searchTerm) {
      filteredRegistrations = filteredRegistrations.filter(reg => {
        const cadet = cadetDetails[reg.cadetId];
        if (!cadet) return false;
        return (
          cadet.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cadet.regimentalNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cadet.mailId?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    return filteredRegistrations;
  };

  const currentRegistrations = getCurrentRegistrations();

  // Counts for the tabs
  const pendingCount = registrations.filter(reg => !reg.accepted).length;
  const acceptedCount = registrations.filter(reg => reg.accepted).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Camps
          </Link>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Camp Members Management</h2>
          <p className="text-gray-600 mt-1">Managing registrations for: <span className="font-medium">{campName}</span></p>
        </div>
        
        {/* Search Bar */}
        <div className="mt-4 md:mt-0 w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search cadets..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
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

      {/* View Mode Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setViewMode('pending')}
          className={`px-4 py-2 rounded-lg flex items-center ${
            viewMode === 'pending' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Pending
          <span className="ml-2 bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
            {pendingCount}
          </span>
        </button>

        <button
          onClick={() => setViewMode('accepted')}
          className={`px-4 py-2 rounded-lg flex items-center ${
            viewMode === 'accepted' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Accepted
          <span className="ml-2 bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
            {acceptedCount}
          </span>
        </button>

        <button
          onClick={() => setViewMode('all')}
          className={`px-4 py-2 rounded-lg flex items-center ${
            viewMode === 'all' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          All Cadets
          <span className="ml-2 bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
            {registrations.length}
          </span>
        </button>
      </div>

      {/* Cadets Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : currentRegistrations.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Regimental No
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cadet
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {viewMode !== 'all' && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentRegistrations.map((registration) => {
                  const cadet = cadetDetails[registration.cadetId];
                  if (!cadet) return null;
                  
                  return (
                    <tr key={registration.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {cadet.regimentalNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {cadet.fullName.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{cadet.fullName}</div>
                            <div className="text-sm text-gray-500">{cadet.branch} (Year {cadet.btechYear})</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{cadet.mailId}</div>
                        <div className="text-gray-400">{cadet.mobileNo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {registration.accepted ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Accepted
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </td>
                      {viewMode !== 'all' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                          {viewMode === 'pending' && (
                            <>
                              <button
                                onClick={() => handleRegistrationStatus(registration.id, true)}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-md text-white flex items-center"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Accept
                              </button>
                              <button
                                onClick={() => handleRegistrationStatus(registration.id, false)}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-white flex items-center"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Reject
                              </button>
                            </>
                          )}
                          {viewMode === 'accepted' && (
                            <button
                              onClick={() => handleRegistrationStatus(registration.id, false)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-white flex items-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Revoke
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            {searchTerm 
              ? "No matching cadets found" 
              : viewMode === 'pending' 
                ? "No pending cadet registrations" 
                : viewMode === 'accepted' 
                  ? "No accepted cadets yet" 
                  : "No cadets registered for this camp"}
          </h3>
          <p className="mt-1 text-gray-500">
            {searchTerm 
              ? "Try a different search term" 
              : viewMode === 'pending' 
                ? "Cadet applications will appear here" 
                : viewMode === 'accepted' 
                  ? "Accept pending applications to see them here" 
                  : "Cadets need to register for this camp first"}
          </p>
        </div>
      )}
    </div>
  );
}