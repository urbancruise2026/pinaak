import React from 'react';
import { X } from 'lucide-react';

interface PopupData {
  dateTime: string;
  customer: string;
  startDate: string;
  endDate: string;
  days: string | number;
}

interface PopupProps {
  showPopup: boolean;
  setShowPopup: (show: boolean) => void;
  popupData: PopupData;
}

const Popup: React.FC<PopupProps> = ({ showPopup, setShowPopup, popupData }) => {
  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-4 border-blue-300 p-4 rounded-3xl max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            New Lead Arrived !!
          </h2>
          <button
            onClick={() => setShowPopup(false)}
            className="w-6 h-6 bg-red-200 hover:bg-red-300 text-red-600 hover:text-red-800 rounded-full flex items-center justify-center transition-colors duration-200"
          >
            <X size={14} />
          </button>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-lg text-gray-700">
          <div className="space-y-3">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-semibold text-gray-900">
                Date & Time:
              </span>{" "}
              <span className="ml-2">{popupData.dateTime}</span>
            </div>
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="font-semibold text-gray-900">CUS-:</span>{" "}
              <span className="ml-2">{popupData.customer}</span>
            </div>
            <div>
              <div className="flex items-center mb-2">
                <svg
                  className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="font-semibold text-gray-900">
                  Travel Dates:
                </span>
              </div>
              <div className="ml-8 space-y-1 text-sm">
                <p>Start Date: {popupData.startDate}</p>
                <p>End Date: {popupData.endDate}</p>
                <p>No. of Days: {popupData.days}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Popup;