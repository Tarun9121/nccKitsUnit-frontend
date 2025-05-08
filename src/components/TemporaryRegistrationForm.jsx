import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function TemporaryRegistrationForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    emailId: '',
    gender: '',
    phone: '',
    phoneNo: '',
    fatherName: '',
    fatherNo: '',
    fatherIncome: '',
    banckAccount: '',
    address: '',
    adhaarNo: '',
    bloodGroup: '',
    btechYear: '',
    branch: '',
    height: '',
    weight: '',
    collegeRollNO: '',
    isACertificate: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Format phoneNo as LocalDate (assuming it's meant to be a date)
      const submissionData = {
        ...formData,
        phoneNo: formData.phoneNo ? new Date(formData.phoneNo).toISOString() : null
      };

      const response = await axios.post(
        'http://localhost:8080/api/temporary-registrations',
        submissionData
      );

      setSuccess('Temporary registration successful! You will receive further instructions via email.');
      setFormData({
        name: '',
        emailId: '',
        gender: '',
        phone: '',
        phoneNo: '',
        fatherName: '',
        fatherNo: '',
        fatherIncome: '',
        banckAccount: '',
        address: '',
        adhaarNo: '',
        bloodGroup: '',
        btechYear: '',
        branch: '',
        height: '',
        weight: '',
        collegeRollNO: '',
        isACertificate: false
      });

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">
        NCC Cadet Temporary Registration
      </h2>
      
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
              Personal Information
            </h3>
            
            <div>
              <label className="block text-gray-700 mb-1">Full Name*</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Email*</label>
              <input
                type="email"
                name="emailId"
                value={formData.emailId}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Gender*</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Phone Number*</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Date of Birth*</label>
              <input
                type="date"
                name="phoneNo"
                value={formData.phoneNo}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          {/* Family Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
              Family Information
            </h3>
            
            <div>
              <label className="block text-gray-700 mb-1">Father's Name*</label>
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Father's Phone Number</label>
              <input
                type="tel"
                name="fatherNo"
                value={formData.fatherNo}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Father's Income</label>
              <input
                type="text"
                name="fatherIncome"
                value={formData.fatherIncome}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Bank Account Number</label>
              <input
                type="text"
                name="banckAccount"
                value={formData.banckAccount}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Address*</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                rows="3"
                required
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Academic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
              Academic Information
            </h3>
            
            <div>
              <label className="block text-gray-700 mb-1">Aadhaar Number*</label>
              <input
                type="text"
                name="adhaarNo"
                value={formData.adhaarNo}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Blood Group</label>
              <input
                type="text"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">BTech Year*</label>
              <select
                name="btechYear"
                value={formData.btechYear}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Year</option>
                <option value="1">First Year</option>
                <option value="2">Second Year</option>
                <option value="3">Third Year</option>
                <option value="4">Fourth Year</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Branch*</label>
              <input
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">College Roll Number*</label>
              <input
                type="text"
                name="collegeRollNO"
                value={formData.collegeRollNO}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          {/* Physical Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
              Physical Information
            </h3>
            
            <div>
              <label className="block text-gray-700 mb-1">Height (cm)*</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                step="0.1"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Weight (kg)*</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                step="0.1"
                required
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isACertificate"
                checked={formData.isACertificate}
                onChange={handleChange}
                className="mr-2"
              />
              <label className="text-gray-700">
                I have an A Certificate (if applicable)
              </label>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg shadow-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Processing...' : 'Submit Temporary Registration'}
          </button>
        </div>
      </form>
    </div>
  );
}