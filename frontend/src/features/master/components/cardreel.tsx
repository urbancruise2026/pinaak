import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const CardReel = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSeating, setSelectedSeating] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const router = useRouter();
  const vehicleCategories = ['Car', 'Bus', 'Luxury Bus', 'Mini Bus', 'Tempo Traveller'];
  const seatingOptions = ['4 Seater', '7 Seater', '12 Seater', '25 Seater', '45 Seater'];
  const serviceOptions = ['Economy', 'Premium', 'Royal', 'Royal VIP'];
  const categoryVideos: { [key: string]: string[] } = {
    'Car': ['/assest/WhatsApp Video 2025-12-27 at 11.23.05 AM.mp4', '/assest/WhatsApp Video 2025-12-27 at 11.24.10 AM.mp4'],
    'Bus': ['/assest/WhatsApp Video 2025-12-27 at 11.24.10 AM.mp4', '/assest/WhatsApp Video 2025-12-27 at 11.23.05 AM.mp4'],
    'Luxury Bus': ['/assest/WhatsApp Video 2025-12-27 at 11.23.05 AM.mp4', '/assest/WhatsApp Video 2025-12-27 at 11.24.10 AM.mp4'],
    'Mini Bus': ['/assest/WhatsApp Video 2025-12-27 at 11.24.10 AM.mp4', '/assest/WhatsApp Video 2025-12-27 at 11.23.05 AM.mp4'],
    'Tempo Traveller': ['/assest/WhatsApp Video 2025-12-27 at 11.23.05 AM.mp4', '/assest/WhatsApp Video 2025-12-27 at 11.24.10 AM.mp4'],
  };

  const handleCardClick = (category: string) => {
    setSelectedCategory(category);
    setShowModal(true);
    setSelectedSeating(null); // Reset on new category
  };

  const handleSeatingClick = (seating: string) => {
    setSelectedSeating(seating);
  };

  const handleServiceClick = (service: string) => {
    setSelectedService(service);
    router.push(`/CardReel/videos?category=${encodeURIComponent(selectedCategory!)}&seating=${encodeURIComponent(selectedSeating!)}&service=${encodeURIComponent(service)}`);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCategory(null);
    setSelectedSeating(null);
    setSelectedService(null);
  };

  return (
    <div className="flex justify-center pt-8">
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {vehicleCategories.map((category, index) => (
          <div
            key={category}
            className={`p-6 text-center bg-white border border-gray-200 shadow-md cursor-pointer dark:bg-gray-800 dark:border-gray-700 rounded-lg min-w-[200px] ${
              selectedCategory === category ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => handleCardClick(category)}
          >
            <div className="flex items-center justify-center w-full h-32 mb-2 bg-gray-100 dark:bg-gray-700 rounded">
              {/* Placeholder for icon or image */}
              <span className="text-4xl">🚗</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{category}</h3>
          </div>
        ))}
      </div>

      {showModal && (
        <div className=" fixed inset-0 z-50 flex items-center justify-center bg-gray-100/50  " onClick={closeModal}>
          <div className="relative w-full max-w-2xl p-4 mx-4 rounded shadow-lg bg-white dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute text-2xl text-gray-500 top-2 right-2 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
              onClick={closeModal}
            >
              ×
            </button>
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Select Seating Capacity for {selectedCategory}</h2>
            <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 ${selectedSeating ? 'blur-[1px]' : ''}`}>
              {seatingOptions.map((option) => (
                <div
                  key={option}
                  className={`p-4 text-center bg-gray-100 border border-gray-200 shadow-md cursor-pointer dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 ${
                    selectedSeating === option ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleSeatingClick(option)}
                >
                  <span className="text-lg font-medium text-gray-900 dark:text-white">{option}</span>
                </div>
              ))}
            </div>
            {selectedSeating && (
              <>
                <h3 className="mt-6 mb-4 text-lg font-semibold text-gray-900 dark:text-white">Select Service Type</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                  {serviceOptions.map((option) => (
                    <div
                      key={option}
                      className="p-4 text-center bg-gray-100 border border-gray-200 shadow-md cursor-pointer dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
                      onClick={() => handleServiceClick(option)}
                    >
                      <span className="text-lg font-medium text-gray-900 dark:text-white">{option}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CardReel;