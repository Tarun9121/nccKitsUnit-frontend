import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FiEdit2, FiSave, FiX } from 'react-icons/fi';

function ProfilePage() {
  const { auth } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let response;

        if (auth.role === 'cadet') {
          response = await axios.get(`http://localhost:8080/api/cadets/${auth.userId}`);
        } else if (auth.role === 'ano') {
          response = await axios.get(`http://localhost:8080/ano/${auth.userId}`);
        }

        setProfile(response.data);
        setEditData(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (auth.userId && auth.role) {
      fetchProfile();
    }
  }, [auth]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setEditData(profile);
  };

  const handleSave = async () => {
    try {
      let response;
      if (auth.role === 'cadet') {
        response = await axios.put(`http://localhost:8080/api/cadets/${auth.userId}`, editData);
      } else if (auth.role === 'ano') {
        response = await axios.put(`http://localhost:8080/ano/${auth.userId}`, editData);
      }
      setProfile(response.data);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
  };

  const handleBankChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [name]: value
      }
    }));
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="animate-pulse text-gray-500">Loading your profile...</div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded max-w-md text-center">
        {error}
      </div>
    </div>
  );

  if (!profile) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded max-w-md text-center">
        No profile data available
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
            {!editing ? (
              <button
                onClick={handleEdit}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiEdit2 className="mr-2" /> Edit Profile
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <FiX className="mr-2" /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FiSave className="mr-2" /> Save Changes
                </button>
              </div>
            )}
          </div>

          {auth.role === 'cadet' ? (
            <div className="space-y-6">
              <ProfileSection title="Personal Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ProfileField 
                    label="Full Name" 
                    name="fullName"
                    value={editing ? editData.fullName : profile.fullName}
                    editing={editing}
                    onChange={handleChange}
                  />
                  <ProfileField 
                    label="Email" 
                    name="mailId"
                    value={editing ? editData.mailId : profile.mailId}
                    editing={editing}
                    onChange={handleChange}
                    type="email"
                  />
                  <ProfileField 
                    label="Mobile No" 
                    name="mobileNo"
                    value={editing ? editData.mobileNo : profile.mobileNo}
                    editing={editing}
                    onChange={handleChange}
                    type="tel"
                  />
                  <ProfileField 
                    label="Alternate Mobile" 
                    name="alternateMobileNo"
                    value={editing ? editData.alternateMobileNo : profile.alternateMobileNo}
                    editing={editing}
                    onChange={handleChange}
                    type="tel"
                  />
                  <ProfileField 
                    label="Regimental No" 
                    name="regimentalNo"
                    value={editing ? editData.regimentalNo : profile.regimentalNo}
                    editing={false} // Disabled for editing
                  />
                  <ProfileField 
                    label="Gender" 
                    name="gender"
                    value={editing ? editData.gender : profile.gender}
                    editing={editing}
                    onChange={handleChange}
                  />
                  <ProfileField 
                    label="Date of Birth" 
                    name="dateOfBirth"
                    value={editing ? editData.dateOfBirth : profile.dateOfBirth}
                    editing={editing}
                    onChange={handleChange}
                    type="date"
                  />
                  <ProfileField 
                    label="Aadhaar No" 
                    name="adhaarNo"
                    value={editing ? editData.adhaarNo : profile.adhaarNo}
                    editing={false} // Disabled for editing
                  />
                  <ProfileField 
                    label="Blood Group" 
                    name="bloodGroup"
                    value={editing ? editData.bloodGroup : profile.bloodGroup}
                    editing={editing}
                    onChange={handleChange}
                  />
                  <ProfileField 
                    label="Branch" 
                    name="branch"
                    value={editing ? editData.branch : profile.branch}
                    editing={editing}
                    onChange={handleChange}
                  />
                  <ProfileField 
                    label="BTech Year" 
                    name="btechYear"
                    value={editing ? editData.btechYear : profile.btechYear}
                    editing={editing}
                    onChange={handleChange}
                    type="number"
                  />
                  <ProfileField 
                    label="Nationality" 
                    name="nationality"
                    value={editing ? editData.nationality : profile.nationality}
                    editing={editing}
                    onChange={handleChange}
                  />
                  <ProfileField 
                    label="Religion" 
                    name="religion"
                    value={editing ? editData.religion : profile.religion}
                    editing={editing}
                    onChange={handleChange}
                  />
                </div>
              </ProfileSection>

              <ProfileSection title="Address">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ProfileField 
                    label="House Number" 
                    name="houseNumber"
                    value={editing ? editData.address?.houseNumber : profile.address?.houseNumber}
                    editing={editing}
                    onChange={handleAddressChange}
                  />
                  <ProfileField 
                    label="Street" 
                    name="street"
                    value={editing ? editData.address?.street : profile.address?.street}
                    editing={editing}
                    onChange={handleAddressChange}
                  />
                  <ProfileField 
                    label="City" 
                    name="city"
                    value={editing ? editData.address?.city : profile.address?.city}
                    editing={editing}
                    onChange={handleAddressChange}
                  />
                  <ProfileField 
                    label="District" 
                    name="district"
                    value={editing ? editData.address?.district : profile.address?.district}
                    editing={editing}
                    onChange={handleAddressChange}
                  />
                  <ProfileField 
                    label="State" 
                    name="state"
                    value={editing ? editData.address?.state : profile.address?.state}
                    editing={editing}
                    onChange={handleAddressChange}
                  />
                  <ProfileField 
                    label="PIN Code" 
                    name="pinCode"
                    value={editing ? editData.address?.pinCode : profile.address?.pinCode}
                    editing={editing}
                    onChange={handleAddressChange}
                  />
                </div>
              </ProfileSection>

              <ProfileSection title="Bank Details">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ProfileField 
                    label="Bank Name" 
                    name="bankName"
                    value={editing ? editData.bankDetails?.bankName : profile.bankDetails?.bankName}
                    editing={editing}
                    onChange={handleBankChange}
                  />
                  <ProfileField 
                    label="Account No" 
                    name="accountNo"
                    value={editing ? editData.bankDetails?.accountNo : profile.bankDetails?.accountNo}
                    editing={editing}
                    onChange={handleBankChange}
                  />
                  <ProfileField 
                    label="IFSC Code" 
                    name="ifscCode"
                    value={editing ? editData.bankDetails?.ifscCode : profile.bankDetails?.ifscCode}
                    editing={editing}
                    onChange={handleBankChange}
                  />
                </div>
              </ProfileSection>
            </div>
          ) : (
            <div className="space-y-6">
              <ProfileSection title="Professional Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ProfileField 
                    label="Name" 
                    name="name"
                    value={editing ? editData.name : profile.name}
                    editing={editing}
                    onChange={handleChange}
                  />
                  <ProfileField 
                    label="Designation" 
                    name="designation"
                    value={editing ? editData.designation : profile.designation}
                    editing={editing}
                    onChange={handleChange}
                  />
                  <ProfileField 
                    label="Institution" 
                    name="institution"
                    value={editing ? editData.institution : profile.institution}
                    editing={editing}
                    onChange={handleChange}
                  />
                  <ProfileField 
                    label="Department" 
                    name="department"
                    value={editing ? editData.department : profile.department}
                    editing={editing}
                    onChange={handleChange}
                  />
                  <ProfileField 
                    label="Email" 
                    name="emailId"
                    value={editing ? editData.emailId : profile.emailId}
                    editing={editing}
                    onChange={handleChange}
                    type="email"
                  />
                  <ProfileField 
                    label="Mobile No" 
                    name="mobileNo"
                    value={editing ? editData.mobileNo : profile.mobileNo}
                    editing={editing}
                    onChange={handleChange}
                    type="tel"
                  />
                </div>
              </ProfileSection>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileSection({ title, children }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function ProfileField({ label, name, value, editing, onChange, type = 'text' }) {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {editing ? (
        <input
          type={type}
          name={name}
          value={value || ''}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <p className="text-gray-800">{value || 'N/A'}</p>
      )}
    </div>
  );
}

export default ProfilePage;