import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { User, QrCode } from 'lucide-react';
import QRModal from './QRModal';

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
        // Get all friend documents in a single query
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Friends</h3>
      {friends.length === 0 ? (
        <p className="text-gray-600">No friends added yet</p>
      ) : (
        <ul className="space-y-3">
          {friends.map((friend) => (
            <li
              key={friend.uid}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md border border-gray-100"
            >
              <div className="flex items-center space-x-3">
                <User size={20} className="text-gray-500" />
                <span>{friend.username}</span>
              </div>
              <button
                onClick={() => handleShowQR(friend)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="Show QR Code"
              >
                <QrCode size={20} />
              </button>
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