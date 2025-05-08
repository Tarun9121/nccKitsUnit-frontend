import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [tempRegistrations, setTempRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showRegistrationsModal, setShowRegistrationsModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showAssignRegimentalModal, setShowAssignRegimentalModal] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [regimentalNo, setRegimentalNo] = useState("");
  const [notification, setNotification] = useState({
    location: "",
    date: "",
    time: "",
    instructions: "",
  });
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  const [bulkRegimentalPrefix, setBulkRegimentalPrefix] = useState("NCC2025-");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!auth.userId) {
      navigate("/login");
    }
  }, [auth.userId, navigate]);

  const fetchTemporaryRegistrations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        "http://localhost:8080/api/temporary-registrations"
      );
      setTempRegistrations(response.data);
      setShowRegistrationsModal(true);
    } catch (err) {
      console.error("Error fetching temporary registrations:", err);
      setError("Failed to load temporary registrations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAssign = async () => {
    try {
      const unassigned = tempRegistrations.filter((reg) => !reg.regimentalNo);
      const updates = unassigned.map((reg, index) => ({
        id: reg.id,
        regimentalNo: `${bulkRegimentalPrefix}${index + 1}`,
      }));

      const response = await axios.post(
        "http://localhost:8080/api/temporary-registrations/bulk-assign",
        updates
      );

      // Update local state
      const updated = tempRegistrations.map((reg) => {
        const update = updates.find((u) => u.id === reg.id);
        return update ? { ...reg, regimentalNo: update.regimentalNo } : reg;
      });

      setTempRegistrations(updated);
      setShowBulkAssignModal(false);
      setSendStatus({
        message: `Successfully assigned ${updates.length} regimental numbers`,
        type: "success"
      });
      setTimeout(() => setSendStatus(null), 5000);
    } catch (err) {
      setError({
        message: "Failed to bulk assign: " + (err.response?.data || err.message),
        type: "error"
      });
    }
  };

  const handleNotificationChange = (e) => {
    const { name, value } = e.target;
    setNotification((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAssignRegimental = (registration) => {
    setSelectedRegistration(registration);
    setRegimentalNo("");
    setShowAssignRegimentalModal(true);
  };

  const assignRegimentalNumber = async () => {
    if (!regimentalNo) {
      setError({
        message: "Regimental number is required",
        type: "error"
      });
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:8080/api/temporary-registrations/${selectedRegistration.id}/assign-regimental`,
        null,
        { params: { regimentalNo } }
      );

      // Update local state
      const updatedRegistrations = tempRegistrations.map((reg) =>
        reg.id === selectedRegistration.id ? { ...reg, regimentalNo } : reg
      );

      setTempRegistrations(updatedRegistrations);
      setShowAssignRegimentalModal(false);
      setSendStatus({
        message: `Successfully assigned regimental number ${regimentalNo}`,
        type: "success"
      });
      setTimeout(() => setSendStatus(null), 5000);
    } catch (err) {
      console.error("Error assigning regimental number:", err);
      setError({
        message: err.response?.data || "Failed to assign regimental number",
        type: "error"
      });
    }
  };

  const sendNotifications = async () => {
    if (!notification.location || !notification.date || !notification.time) {
      setError({
        message: "Location, date, and time are required fields",
        type: "error"
      });
      return;
    }

    setIsSending(true);
    setError(null);
    setSendStatus(null);

    try {
      const response = await axios.post(
        "http://localhost:8080/notifications/notify-temporary-registrations",
        notification
      );
      setSendStatus({
        message: response.data,
        type: "success"
      });
      setNotification({
        location: "",
        date: "",
        time: "",
        instructions: "",
      });
      setShowNotificationModal(false);
      setTimeout(() => setSendStatus(null), 5000);
    } catch (err) {
      console.error("Error sending notifications:", err);
      setError({
        message: err.response?.data || "Failed to send notifications. Please try again.",
        type: "error"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Filter registrations based on search term
  const filteredRegistrations = tempRegistrations.filter(reg => 
    reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.emailId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.collegeRollNO.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (reg.regimentalNo && reg.regimentalNo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-blue-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-800 font-bold text-lg">NCC</span>
            </div>
            <h1 className="text-xl font-bold">NCC Unit Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 bg-blue-700 px-3 py-1 rounded-full">
              <span className="text-sm">
                Logged in as: {auth.role?.toUpperCase()}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-full text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">
        <div className="container mx-auto">
          {/* Welcome Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Welcome, {auth.name || auth.role?.toUpperCase()}
            </h1>
            <p className="text-gray-600">
              Manage NCC cadet registrations, send notifications, and oversee camp activities.
            </p>
          </div>

          {/* Quick Stats */}
          {auth.role === "ano" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-gray-500 text-sm font-medium">Total Registrations</h3>
                    <p className="text-2xl font-bold text-gray-800">{tempRegistrations.length}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-gray-500 text-sm font-medium">Assigned Regimental</h3>
                    <p className="text-2xl font-bold text-gray-800">
                      {tempRegistrations.filter(reg => reg.regimentalNo).length}
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-gray-500 text-sm font-medium">Pending Assignments</h3>
                    <p className="text-2xl font-bold text-gray-800">
                      {tempRegistrations.filter(reg => !reg.regimentalNo).length}
                    </p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {auth.role === "ano" && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={fetchTemporaryRegistrations}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  View Cadet Registrations
                </button>

                <button
                  onClick={() => setShowNotificationModal(true)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Send Notification
                </button>

                <button
                  onClick={() => {
                    fetchTemporaryRegistrations();
                    setShowBulkAssignModal(true);
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Bulk Assign Numbers
                </button>
              </div>

              {error && (
                <div className={`mt-4 p-4 rounded-lg ${error.type === "error" ? "bg-red-100 border-l-4 border-red-500 text-red-700" : ""}`}>
                  <p>{error.message}</p>
                </div>
              )}
            </div>
          )}

          {/* Upcoming Events and Notices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-blue-700">Upcoming Events</h2>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">New</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Summer Training Camp</h3>
                    <p className="text-sm text-gray-600">June 15-30, 2025</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Stock Recheck</h3>
                    <p className="text-sm text-gray-600">July 10, 2025</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-blue-700">Recent Notices</h2>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">2 New</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-purple-100 p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">New Uniforms Arrival</h3>
                    <p className="text-sm text-gray-600">New uniforms will arrive next month</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Physical Test</h3>
                    <p className="text-sm text-gray-600">Mandatory test for all cadets</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-4 text-sm">
        <div className="container mx-auto">
          &copy; 2025 NCC Unit | All Rights Reserved
        </div>
      </footer>

      {/* Modals */}
      {/* Temporary Registrations Modal */}
      {showRegistrationsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-[95vw] h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Cadet Registrations ({tempRegistrations.length})
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search cadets..."
                      className="pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <button
                    onClick={() => setShowRegistrationsModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredRegistrations.length > 0 ? (
              <div className="flex-1 overflow-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cadet Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Academic
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRegistrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium">
                                {reg.name.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{reg.name}</div>
                              <div className="text-sm text-gray-500">{reg.gender}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{reg.emailId}</div>
                          <div className="text-sm text-gray-500">{reg.phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{reg.collegeRollNO}</div>
                          <div className="text-sm text-gray-500">{reg.branch} - Year {reg.btechYear}</div>
                        </td>
                        <td className="px-6 py-4">
                          {reg.regimentalNo ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {reg.regimentalNo}
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {!reg.regimentalNo && (
                            <button
                              onClick={() => handleAssignRegimental(reg)}
                              className="px-3 py-1 mb-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white w-full flex items-center justify-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Assign
                            </button>
                          )}
                          <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded-lg text-white w-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center p-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No registrations found</h3>
                  <p className="mt-1 text-gray-500">
                    {searchTerm ? "No matching cadets found" : "There are currently no temporary registrations"}
                  </p>
                </div>
              </div>
            )}

            <div className="border-t p-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Showing {filteredRegistrations.length} of {tempRegistrations.length} registrations
                </div>
                <div className="space-x-3">
                  <button
                    onClick={() => setShowBulkAssignModal(true)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white flex items-center"
                    disabled={tempRegistrations.filter(reg => !reg.regimentalNo).length === 0}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Bulk Assign
                  </button>
                  <button
                    onClick={() => {
                      setShowRegistrationsModal(false);
                      setShowNotificationModal(true);
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    Notify All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Assign Modal */}
      {showBulkAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Bulk Assign Regimental Numbers
                </h2>
                <button
                  onClick={() => setShowBulkAssignModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {sendStatus && (
                <div className={`mb-4 p-4 rounded-lg ${sendStatus.type === "success" ? "bg-green-100 text-green-700" : ""}`}>
                  <p>{sendStatus.message}</p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Regimental Number Prefix
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={bulkRegimentalPrefix}
                    onChange={(e) => setBulkRegimentalPrefix(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., NCC2025-"
                  />
                  <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    {bulkRegimentalPrefix}1, {bulkRegimentalPrefix}2, ...
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Will assign to {tempRegistrations.filter(reg => !reg.regimentalNo).length} unassigned cadets
                </p>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowBulkAssignModal(false)}
                  className="px-4 py-2 rounded-lg text-gray-700 border border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkAssign}
                  className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Confirm Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Regimental Number Modal */}
      {showAssignRegimentalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Assign Regimental Number
                </h2>
                <button
                  onClick={() => setShowAssignRegimentalModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {selectedRegistration && (
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-lg">
                        {selectedRegistration.name.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{selectedRegistration.name}</h3>
                      <p className="text-sm text-gray-500">{selectedRegistration.collegeRollNO}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Branch</p>
                      <p className="font-medium">{selectedRegistration.branch}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Year</p>
                      <p className="font-medium">{selectedRegistration.btechYear}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-medium">{selectedRegistration.emailId}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Phone</p>
                      <p className="font-medium">{selectedRegistration.phone}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Regimental Number*
                </label>
                <input
                  type="text"
                  value={regimentalNo}
                  onChange={(e) => setRegimentalNo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter regimental number"
                />
              </div>

              {error && (
                <div className={`mb-4 p-4 rounded-lg ${error.type === "error" ? "bg-red-100 text-red-700" : ""}`}>
                  <p>{error.message}</p>
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAssignRegimentalModal(false)}
                  className="px-4 py-2 rounded-lg text-gray-700 border border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={assignRegimentalNumber}
                  className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Assign Number
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Send Notification to Cadets
                </h2>
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {sendStatus && (
                <div className={`mb-4 p-4 rounded-lg ${sendStatus.type === "success" ? "bg-green-100 text-green-700" : ""}`}>
                  <p>{sendStatus.message}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location*
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={notification.location}
                    onChange={handleNotificationChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., NCC Campus Ground"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date*
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={notification.date}
                      onChange={handleNotificationChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time*
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={notification.time}
                      onChange={handleNotificationChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Instructions
                  </label>
                  <textarea
                    name="instructions"
                    value={notification.instructions}
                    onChange={handleNotificationChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Any special instructions for cadets..."
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Preview Message</h3>
                  <p className="text-sm text-gray-700">
                    {notification.location || "[Location]"} on {notification.date || "[Date]"} at {notification.time || "[Time]"}
                  </p>
                  {notification.instructions && (
                    <p className="text-sm text-gray-700 mt-2">
                      <span className="font-medium">Instructions:</span> {notification.instructions}
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <div className={`mt-4 p-4 rounded-lg ${error.type === "error" ? "bg-red-100 text-red-700" : ""}`}>
                  <p>{error.message}</p>
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="px-4 py-2 rounded-lg text-gray-700 border border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={sendNotifications}
                  disabled={isSending}
                  className={`px-4 py-2 rounded-lg text-white flex items-center ${
                    isSending ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isSending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Send Notification
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;