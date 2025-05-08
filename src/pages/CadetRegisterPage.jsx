import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CadetRegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    mailId: '',
    mobileNo: '',
    alternateMobileNo: '',
    regimentalNo: '',
    gender: '',
    dateOfBirth: '',
    adhaarNo: '',
    bloodGroup: '',
    branch: '',
    btechYear: '',
    nationality: 'Indian', // Default value
    religion: '',
    password: '',
    confirmPassword: '',
    address: {
      houseNumber: '',
      street: '',
      city: '',
      district: '',
      state: '',
      pinCode: ''
    },
    bankDetails: {
      bankName: '',
      accountNo: '',
      ifscCode: ''
    }
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Check if the field is nested in address or bankDetails
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }));
    } else if (name.startsWith('bankDetails.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const requiredFields = [
      'fullName', 'mailId', 'mobileNo', 'regimentalNo', 'gender', 
      'dateOfBirth', 'adhaarNo', 'bloodGroup', 'branch', 'btechYear', 
      'nationality', 'religion', 'password', 'confirmPassword'
    ];

    // Validate required fields
    requiredFields.forEach(field => {
      if (!formData[field]) {
        errors[field] = `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;
      }
    });

    // Validate email format
    if (formData.mailId && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.mailId)) {
      errors.mailId = 'Please enter a valid email address';
    }

    // Validate mobile numbers
    if (formData.mobileNo && !/^\d{10}$/.test(formData.mobileNo)) {
      errors.mobileNo = 'Mobile number must be 10 digits';
    }

    if (formData.alternateMobileNo && !/^\d{10}$/.test(formData.alternateMobileNo)) {
      errors.alternateMobileNo = 'Alternate mobile number must be 10 digits';
    }

    // Validate Aadhaar number
    if (formData.adhaarNo && !/^\d{12}$/.test(formData.adhaarNo)) {
      errors.adhaarNo = 'Aadhaar number must be 12 digits';
    }

    // Validate password
    if (formData.password && formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Validate address fields
    const addressFields = ['houseNumber', 'street', 'city', 'district', 'state', 'pinCode'];
    addressFields.forEach(field => {
      if (!formData.address[field]) {
        errors[`address.${field}`] = `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;
      }
    });

    if (formData.address.pinCode && !/^\d{6}$/.test(formData.address.pinCode)) {
      errors['address.pinCode'] = 'PIN code must be 6 digits';
    }

    // Validate bank details
    const bankFields = ['bankName', 'accountNo', 'ifscCode'];
    bankFields.forEach(field => {
      if (!formData.bankDetails[field]) {
        errors[`bankDetails.${field}`] = `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare the data for submission
      const submissionData = {
        ...formData,
        btechYear: parseInt(formData.btechYear),
        // Remove confirmPassword as it's not needed in the DTO
        confirmPassword: undefined
      };

      const response = await axios.post('http://localhost:8080/api/cadets/register', submissionData);
      
      setSubmitSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      setSubmitError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get error for a field
  const getError = (fieldName) => {
    return formErrors[fieldName] || 
           formErrors[`address.${fieldName}`] || 
           formErrors[`bankDetails.${fieldName}`];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Cadet Registration</h1>
            <p className="mt-2 text-gray-600">Please fill in all the required details to register as a cadet</p>
          </div>

          {/* Status Messages */}
          {submitError && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              </div>
            </div>
          )}

          {submitSuccess && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{submitSuccess}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${getError('fullName') ? 'border-red-300' : 'border'}`}
                  />
                  {getError('fullName') && <p className="mt-1 text-sm text-red-600">{getError('fullName')}</p>}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="mailId" className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    id="mailId"
                    name="mailId"
                    value={formData.mailId}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${getError('mailId') ? 'border-red-300' : 'border'}`}
                  />
                  {getError('mailId') && <p className="mt-1 text-sm text-red-600">{getError('mailId')}</p>}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="mobileNo" className="block text-sm font-medium text-gray-700">Mobile Number</label>
                  <input
                    type="tel"
                    id="mobileNo"
                    name="mobileNo"
                    value={formData.mobileNo}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${getError('mobileNo') ? 'border-red-300' : 'border'}`}
                  />
                  {getError('mobileNo') && <p className="mt-1 text-sm text-red-600">{getError('mobileNo')}</p>}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="alternateMobileNo" className="block text-sm font-medium text-gray-700">Alternate Mobile Number</label>
                  <input
                    type="tel"
                    id="alternateMobileNo"
                    name="alternateMobileNo"
                    value={formData.alternateMobileNo}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${getError('alternateMobileNo') ? 'border-red-300' : 'border'}`}
                  />
                  {getError('alternateMobileNo') && <p className="mt-1 text-sm text-red-600">{getError('alternateMobileNo')}</p>}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="regimentalNo" className="block text-sm font-medium text-gray-700">Regimental Number</label>
                  <input
                    type="text"
                    id="regimentalNo"
                    name="regimentalNo"
                    value={formData.regimentalNo}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${getError('regimentalNo') ? 'border-red-300' : 'border'}`}
                  />
                  {getError('regimentalNo') && <p className="mt-1 text-sm text-red-600">{getError('regimentalNo')}</p>}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${getError('gender') ? 'border-red-300' : 'border'}`}
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                  {getError('gender') && <p className="mt-1 text-sm text-red-600">{getError('gender')}</p>}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${getError('dateOfBirth') ? 'border-red-300' : 'border'}`}
                  />
                  {getError('dateOfBirth') && <p className="mt-1 text-sm text-red-600">{getError('dateOfBirth')}</p>}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="adhaarNo" className="block text-sm font-medium text-gray-700">Aadhaar Number</label>
                  <input
                    type="text"
                    id="adhaarNo"
                    name="adhaarNo"
                    value={formData.adhaarNo}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${getError('adhaarNo') ? 'border-red-300' : 'border'}`}
                  />
                  {getError('adhaarNo') && <p className="mt-1 text-sm text-red-600">{getError('adhaarNo')}</p>}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700">Blood Group</label>
                  <select
                    id="bloodGroup"
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${getError('bloodGroup') ? 'border-red-300' : 'border'}`}
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                  {getError('bloodGroup') && <p className="mt-1 text-sm text-red-600">{getError('bloodGroup')}</p>}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="branch" className="block text-sm font-medium text-gray-700">Branch</label>
                  <input
                    type="text"
                    id="branch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${getError('branch') ? 'border-red-300' : 'border'}`}
                  />
                  {getError('branch') && <p className="mt-1 text-sm text-red-600">{getError('branch')}</p>}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="btechYear" className="block text-sm font-medium text-gray-700">BTech Year</label>
                  <select
                    id="btechYear"
                    name="btechYear"
                    value={formData.btechYear}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${getError('btechYear') ? 'border-red-300' : 'border'}`}
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                  {getError('btechYear') && <p className="mt-1 text-sm text-red-600">{getError('btechYear')}</p>}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">Nationality</label>
                  <input
                    type="text"
                    id="nationality"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${getError('nationality') ? 'border-red-300' : 'border'}`}
                  />
                  {getError('nationality') && <p className="mt-1 text-sm text-red-600">{getError('nationality')}</p>}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="religion" className="block text-sm font-medium text-gray-700">Religion</label>
                  <input
                    type="text"
                    id="religion"
                    name="religion"
                    value={formData.religion}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${getError('religion') ? 'border-red-300' : 'border'}`}
                  />
                  {getError('religion') && <p className="mt-1 text-sm text-red-600">{getError('religion')}</p>}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${getError('password') ? 'border-red-300' : 'border'}`}
                  />
                  {getError('password') && <p className="mt-1 text-sm text-red-600">{getError('password')}</p>}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${getError('confirmPassword') ? 'border-red-300' : 'border'}`}
                  />
                  {getError('confirmPassword') && <p className="mt-1 text-sm text-red-600">{getError('confirmPassword')}</p>}
                </div>
              </div>
            </div>

            {/* Address Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Address Information</h2>
              <div className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-6">
                <div className="sm:col-span-2">
                  <label htmlFor="address.houseNumber" className="block text-sm font-medium text-gray-700">House Number/Name</label>
                  <input
                    type="text"
                    id="address.houseNumber"
                    name="address.houseNumber"
                    value={formData.address.houseNumber}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${getError('houseNumber') ? 'border-red-300' : 'border'}`}
                  />
                  {getError('houseNumber') && <p className="mt-1 text-sm text-red-600">{getError('houseNumber')}</p>}
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="address.street" className="block text-sm font-medium text-gray-700">Street</label>
                  <input
                    type="text"
                    id="address.street"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${getError('street') ? 'border-red-300' : 'border'}`}
                  />
                  {getError('street') && <p className="mt-1 text-sm text-red-600">{getError('street')}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    id="address.city"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${getError('city') ? 'border-red-300' : 'border'}`}
                  />
                  {getError('city') && <p className="mt-1 text-sm text-red-600">{getError('city')}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="address.district" className="block text-sm font-medium text-gray-700">District</label>
                  <input
                    type="text"
                    id="address.district"
                    name="address.district"
                    value={formData.address.district}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${getError('district') ? 'border-red-300' : 'border'}`}
                  />
                  {getError('district') && <p className="mt-1 text-sm text-red-600">{getError('district')}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="address.state" className="block text-sm font-medium text-gray-700">State</label>
                  <input
                    type="text"
                    id="address.state"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${getError('state') ? 'border-red-300' : 'border'}`}
                  />
                  {getError('state') && <p className="mt-1 text-sm text-red-600">{getError('state')}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="address.pinCode" className="block text-sm font-medium text-gray-700">PIN Code</label>
                  <input
                    type="text"
                    id="address.pinCode"
                    name="address.pinCode"
                    value={formData.address.pinCode}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${getError('pinCode') ? 'border-red-300' : 'border'}`}
                  />
                  {getError('pinCode') && <p className="mt-1 text-sm text-red-600">{getError('pinCode')}</p>}
                </div>
              </div>
            </div>

            {/* Bank Details Section */}
            <div className="pb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Bank Details</h2>
              <div className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="bankDetails.bankName" className="block text-sm font-medium text-gray-700">Bank Name</label>
                  <input
                    type="text"
                    id="bankDetails.bankName"
                    name="bankDetails.bankName"
                    value={formData.bankDetails.bankName}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${getError('bankName') ? 'border-red-300' : 'border'}`}
                  />
                  {getError('bankName') && <p className="mt-1 text-sm text-red-600">{getError('bankName')}</p>}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="bankDetails.accountNo" className="block text-sm font-medium text-gray-700">Account Number</label>
                  <input
                    type="text"
                    id="bankDetails.accountNo"
                    name="bankDetails.accountNo"
                    value={formData.bankDetails.accountNo}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${getError('accountNo') ? 'border-red-300' : 'border'}`}
                  />
                  {getError('accountNo') && <p className="mt-1 text-sm text-red-600">{getError('accountNo')}</p>}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="bankDetails.ifscCode" className="block text-sm font-medium text-gray-700">IFSC Code</label>
                  <input
                    type="text"
                    id="bankDetails.ifscCode"
                    name="bankDetails.ifscCode"
                    value={formData.bankDetails.ifscCode}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${getError('ifscCode') ? 'border-red-300' : 'border'}`}
                  />
                  {getError('ifscCode') && <p className="mt-1 text-sm text-red-600">{getError('ifscCode')}</p>}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering...
                  </>
                ) : 'Register'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CadetRegisterPage;