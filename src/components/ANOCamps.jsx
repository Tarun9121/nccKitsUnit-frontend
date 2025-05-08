import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ANOCamps() {
  const [form, setForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    location: '',
    description: '',
    campType: 'Training', // Default value
    noOfDays: '',
    noOfSeats: '',
    instructions: '',
  });

  const [showForm, setShowForm] = useState(false);
  const [upcomingCamps, setUpcomingCamps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUpcomingCamps();
  }, []);

  const fetchUpcomingCamps = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8080/camps/upcoming');
      setUpcomingCamps(res.data);
    } catch (err) {
      console.error('Error fetching upcoming camps:', err);
      setError('Failed to load camps. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddCamp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await axios.post('http://localhost:8080/camps', form);
      setSuccess('Camp added successfully!');
      setTimeout(() => setSuccess(null), 3000);
      resetForm();
      setShowForm(false);
      fetchUpcomingCamps();
    } catch (err) {
      console.error('Error adding camp:', err);
      setError(err.response?.data?.message || 'Failed to add camp. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      startDate: '',
      endDate: '',
      location: '',
      description: '',
      campType: 'Training',
      noOfDays: '',
      noOfSeats: '',
      instructions: '',
    });
  };

  const handleCampClick = (campId) => {
    navigate(`/camps/${campId}`);
  };

  const campTypes = ['Training', 'Adventure', 'Leadership', 'Special', 'Other'];

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Camps Management</h2>
          <p className="text-gray-600 mt-1">View and manage upcoming NCC camps</p>
        </div>
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className={`mt-4 md:mt-0 px-4 py-2 rounded-lg flex items-center ${
            showForm 
              ? 'bg-gray-600 hover:bg-gray-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d={showForm ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} 
            />
          </svg>
          {showForm ? 'Cancel' : 'Add New Camp'}
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          <p>{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
          <p>{success}</p>
        </div>
      )}

      {/* Add Camp Form */}
      {showForm && (
        <form onSubmit={handleAddCamp} className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Add New Camp</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Camp Name*</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Summer Training Camp"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Camp Type*</label>
              <select
                name="campType"
                value={form.campType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {campTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Start Date*</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">End Date*</label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Location*</label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="NCC Regional Center"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Number of Days*</label>
              <input
                type="number"
                name="noOfDays"
                value={form.noOfDays}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Available Seats*</label>
              <input
                type="number"
                name="noOfSeats"
                value={form.noOfSeats}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief about the camp activities"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Instructions for Cadets</label>
              <textarea
                name="instructions"
                value={form.instructions}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What cadets need to bring, wear, etc."
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-md text-white flex items-center ${
                loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Add Camp
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Camps List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Upcoming Camps</h3>
          <p className="text-sm text-gray-600">{upcomingCamps.length} camps scheduled</p>
        </div>

        {loading && !upcomingCamps.length ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : upcomingCamps.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-2">No upcoming camps found</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Your First Camp
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {upcomingCamps.map((camp) => (
              <li 
                key={camp.id} 
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleCampClick(camp.id)}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-blue-600">{camp.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(camp.startDate).toLocaleDateString()} - {new Date(camp.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                      {camp.campType}
                    </span>
                  </div>
                  
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {camp.location}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {camp.noOfDays} days
                    </div>
                    <div className="flex items-center text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {camp.noOfSeats} seats available
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}