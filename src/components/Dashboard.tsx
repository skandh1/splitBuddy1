import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';
import FriendsList from './FriendsList';
import AddFriend from './AddFriend';
import CreateBill from './CreateBill';
import BillsList from './BillsList';

export default function Dashboard() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold">Welcome, {currentUser?.displayName}!</h2>
            <CreateBill />
            <div>
              <h3 className="text-xl font-semibold mb-4">Your Bills</h3>
              <BillsList />
            </div>
          </div>
          <div className="space-y-6">
            <AddFriend />
            <FriendsList />
          </div>
        </div>
      </main>
    </div>
  );
}