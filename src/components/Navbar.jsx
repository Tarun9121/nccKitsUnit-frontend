import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const location = useLocation();
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isLoggedIn = !!auth.userId;

  const getCampsLink = () => {
    if (auth.role === 'ano') return '/ano-camps';
    if (auth.role === 'cadet') return '/camps';
    return '/';
  };

  const getStocksLink = () => {
    if (auth.role === 'ano') return '/ano-stocks';
    return '/stocks';
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-blue-700">
        NCC Portal
      </Link>

      {isLoggedIn ? (
        <div className="space-x-4 flex items-center">
          <Link to="/profile" className="hover:underline text-blue-700">Profile</Link>
          <Link to="/dashboard" className="hover:underline text-blue-700">Dashboard</Link>
          <Link to={getCampsLink()} className="hover:underline text-blue-700">Camps</Link>
          <Link to={getStocksLink()} className="hover:underline text-blue-700">Stocks</Link>

          {/* Only show this link for ANO role */}
          {auth.role === 'ano' && (
            <Link to="/cadets" className="hover:underline text-blue-700">Cadets</Link>
          )}

          <button
            onClick={handleLogout}
            className="hover:underline text-red-600"
          >
            Logout
          </button>
        </div>
      ) : (
        location.pathname !== '/login' && (
          <Link to="/login">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Login
            </button>
          </Link>
        )
      )}
    </nav>
  );
}

export default Navbar;
