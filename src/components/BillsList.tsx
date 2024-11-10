import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { Receipt, Check, Clock, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';

interface Bill {
  id: string;
  description: string;
  totalAmount: number;
  splitAmount: number;
  paidBy: string;
  paidByUsername: string;
  participants: {
    uid: string;
    username: string;
    paid: boolean;
  }[];
  createdAt: string;
  status: string;
  paymentQrUrl?: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrUrl: string;
  amount: number;
  paidByUsername: string;
}

function PaymentModal({ isOpen, onClose, qrUrl, amount, paidByUsername }: PaymentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">Pay {paidByUsername}</h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            ${amount.toFixed(2)}
          </p>
        </div>
        <div className="flex justify-center mb-4">
          <img
            src={qrUrl}
            alt="Payment QR Code"
            className="max-w-[200px] w-full h-auto rounded-lg"
          />
        </div>
        <p className="text-sm text-gray-600 text-center mb-4">
          Scan this QR code with your payment app to pay
        </p>
        <button
          onClick={onClose}
          className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function BillsList() {
  const { currentUser } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'bills'),
      where('participants', 'array-contains', {
        uid: currentUser.uid,
        username: currentUser.displayName,
        paid: false
      })
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const billsData: Bill[] = [];
      snapshot.forEach((doc) => {
        billsData.push({ id: doc.id, ...doc.data() } as Bill);
      });
      setBills(billsData.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handlePayBill = async (billId: string) => {
    try {
      const billRef = doc(db, 'bills', billId);
      await updateDoc(billRef, {
        'participants': bills
          .find(b => b.id === billId)
          ?.participants.map(p => 
            p.uid === currentUser?.uid 
              ? { ...p, paid: true }
              : p
          )
      });
      toast.success('Payment marked as complete');
    } catch (error) {
      toast.error('Failed to update payment status');
    }
  };

  const handleShowPayment = (bill: Bill) => {
    setSelectedBill(bill);
    setShowPaymentModal(true);
  };

  return (
    <div className="space-y-4">
      {bills.map((bill) => (
        <div key={bill.id} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">{bill.description}</h3>
              <p className="text-sm text-gray-600">
                Created by {bill.paidByUsername}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">
                ${bill.splitAmount.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">
                Your share of ${bill.totalAmount.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              {bill.participants.find(p => p.uid === currentUser?.uid)?.paid ? (
                <span className="flex items-center text-green-600">
                  <Check size={16} className="mr-1" />
                  Paid
                </span>
              ) : (
                <span className="flex items-center text-orange-600">
                  <Clock size={16} className="mr-1" />
                  Pending
                </span>
              )}
            </div>
            {!bill.participants.find(p => p.uid === currentUser?.uid)?.paid && (
              <div className="flex gap-2">
                {bill.paymentQrUrl && (
                  <button
                    onClick={() => handleShowPayment(bill)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <QrCode size={16} />
                    Pay Now
                  </button>
                )}
                <button
                  onClick={() => handlePayBill(bill.id)}
                  className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <Check size={16} />
                  Mark as Paid
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
      {bills.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <Receipt size={24} className="mx-auto mb-2 text-gray-400" />
          <p className="text-gray-600">No pending bills</p>
        </div>
      )}
      
      {selectedBill && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          qrUrl={selectedBill.paymentQrUrl!}
          amount={selectedBill.splitAmount}
          paidByUsername={selectedBill.paidByUsername}
        />
      )}
    </div>
  );
}