import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, AlertCircle } from 'lucide-react';

const QRCodeScanner = ({ onScan, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startScanning = async () => {
    try {
      setError(null);
      setIsScanning(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      // QR kod okuma için basit bir implementasyon
      // Gerçek uygulamada jsQR veya benzeri kütüphane kullanılmalı
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      const scanFrame = () => {
        if (videoRef.current && videoRef.current.readyState === 4) {
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          
          // Burada QR kod okuma algoritması çalışacak
          // Şimdilik placeholder
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          
          // QR kod bulunduğunda onScan çağrılacak
          // onScan('detected-qr-code');
        }
        
        if (isScanning) {
          requestAnimationFrame(scanFrame);
        }
      };
      
      scanFrame();
    } catch (err) {
      setError('Kamera erişimi reddedildi veya mevcut değil.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-secondary-800">
            QR Kod Tarayıcı
          </h3>
          <button
            onClick={onClose}
            className="text-secondary-500 hover:text-secondary-700 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-600 text-sm">{error}</span>
          </div>
        )}

        <div className="mb-4">
          <div className="relative bg-secondary-100 rounded-lg overflow-hidden aspect-square">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {!isScanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-secondary-400 mx-auto mb-2" />
                  <p className="text-secondary-600 text-sm">
                    QR kod taramak için başlat butonuna basın
                  </p>
                </div>
              </div>
            )}
            
            {isScanning && (
              <div className="absolute inset-0 border-2 border-primary-500 rounded-lg">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-32 h-32 border-2 border-white rounded-lg"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-3">
          {!isScanning ? (
            <button
              onClick={startScanning}
              className="flex-1 btn-primary flex items-center justify-center space-x-2"
            >
              <Camera className="w-4 h-4" />
              <span>Tarayıcıyı Başlat</span>
            </button>
          ) : (
            <button
              onClick={stopScanning}
              className="flex-1 btn-secondary flex items-center justify-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Durdur</span>
            </button>
          )}
          
          <button
            onClick={onClose}
            className="px-4 py-2 text-secondary-600 hover:text-secondary-800 transition-colors duration-200"
          >
            İptal
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-secondary-500">
            QR kodu kameranın önüne tutun
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QRCodeScanner;
