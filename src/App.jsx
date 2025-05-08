import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import './App.css';
import Dashboard from './pages/Dashboard';
import Camps from './pages/Camps';
import StockDetails from './components/StockDetails';
import ANOCamps from './components/ANOCamps';
import CampMembers from './components/CampMembers';
import ANOStock from './components/ANOStock';
import CadetsIssuedPage from './pages/CadetsIssuedPage';
import PendingCadets from './components/PendingCadets';
import TemporaryRegistrationForm from './components/TemporaryRegistrationForm';
import CadetRegisterPage from './pages/CadetRegisterPage';
import ProfilePage from './components/Profile';
import CadetsList from './components/CadetsList';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/camps" element={<Camps />} />
        <Route path="/stocks" element={<StockDetails />} /> {/* Default Stocks route */}
        <Route path="/ano-stocks" element={<ANOStock />} /> {/* Added ANOStocks route */}
        <Route path="/ano-camps" element={<ANOCamps />} />
        <Route path="/camps/:campId" element={<CampMembers />} />
        <Route path="/cadets-issued/:stockId" element={<CadetsIssuedPage />} />
        <Route path="/cadets" element={<CadetsList />} />
        <Route path="/pending-cadets" element={<PendingCadets />} />
        <Route path="/temporary-register" element={<TemporaryRegistrationForm />} />
        <Route path="/cadetRegisterPage" element={<CadetRegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </div>
  );
}

export default App;
