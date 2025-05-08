import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [currentCamp, setCurrentCamp] = useState(null);
  const [registering, setRegistering] = useState(false);
  const navigate = useNavigate();

  // Registration form state
  const [registrationForm, setRegistrationForm] = useState({
    regimentalNo: '',
    gender: '',
    mobileNo: '',
    btechYear: '',
    branch: ''
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchCamps();
  }, []);

  const fetchCamps = () => {
    setLoading(true);
    axios.get('http://localhost:8080/camps/upcoming')
      .then(response => {
        setCamps(response.data);
        setError(null);
      })
      .catch(error => {
        console.error('Error fetching upcoming camps:', error);
        setError('Failed to load upcoming camps. Please try again later.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleRegisterClick = (camp) => {
    setCurrentCamp(camp);
    setShowRegistrationModal(true);
    // Reset form when opening modal
    setRegistrationForm({
      regimentalNo: '',
      gender: '',
      mobileNo: '',
      btechYear: '',
      branch: ''
    });
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRegistrationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!registrationForm.regimentalNo.trim()) {
      errors.regimentalNo = 'Regimental number is required';
    }
    
    if (!registrationForm.gender) {
      errors.gender = 'Gender is required';
    }

    if (!registrationForm.mobileNo.trim()) {
      errors.mobileNo = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(registrationForm.mobileNo)) {
      errors.mobileNo = 'Mobile number must be 10 digits';
    }

    if (!registrationForm.btechYear) {
      errors.btechYear = 'BTech year is required';
    }

    if (!registrationForm.branch.trim()) {
      errors.branch = 'Branch is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setRegistering(true);
    setError(null);
    
    try {
      const registrationData = {
        campId: currentCamp.id,
        regimentalNo: registrationForm.regimentalNo,
        gender: registrationForm.gender,
        mobileNo: registrationForm.mobileNo,
        btechYear: parseInt(registrationForm.btechYear),
        branch: registrationForm.branch
      };
      
      await axios.post('http://localhost:8080/camp-registrations/public', registrationData);
      
      setSuccess('Successfully registered for the camp!');
      setShowRegistrationModal(false);
      
      // Refresh camp data to update available slots
      fetchCamps();
      
      // Optionally redirect after some time
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  // Auto-dismiss messages after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setSuccess(null);
      setError(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [success, error]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Upcoming Camps</h1>
            <p className="mt-2 text-lg text-gray-600">
              Browse and register for upcoming NCC training camps
            </p>
          </div>
          <div className="flex gap-4">
            <Link to="/cadetRegisterPage"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
            register for account
            </Link>
            <Link 
              to="/temporary-register" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              Temporary Registration
            </Link>
            <Link 
              to="/login" 
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              Login
            </Link>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-8 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {/* Camps List */}
        {!loading && !error && (
          <>
            {camps.length > 0 ? (
              <div className="space-y-6">
                {camps.map(camp => (
                  <div key={camp.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold text-gray-900">{camp.name}</h2>
                        <p className="mt-1 text-gray-600">{camp.description}</p>
                        
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Dates</h3>
                            <p className="mt-1 text-gray-900">
                              {new Date(camp.startDate).toLocaleDateString()} - {new Date(camp.endDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Location</h3>
                            <p className="mt-1 text-gray-900">{camp.location}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Registration Deadline</h3>
                            <p className="mt-1 text-gray-900">
                              {new Date(camp.registrationDeadline).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Available Slots</h3>
                            <p className="mt-1 text-gray-900">
                              {camp.availableSlots} remaining
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <button
                          onClick={() => handleRegisterClick(camp)}
                          disabled={camp.availableSlots <= 0}
                          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${camp.availableSlots <= 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200`}
                        >
                          {camp.availableSlots <= 0 ? 'Fully Booked' : 'Register Now'}
                        </button>
                        <span className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          camp.status === 'OPEN' ? 'bg-green-100 text-green-800' : 
                          camp.status === 'CLOSED' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {camp.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No upcoming camps</h3>
                <p className="mt-1 text-sm text-gray-500">
                  There are currently no upcoming camps scheduled. Please check back later.
                </p>
              </div>
            )}
          </>
        )}

        {/* Registration Modal */}
        {showRegistrationModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-gray-900">Register for {currentCamp?.name}</h3>
                  <button
                    onClick={() => setShowRegistrationModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleRegistrationSubmit} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="regimentalNo" className="block text-sm font-medium text-gray-700">Regimental Number</label>
                    <input
                      type="text"
                      id="regimentalNo"
                      name="regimentalNo"
                      value={registrationForm.regimentalNo}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${formErrors.regimentalNo ? 'border-red-300' : 'border'}`}
                    />
                    {formErrors.regimentalNo && <p className="mt-1 text-sm text-red-600">{formErrors.regimentalNo}</p>}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                      <select
                        id="gender"
                        name="gender"
                        value={registrationForm.gender}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${formErrors.gender ? 'border-red-300' : 'border'}`}
                      >
                        <option value="">Select Gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                      {formErrors.gender && <p className="mt-1 text-sm text-red-600">{formErrors.gender}</p>}
                    </div>

                    <div>
                      <label htmlFor="mobileNo" className="block text-sm font-medium text-gray-700">Mobile Number</label>
                      <input
                        type="tel"
                        id="mobileNo"
                        name="mobileNo"
                        value={registrationForm.mobileNo}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${formErrors.mobileNo ? 'border-red-300' : 'border'}`}
                      />
                      {formErrors.mobileNo && <p className="mt-1 text-sm text-red-600">{formErrors.mobileNo}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="btechYear" className="block text-sm font-medium text-gray-700">BTech Year</label>
                      <select
                        id="btechYear"
                        name="btechYear"
                        value={registrationForm.btechYear}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${formErrors.btechYear ? 'border-red-300' : 'border'}`}
                      >
                        <option value="">Select Year</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                      </select>
                      {formErrors.btechYear && <p className="mt-1 text-sm text-red-600">{formErrors.btechYear}</p>}
                    </div>

                    <div>
                      <label htmlFor="branch" className="block text-sm font-medium text-gray-700">Branch</label>
                      <input
                        type="text"
                        id="branch"
                        name="branch"
                        value={registrationForm.branch}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${formErrors.branch ? 'border-red-300' : 'border'}`}
                      />
                      {formErrors.branch && <p className="mt-1 text-sm text-red-600">{formErrors.branch}</p>}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowRegistrationModal(false)}
                      className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={registering}
                      className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {registering ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Registering...
                        </>
                      ) : 'Complete Registration'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;