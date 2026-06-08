import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-rose-100 text-center max-w-sm w-full">
        <div className="text-5xl mb-4">🌸</div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Welcome, {user?.name}!
        </h1>
        <p className="text-gray-400 text-sm mb-2">{user?.email}</p>
        <p className="text-rose-400 text-sm mb-6">Dashboard coming on Day 4!</p>
        <button
          onClick={handleLogout}
          className="text-sm text-rose-500 hover:text-rose-600 font-medium border border-rose-200 px-6 py-2 rounded-xl transition"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}