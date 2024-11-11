import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc, arrayUnion, getDocs, collection, query, where } from 'firebase/firestore';
import { UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddFriend() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !currentUser) return;

    setLoading(true);
    try {
      // Find user with matching username
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        toast.error('User not found');
        return;
      }

      const friendDoc = querySnapshot.docs[0];
      if (friendDoc.id === currentUser.uid) {
        toast.error('You cannot add yourself as a friend');
        return;
      }

      // Add friend to current user's friends list
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        friends: arrayUnion(friendDoc.id)
      });

      // Add current user to friend's friends list
      const friendRef = doc(db, 'users', friendDoc.id);
      await updateDoc(friendRef, {
        friends: arrayUnion(currentUser.uid)
      });

      toast.success(`Added ${username} as friend`);
      setUsername('');
    } catch (error) {
      toast.error('Failed to add friend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Add Friend</h3>
      <form onSubmit={handleAddFriend} className="space-y-4">
        <div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <UserPlus size={20} />
          Add Friend
        </button>
      </form>
    </div>
  );
}