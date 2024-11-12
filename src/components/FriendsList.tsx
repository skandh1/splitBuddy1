import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, onSnapshot, collection, query, where, getDocs, updateDoc, arrayRemove } from 'firebase/firestore';
import { User, QrCode, UserMinus } from 'lucide-react';
import QRModal from './QRModal';
import toast from 'react-hot-toast';

interface FriendData {
  username: string;
  uid: string;
}

export default function FriendsList() {
  const { currentUser } = useAuth();
  const [friends, setFriends] = useState<FriendData[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<FriendData | null>(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = onSnapshot(doc(db, 'users', currentUser.uid), async (docSnapshot) => {
      const userData = docSnapshot.data();
      const friendIds = userData?.friends || [];

      if (friendIds.length > 0) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('__name__', 'in', friendIds));
        const querySnapshot = await getDocs(q);
        
        const friendsData: FriendData[] = [];
        querySnapshot.forEach((doc) => {
          friendsData.push({
            username: doc.data().username,
            uid: doc.id
          });
        });
        
        setFriends(friendsData);
      } else {
        setFriends([]);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleShowQR = (friend: FriendData) => {
    setSelectedFriend(friend);
    setShowQR(true);
  };

  const handleRemoveFriend = async (friend: FriendData) => {
    try {
      // Remove friend from current user's list
      const userRef = doc(db, 'users', currentUser!.uid);
      await updateDoc(userRef, {
        friends: arrayRemove(friend.uid)
      });

      // Remove current user from friend's list
      const friendRef = doc(db, 'users', friend.uid);
      await updateDoc(friendRef, {
        friends: arrayRemove(currentUser!.uid)
      });

      toast.success(`Removed ${friend.username} from friends`);
    } catch (error) {
      toast.error('Failed to remove friend');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Friends</h3>
      {friends.length === 0 ? (
        <p className="text-gray-600 text-center py-4">No friends added yet</p>
      ) : (
        <ul className="space-y-3">
          {friends.map((friend) => (
            <li
              key={friend.uid}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md border border-gray-100 group"
            >
              <div className="flex items-center space-x-3">
                <User size={20} className="text-gray-500" />
                <span>{friend.username}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleShowQR(friend)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title="Show QR Code"
                >
                  <QrCode size={20} />
                </button>
                <button
                  onClick={() => handleRemoveFriend(friend)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove Friend"
                >
                  <UserMinus size={20} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      
      {selectedFriend && (
        <QRModal
          isOpen={showQR}
          onClose={() => setShowQR(false)}
          friend={selectedFriend}
        />
      )}
    </div>
  );
}