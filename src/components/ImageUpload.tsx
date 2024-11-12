import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, QrCode, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
  onRemove?: () => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
}

export default function ImageUpload({
  onImageUploaded,
  currentImage,
  onRemove,
  acceptedFileTypes = ['image/png', 'image/jpeg', 'image/jpg'],
  maxFileSize = 5 * 1024 * 1024, // 5MB default
}: ImageUploadProps) {
  const [uploading, setUploading] = React.useState(false);
  const { currentUser } = useAuth();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file || !currentUser) return;

      if (file.size > maxFileSize) {
        toast.error(
          `File size should be less than ${maxFileSize / (1024 * 1024)}MB`
        );
        return;
      }

      if (!acceptedFileTypes.includes(file.type)) {
        toast.error('Please upload a valid QR code image (PNG, JPG, or JPEG)');
        return;
      }

      setUploading(true);
      try {
        // Create form data
        const formData = new FormData();
        formData.append('image', file);

        // Upload to ImgBB
        const response = await axios.post(
          'https://api.imgbb.com/1/upload',
          formData,
          {
            params: {
              key: '5b0f6d2a0b932aba4a807a7dabf8f144', // Replace with your ImgBB API key
            },
          }
        );

        if (response.data.success) {
          const imageUrl = response.data.data.url;
          onImageUploaded(imageUrl);
          toast.success('QR code uploaded successfully');
        } else {
          throw new Error('Failed to upload image');
        }
      } catch (error: any) {
        console.error('Upload error:', error);
        toast.error('Failed to upload QR code. Please try again.');
      } finally {
        setUploading(false);
      }
    },
    [currentUser, onImageUploaded, maxFileSize, acceptedFileTypes]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce(
      (acc, type) => ({ ...acc, [type]: [] }),
      {}
    ),
    maxFiles: 1,
    multiple: false,
  });

  if (currentImage) {
    return (
      <div className="relative">
        <img
          src={currentImage}
          alt="QR Code"
          className="w-full max-w-[200px] mx-auto h-auto rounded-md"
        />
        {onRemove && (
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <X size={16} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
        ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-500'
        }`}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <div className="flex flex-col items-center text-gray-600">
          <Loader className="h-8 w-8 animate-spin mb-2" />
          <p>Uploading QR code...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center text-gray-600">
          {isDragActive ? (
            <>
              <Upload className="h-8 w-8 mb-2 text-blue-500" />
              <p>Drop the QR code here</p>
            </>
          ) : (
            <>
              <QrCode className="h-8 w-8 mb-2" />
              <p>Drag & drop your QR code here, or click to select</p>
              <p className="text-sm text-gray-500 mt-1">
                Supports: JPG, JPEG, PNG (Max {maxFileSize / (1024 * 1024)}MB)
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
