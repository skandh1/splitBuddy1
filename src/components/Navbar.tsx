import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Receipt, Home } from 'lucide-react';
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
            <h1 className="text-xl font-bold text-blue-600">SplitBuddy</h1>
            <div className="hidden md:flex space-x-4">
              <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600">
                <Home size={20} />
                <span>Dashboard</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600">
                <Receipt size={20} />
                <span>Bills</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600">
                <Users size={20} />
                <span>Friends</span>
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{currentUser?.displayName}</span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
            >
              <LogOut size={20} />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}