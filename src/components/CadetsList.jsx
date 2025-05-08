import { useEffect, useState } from 'react';
import axios from 'axios';

function CadetsList() {
  const [cadets, setCadets] = useState([]);
  const [filteredCadets, setFilteredCadets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCadet, setSelectedCadet] = useState(null);

  useEffect(() => {
    const fetchCadets = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/cadets');
        setCadets(response.data);
        setFilteredCadets(response.data);
      } catch (error) {
        console.error('Error fetching cadets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCadets();
  }, []);

  useEffect(() => {
    const results = cadets.filter(cadet => 
      cadet.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cadet.regimentalNo.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCadets(results);
  }, [searchTerm, cadets]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-pulse text-gray-500">Loading cadets...</div>
      </div>
    );
  }

  if (selectedCadet) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={() => setSelectedCadet(null)}
          className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to list
        </button>
        
        <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedCadet.fullName}</h2>
          <p className="text-gray-600 mb-6">{selectedCadet.regimentalNo}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700 border-b pb-2">Personal Details</h3>
              <DetailItem label="Email" value={selectedCadet.mailId} />
              <DetailItem label="Mobile" value={selectedCadet.mobileNo} />
              <DetailItem label="Gender" value={selectedCadet.gender} />
              <DetailItem label="DOB" value={selectedCadet.dateOfBirth} />
              <DetailItem label="Blood Group" value={selectedCadet.bloodGroup} />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700 border-b pb-2">Academic Details</h3>
              <DetailItem label="Branch" value={selectedCadet.branch} />
              <DetailItem label="Year" value={selectedCadet.btechYear} />
              <DetailItem label="Nationality" value={selectedCadet.nationality} />
              <DetailItem label="Religion" value={selectedCadet.religion} />
              <DetailItem label="Aadhaar No" value={selectedCadet.adhaarNo} />
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700 border-b pb-2">Address</h3>
            <p className="text-gray-600">
              {selectedCadet.address.houseNumber}, {selectedCadet.address.street}<br />
              {selectedCadet.address.city}, {selectedCadet.address.district}<br />
              {selectedCadet.address.state} - {selectedCadet.address.pinCode}
            </p>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700 border-b pb-2">Bank Details</h3>
            <DetailItem label="Bank Name" value={selectedCadet.bankDetails.bankName || 'Not provided'} />
            <DetailItem label="Account No" value={selectedCadet.bankDetails.accountNo || 'Not provided'} />
            <DetailItem label="IFSC Code" value={selectedCadet.bankDetails.ifscCode || 'Not provided'} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Cadet Directory</h1>
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search by name or regimental no"
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Regimental No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aadhaar No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCadets.length > 0 ? (
              filteredCadets.map((cadet) => (
                <tr key={cadet.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{cadet.fullName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{cadet.regimentalNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{cadet.mailId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{cadet.adhaarNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedCadet(cadet)}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No cadets found matching your search
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const DetailItem = ({ label, value }) => (
  <div className="mb-2">
    <span className="text-sm font-medium text-gray-500">{label}: </span>
    <span className="text-gray-700">{value}</span>
  </div>
);

export default CadetsList;