import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('cadet');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      email: email,
      password: password,
    };

    try {
      if (role === 'cadet') {
        const res = await axios.post('http://localhost:8080/api/cadets/login', payload);
        login(res.data.cadetId, 'cadet');
      } else {
        const res = await axios.post('http://localhost:8080/ano/login', {
          emailId: email,
          password: password,
        });
        login(res.data.id, 'ano');
      }

      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials or server error.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4">Login</h2>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="cadet">Cadet</option>
            <option value="ano">ANO</option>
          </select>

          <input
            type="email"
            className="w-full border px-3 py-2 rounded"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="w-full border px-3 py-2 rounded"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
