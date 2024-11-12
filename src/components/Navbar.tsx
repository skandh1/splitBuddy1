import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Users, Receipt, Home, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="text-xl font-bold text-blue-600 hover:text-blue-700">
              SplitBuddy
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link to="/dashboard" className="flex items-center space-x-1 text-gray-600 hover:text-blue-600">
                <Home size={20} />
                <span>Dashboard</span>
              </Link>
              <Link to="/about" className="flex items-center space-x-1 text-gray-600 hover:text-blue-600">
                <Info size={20} />
                <span>About</span>
              </Link>
            </div>
          </div>
          {currentUser && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{currentUser.displayName}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
              >
                <LogOut size={20} />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}