import type { ParsedInvoice } from '../utils/invoiceParser';
import { Check, Loader2, RefreshCcw } from 'lucide-react';

interface ResultCardProps {
  data: ParsedInvoice;
  onUpload: () => void;
  onRescan: () => void;
  isUploading: boolean;
}

export const ResultCard = ({ data, onUpload, onRescan, isUploading }: ResultCardProps) => {
  return (
    <div className="fixed inset-0 z-40 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-green-600 p-4 text-white text-center">
          <h2 className="text-xl font-bold">Invoice Scanned!</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Invoice Number</p>
              <p className="font-mono font-bold text-lg">{data.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">Date</p>
              <p className="font-medium">{data.date}</p>
            </div>
          </div>

          <div className="border-t border-b border-gray-100 py-4 my-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Sales Amount</span>
              <span className="font-mono">${data.amount}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Tax</span>
              <span className="font-mono">${data.taxAmount}</span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold text-green-700 mt-2">
              <span>Total</span>
              <span>${data.totalAmount}</span>
            </div>
          </div>

          <div className="text-xs text-gray-400 space-y-1">
            <p>Seller ID: {data.sellerId}</p>
            <p>Buyer ID: {data.buyerId || "N/A"}</p>
            <p>Random Code: {data.description}</p>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onRescan}
              disabled={isUploading}
              className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <RefreshCcw size={18} />
              Rescan
            </button>
            <button
              onClick={onUpload}
              disabled={isUploading}
              className="flex-1 py-3 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Check size={18} />
                  Upload
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
