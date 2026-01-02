import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X } from 'lucide-react';

interface ScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: any) => void;
  onClose?: () => void;
}

export const Scanner = ({ onScanSuccess, onClose }: ScannerProps) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Config for the scanner
    const config = {
      fps: 25, // Increased from 10 to 25 for faster feedback
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      disableFlip: false, // Helps with front/back camera confusion
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
    };

    // Create instance
    try {
      const scanner = new Html5QrcodeScanner(
        "reader",
        config,
        /* verbose= */ false
      );
      scannerRef.current = scanner;

      scanner.render(
        (decodedText) => {
          // Success callback
          onScanSuccess(decodedText);
          // Optional: Pause or clear scanner here if needed, but usually parent handles unmount
        },
        (_errorMessage) => {
          // Failure callback (called frequently, can ignore)
          // console.log(_errorMessage);
        }
      );
    } catch (err) {
      console.error("Failed to initialize scanner", err);
      setError("Failed to start camera.");
    }

    return () => {
      if (scannerRef.current) {
         try {
           scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
         } catch (e) {
             console.error("Error clearing scanner on cleanup", e);
         }
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 z-10 p-2 bg-gray-800 text-white rounded-full opacity-70 hover:opacity-100"
        >
          <X size={24} />
        </button>
        
        <div id="reader" className="w-full h-auto min-h-[300px] bg-gray-100"></div>
        
        {error && (
          <div className="p-4 text-red-500 text-center">
            {error}
          </div>
        )}
        
        <div className="p-4 text-center text-sm text-gray-600">
          Point camera at the QR code on the invoice.
        </div>
      </div>
    </div>
  );
};
