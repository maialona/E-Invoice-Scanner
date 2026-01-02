import { useState, useEffect } from 'react';
import { Scanner } from './components/Scanner';
import { ResultCard } from './components/ResultCard';
import { parseInvoice, type ParsedInvoice } from './utils/invoiceParser';
import { uploadToSheet } from './services/googleSheetService';
import { Scan, History, Settings } from 'lucide-react';

function App() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<ParsedInvoice | null>(null);
  const [history, setHistory] = useState<ParsedInvoice[]>(() => {
    const saved = localStorage.getItem('invoice_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [scriptUrl, setScriptUrl] = useState(() => localStorage.getItem('script_url') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    localStorage.setItem('invoice_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('script_url', scriptUrl);
  }, [scriptUrl]);

  const handleScanSuccess = (rawText: string) => {
    // Basic debounce/check if already scanned
    if (scannedData) return;

    // Validate and Parse
    // Note: html5-qrcode might return partial reads, but we rely on parseInvoice validation.
    // However, parseInvoice returns null if < 77 chars.
    // If we get null, we might want to keep scanning?
    // Current logic: Stop scanning once we get *something* and try to parse.
    // If invalid, we show alert.
    
    // Better UX: Only stop scanning if valid?
    // Let's try parsing first.
    const parsed = parseInvoice(rawText);
    
    if (parsed) {
      setIsScanning(false);
      setScannedData(parsed);
    } else {
      // If raw string is long enough but parsing failed, unexpected format.
      // If raw string is short, it might be the wrong QR (the second one).
      // Taiwan Invoice has 2 QRs. Encrypted one is usually the left one.
      // We should only stop if we found the valid one.
      
      // But Scanner component (html5-qrcode) usually stops on first detect if we don't control it carefully?
      // My Scanner component calls onScanSuccess.
      
      // Improvement: Pass validation to Scanner? Or handle it here.
      // If invalid, do nothing and keep scanning?
      // Since Scanner component code I wrote stops? No, it passes data.
      // Wait, ResultCard is shown only if scannedData is set.
      // If I don't set scannedData, Scanner stays open.
      // But does html5-qrcode keep scanning? "scanner.render" handles UI.
      // I need to be careful not to spam alerts.
      // For now: Only set data if valid. Ignore invalid ones (maybe log to console).
      console.log("Scanned invalid or secondary QR:", rawText);
    }
  };

  const handleUpload = async () => {
    if (!scannedData) return;
    if (!scriptUrl) {
      alert("Please set your Google Apps Script URL in settings.");
      setShowSettings(true);
      return;
    }

    setIsUploading(true);
    const success = await uploadToSheet(scannedData, scriptUrl);
    setIsUploading(false);

    if (success) {
      setHistory(prev => [scannedData, ...prev]);
      setScannedData(null);
      alert("Uploaded successfully!");
    } else {
      alert("Upload failed. Check console or URL.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-3 flex justify-between items-center sticky top-0 z-30">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Scan className="text-blue-600" />
          TW Invoice
        </h1>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
        >
          <Settings size={20} />
        </button>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white border-b border-gray-200 p-4 animate-in slide-in-from-top-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Google Apps Script URL
          </label>
          <input
            type="text"
            value={scriptUrl}
            onChange={(e) => setScriptUrl(e.target.value)}
            placeholder="https://script.google.com/..."
            className="w-full p-2 border border-gray-300 rounded-md text-sm mb-2"
          />
          <p className="text-xs text-gray-500">
            Deploy your GAS as a Web App and paste the URL here.
          </p>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 flex flex-col items-center">
        
        {!isScanning && !scannedData && (
          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md my-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center w-full">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
                <Scan size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Ready to Scan</h2>
              <p className="text-gray-500 mb-8">
                Scan your Taiwan E-Invoice QR code to digitize it instantly.
              </p>
              <button
                onClick={() => setIsScanning(true)}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl shadow-lg shadow-blue-200 transition-all transform active:scale-95"
              >
                Start Scanner
              </button>
            </div>
          </div>
        )}

        {/* History List */}
        {!isScanning && !scannedData && history.length > 0 && (
          <div className="w-full max-w-md mt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <History size={20} />
              Recent Scans
            </h3>
            <div className="space-y-3">
              {history.map((item, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="font-mono font-medium text-gray-900">{item.invoiceNumber}</p>
                    <p className="text-xs text-gray-500">{item.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${item.totalAmount}</p>
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Uploaded</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Overlays */}
      {isScanning && (
        <Scanner 
          onScanSuccess={handleScanSuccess} 
          onClose={() => setIsScanning(false)} 
        />
      )}

      {scannedData && (
        <ResultCard
          data={scannedData}
          onUpload={handleUpload}
          onRescan={() => setScannedData(null)}
          isUploading={isUploading}
        />
      )}
    </div>
  );
}

export default App;
