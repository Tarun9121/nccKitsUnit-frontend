import { useState } from 'react';
import axios from 'axios';

function CampCard({ camp }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    regimentalNo: '',
    gender: '',
    mobileNo: '',
    btechYear: '',
    branch: '',
  });
  const [message, setMessage] = useState('');

  const handleRegisterClick = () => {
    setShowForm(true);
    setMessage('');
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dto = {
      campId: camp.id,
      ...formData,
      btechYear: parseInt(formData.btechYear)
    };

    try {
      const res = await axios.post('http://localhost:8080/camp-registrations/public', dto);
      setMessage(res.data);
      setShowForm(false);
    } catch (err) {
      setMessage(err.response?.data || 'Something went wrong.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-5 w-full max-w-xl relative">
      <h2 className="text-xl font-bold text-blue-800">{camp.name}</h2>
      <p className="text-gray-600">{camp.location}</p>
      <p className="text-sm text-gray-500">Dates: {camp.startDate} to {camp.endDate}</p>
      <p className="mt-2">{camp.description}</p>
      <div className="mt-3 text-sm text-gray-700">
        <p><strong>Type:</strong> {camp.campType}</p>
        <p><strong>Days:</strong> {camp.noOfDays} | <strong>Seats:</strong> {camp.noOfSeats}</p>
        <p className="mt-2 text-gray-600 italic">{camp.instructions}</p>
      </div>

      <button
        onClick={handleRegisterClick}
        className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
      >
        Register
      </button>

      {message && (
        <p className="mt-3 text-sm font-medium text-blue-600">{message}</p>
      )}

      {/* Registration Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Register for {camp.name}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                name="regimentalNo"
                placeholder="Regimental No"
                value={formData.regimentalNo}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              />
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
              </select>
              <input
                type="text"
                name="mobileNo"
                placeholder="Mobile No"
                value={formData.mobileNo}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              />
              <input
                type="number"
                name="btechYear"
                placeholder="BTech Year"
                value={formData.btechYear}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              />
              <input
                type="text"
                name="branch"
                placeholder="Branch"
                value={formData.branch}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border rounded text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CampCard;
