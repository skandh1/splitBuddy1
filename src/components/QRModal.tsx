import React from 'react';
import QRCode from 'qrcode.react';
import { X } from 'lucide-react';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  friend: {
    username: string;
    uid: string;
  };
  amount?: number;
  billId?: string;
}

export default function QRModal({ isOpen, onClose, friend, amount, billId }: QRModalProps) {
  if (!isOpen) return null;

  const paymentData = {
    type: 'payment',
    to: friend.uid,
    username: friend.username,
    ...(amount && { amount }),
    ...(billId && { billId })
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Pay {friend.username}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex justify-center p-4 bg-white rounded-lg">
          <QRCode
            value={JSON.stringify(paymentData)}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>
        <div className="text-center mt-4 space-y-2">
          {amount && (
            <p className="font-semibold text-lg">
              Amount: ${amount.toFixed(2)}
            </p>
          )}
          <p className="text-sm text-gray-600">
            Scan this QR code to pay {friend.username}
          </p>
        </div>
      </div>
    </div>
  );
}