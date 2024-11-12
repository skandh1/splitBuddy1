import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, doc, onSnapshot } from 'firebase/firestore';
import { Receipt, QrCode, Check, User } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUpload from './ImageUpload';

interface Friend {
  username: string;
  uid: string;
}

export default function CreateBill() {
  const { currentUser } = useAuth();
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [qrImage, setQrImage] = useState('');

  useEffect(() => {
    if (!currentUser) return;

    // Listen to changes in the current user's document
    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, async (docSnapshot) => {
      if (!docSnapshot.exists()) return;

      const userData = docSnapshot.data();
      const friendIds = userData?.friends || [];

      // Listen to all friend documents in real-time
      const friendsUnsubscribe = onSnapshot(
        collection(db, 'users'),
        (snapshot) => {
          const friendsData: Friend[] = [];
          snapshot.forEach((doc) => {
            if (friendIds.includes(doc.id)) {
              friendsData.push({
                username: doc.data().username,
                uid: doc.id
              });
            }
          });
          setFriends(friendsData);
          
          // Update selected friends to remove any that are no longer in friends list
          setSelectedFriends(prev => 
            prev.filter(selected => 
              friendsData.some(friend => friend.uid === selected.uid)
            )
          );
        }
      );

      return () => friendsUnsubscribe();
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !totalAmount || selectedFriends.length === 0) {
      toast.error('Please fill in all fields and select at least one friend');
      return;
    }

    if (!qrImage) {
      toast.error('Please upload your payment QR code');
      return;
    }

    setLoading(true);
    try {
      const amount = parseFloat(totalAmount);
      const splitAmount = amount / (selectedFriends.length + 1);

      const billData = {
        description,
        totalAmount: amount,
        splitAmount,
        paidBy: currentUser?.uid,
        paidByUsername: currentUser?.displayName,
        participants: [
          ...selectedFriends.map(f => ({
            uid: f.uid,
            username: f.username,
            paid: false
          })),
          {
            uid: currentUser?.uid,
            username: currentUser?.displayName,
            paid: true
          }
        ],
        createdAt: new Date().toISOString(),
        status: 'pending',
        paymentQrUrl: qrImage
      };

      await addDoc(collection(db, 'bills'), billData);
      toast.success('Bill created successfully');
      setDescription('');
      setTotalAmount('');
      setSelectedFriends([]);
      setQrImage('');
    } catch (error) {
      toast.error('Failed to create bill');
    } finally {
      setLoading(false);
    }
  };

  const toggleFriend = (friend: Friend) => {
    setSelectedFriends(prev => 
      prev.some(f => f.uid === friend.uid)
        ? prev.filter(f => f.uid !== friend.uid)
        : [...prev, friend]
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Receipt size={20} />
        Create New Bill
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Dinner at Restaurant"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Amount
          </label>
          <input
            type="number"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment QR Code
          </label>
          <div className="mb-2 flex items-center gap-2">
            <QrCode size={20} />
            <span className="text-sm text-gray-600">Upload your payment QR code (UPI, PayPal, etc.)</span>
          </div>
          <ImageUpload
            onImageUploaded={setQrImage}
            currentImage={qrImage}
            onRemove={() => setQrImage('')}
            acceptedFileTypes={['image/png', 'image/jpeg', 'image/jpg']}
            maxFileSize={5 * 1024 * 1024}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Split with
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {friends.length === 0 ? (
              <p className="text-sm text-gray-500 p-2 bg-gray-50 rounded-md">No friends added yet</p>
            ) : (
              friends.map((friend) => (
                <button
                  key={friend.uid}
                  type="button"
                  onClick={() => toggleFriend(friend)}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-md transition-colors ${
                    selectedFriends.some(f => f.uid === friend.uid)
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                  } border`}
                  disabled={loading}
                >
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    <span>{friend.username}</span>
                  </div>
                  {selectedFriends.some(f => f.uid === friend.uid) && (
                    <Check size={16} />
                  )}
                </button>
              ))
            )}
          </div>
          {selectedFriends.length > 0 && (
            <p className="text-sm text-blue-600 mt-2">
              Selected: {selectedFriends.map(f => f.username).join(', ')}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Receipt size={20} />
          Create Bill
        </button>
      </form>
    </div>
  );
}