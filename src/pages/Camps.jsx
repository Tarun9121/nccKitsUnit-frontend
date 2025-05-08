import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function Camps() {
  const { auth } = useAuth();
  const [tab, setTab] = useState('upcoming');
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const cadetId = auth.userId;

  const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  useEffect(() => {
    if (!cadetId) {
      setError('Please log in to view camps');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError('');
      setSuccess('');

      try {
        if (tab === 'upcoming') {
          const { data } = await api.get('/camps/upcoming');
          setCamps(data);
        } else {
          const { data: registrations } = await api.get(`/camp-registrations/cadet/${cadetId}`);
          
          const campDetails = await Promise.all(
            registrations.map(reg => 
              api.get(`/camps/${reg.campId}`).then(res => res.data)
            )
          );

          setCamps(campDetails.map((camp, index) => ({
            ...camp,
            registration: registrations[index],
          })));
        }
      } catch (err) {
        handleApiError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tab, cadetId]);

  const handleRegister = async (campId) => {
    setError('');
    setSuccess('');
    
    try {
      const { data: registration } = await api.post('/camp-registrations', {
        campId,
        cadetId,
      });
      
      setCamps(prevCamps =>
        prevCamps.map(camp =>
          camp.id === campId ? { ...camp, registration } : camp
        )
      );
      
      setSuccess('Successfully registered for the camp!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleApiError = (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      switch (error.response.status) {
        case 400:
          setError('Invalid request data');
          break;
        case 401:
          setError('Please log in to perform this action');
          break;
        case 404:
          setError('Resource not found');
          break;
        case 409:
          setError('You are already registered for this camp');
          break;
        case 500:
          setError('Server error. Please try again later');
          break;
        default:
          setError('Something went wrong');
      }
    } else if (error.request) {
      // The request was made but no response was received
      setError('Network error. Please check your connection');
    } else {
      // Something happened in setting up the request
      setError('An unexpected error occurred');
    }
  };

  const renderCampCard = (camp) => {
    const { registration } = camp;
    const isRegistered = !!registration;
    const isAccepted = registration?.accepted;
    const startDate = new Date(camp.startDate).toLocaleDateString();
    const endDate = new Date(camp.endDate).toLocaleDateString();

    return (
      <div key={camp.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="p-6">
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-xl font-bold text-gray-800">{camp.name}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              camp.campType === 'Training' 
                ? 'bg-blue-100 text-blue-800' 
                : camp.campType === 'Adventure' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-purple-100 text-purple-800'
            }`}>
              {camp.campType}
            </span>
          </div>

          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {startDate} - {endDate} ({camp.noOfDays} days)
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {camp.location}
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {camp.noOfSeats} seats available
            </div>
          </div>

          <div className="mb-4">
            <p className="text-gray-700 mb-2">{camp.description}</p>
            {camp.instructions && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-blue-800">Instructions:</p>
                <p className="text-sm text-blue-700">{camp.instructions}</p>
              </div>
            )}
          </div>

          {tab === 'upcoming' && !isRegistered && (
            <button
              onClick={() => handleRegister(camp.id)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Register Now
            </button>
          )}

          {isRegistered && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isAccepted 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {isAccepted ? 'Approved' : 'Pending Approval'}
                </span>
                {isAccepted && (
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View Details →
                  </button>
                )}
              </div>
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">NCC Camps</h1>
            <p className="text-gray-600 mt-1">
              {tab === 'upcoming' ? 'Explore upcoming camps' : 'View your registered camps'}
            </p>
          </div>
          
          {/* Tabs */}
          <div className="mt-4 md:mt-0 flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setTab('upcoming')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                tab === 'upcoming' 
                  ? 'bg-white shadow text-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Upcoming Camps
            </button>
            <button
              onClick={() => setTab('registered')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                tab === 'registered' 
                  ? 'bg-white shadow text-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              My Registrations
            </button>
          </div>
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

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Camps Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {camps.length > 0 ? (
              camps.map(renderCampCard)
            ) : (
              <div className="col-span-3 py-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  {tab === 'upcoming' ? 'No upcoming camps available' : 'No camp registrations found'}
                </h3>
                <p className="mt-1 text-gray-500">
                  {tab === 'upcoming' 
                    ? 'Check back later for new camp announcements' 
                    : 'Register for camps to see them here'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Camps;