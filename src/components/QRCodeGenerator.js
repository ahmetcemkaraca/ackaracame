import React, { useState } from 'react';
import QRCode from 'qrcode.react';
import { motion } from 'framer-motion';
import { Download, Copy, Check } from 'lucide-react';

const QRCodeGenerator = ({ data, title, size = 200 }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Kopyalama hatası:', error);
    }
  };

  const handleDownload = () => {
    const canvas = document.getElementById('qrcode-canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `${title || 'qrcode'}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <motion.div
      className="card p-6 text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-lg font-bold mb-4 text-secondary-800">
        QR Kod
      </h3>
      
      <div className="mb-4">
        <QRCode
          id="qrcode-canvas"
          value={data}
          size={size}
          level="M"
          includeMargin={true}
          renderAs="canvas"
        />
      </div>
      
      <div className="space-y-3">
        <div className="p-3 bg-secondary-50 rounded-lg">
          <p className="text-sm text-secondary-600 break-all">
            {data}
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleCopy}
            className="flex-1 btn-secondary flex items-center justify-center space-x-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Kopyalandı!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Kopyala</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleDownload}
            className="flex-1 btn-primary flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>İndir</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default QRCodeGenerator;
