import React from "react";
import { CheckCircle, X } from "lucide-react";

interface SuccessToastProps {
  show: boolean;
  message: string;
  onClose: () => void;
}

const SuccessToast: React.FC<SuccessToastProps> = ({
  show,
  message,
  onClose,
}) => {
  if (!show) return null;
  return (
    <div className="fixed right-4 top-4 animate-slide-in-right z-50">
      <div className="bg-green-50 border-l-4 border-green-500 rounded-lg shadow-lg p-4 flex items-start gap-3 min-w-[320px]">
        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-green-800 font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-green-600 hover:text-green-800"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default SuccessToast;