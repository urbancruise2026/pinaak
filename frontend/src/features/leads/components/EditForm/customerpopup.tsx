// components/pages/leads/list/EditForm/customerpopup.tsx

import React from "react";
import {
  User,
  CheckCircle,
  Sparkles,
  PartyPopper,
  Gift,
  Star,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

interface PopupData {
  customer: string;
}

interface PopupProps {
  showPopup: boolean;
  setShowPopup: (show: boolean) => void;
  popupData: PopupData;
}

const Popup: React.FC<PopupProps> = ({ showPopup, setShowPopup, popupData }) => {
  const handleNavigateToLeadTable = () => {
    setShowPopup(false);
    window.dispatchEvent(new CustomEvent("navigateToLeadTable"));
    window.dispatchEvent(new CustomEvent("leadSubmitted"));
  };

  const backdropVariants  = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalVariants :Variants = {
    hidden: { scale: 0.8, opacity: 0, rotateY: -90, y: 100 },
    visible: {
      scale: 1,
      opacity: 1,
      rotateY: 0,
      y: 0,
      transition: { type: "spring", damping: 12, stiffness: 100, duration: 0.5 },
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      rotateY: 90,
      y: -100,
      transition: { duration: 0.3 },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { delay: 0.2, duration: 0.4 } },
  };

  const buttonVariants :Variants = {
    hover: { scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 10 } },
    tap: { scale: 0.95 },
  };

  const floatingStars = {
    animate: {
      y: [0, -10, 0],
      rotate: [0, 10, -10, 0],
      transition: { duration: 2, repeat: Infinity, repeatType: "reverse" as const },
    },
  };

  const confettiVariants = {
    animate: (i: number) => ({
      y: [0, -100 - Math.random() * 50, 0],
      x: [0, (Math.random() - 0.5) * 200, 0],
      rotate: [0, 360, 720],
      opacity: [1, 1, 0],
      transition: { duration: 2, delay: i * 0.05, repeat: Infinity, repeatDelay: 3 },
    }),
  };

  if (!showPopup) return null;

  return (
    <AnimatePresence>
      {showPopup && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{
            background:
              "radial-gradient(circle at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%)",
            backdropFilter: "blur(8px)",
          }}
        >
          {/* Confetti particles */}
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={confettiVariants}
              animate="animate"
              className="fixed pointer-events-none"
              style={{
                left: `${Math.random() * 100}%`,
                top: "50%",
                width: `${8 + Math.random() * 8}px`,
                height: `${8 + Math.random() * 8}px`,
                background: `hsl(${Math.random() * 360}, 100%, 50%)`,
                borderRadius: Math.random() > 0.5 ? "50%" : "0%",
                zIndex: 45,
              }}
            />
          ))}

          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative max-w-md w-full"
          >
            {/* Glowing background effect */}
            <motion.div
              className="absolute -inset-1 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 rounded-3xl blur-xl opacity-75"
              animate={{ opacity: [0.5, 0.8, 0.5], scale: [0.98, 1.02, 0.98] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            />

            {/* Main modal content */}
            <div className="relative bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-3xl shadow-2xl overflow-hidden border border-white/50">
              {/* Decorative top bar */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />

              {/* Header */}
              <div className="relative p-6 pb-2">
                <div className="flex items-center justify-center">
                  <motion.div
                    className="flex items-center gap-2"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      <PartyPopper className="text-purple-600" size={28} fill="currentColor" />
                    </motion.div>
                    <h2 className="text-2xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      New Leads are Arrived!
                    </h2>
                  </motion.div>
                </div>
              </div>

              {/* Floating stars */}
              <motion.div className="absolute top-20 right-8" variants={floatingStars} animate="animate">
                <Star size={16} className="text-yellow-400 fill-yellow-400" />
              </motion.div>
              <motion.div
                className="absolute bottom-20 left-6"
                variants={floatingStars}
                animate="animate"
                style={{ animationDelay: "0.5s" }}
              >
                <Sparkles size={14} className="text-purple-400 fill-purple-400" />
              </motion.div>

              {/* Main content */}
              <motion.div
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                className="p-6 pt-2"
              >
                {/* Success icon - Clickable */}
                <div className="flex justify-center mb-4">
                  <motion.div
                    className="relative cursor-pointer"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNavigateToLeadTable}
                  >
                    <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-30 animate-pulse" />
                    <motion.div
                      className="relative bg-gradient-to-br from-green-400 to-emerald-500 p-4 rounded-full shadow-xl"
                      whileHover={{ scale: 1.1 }}
                    >
                      <CheckCircle size={48} className="text-white" />
                    </motion.div>
                  </motion.div>
                </div>

                {/* Lead info card - Clickable */}
                <motion.div
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-purple-100 cursor-pointer group"
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                  onClick={handleNavigateToLeadTable}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-md opacity-50"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                      />
                      <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-full shadow-lg">
                        <User className="text-white" size={28} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">
                        Lead Registered
                      </p>
                      <p className="text-xl font-bold text-gray-800">{popupData.customer}</p>
                      <motion.div
                        className="flex items-center gap-1 mt-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                      >
                        <Gift size={12} className="text-purple-500" />
                        <p className="text-xs text-gray-500">Lead has been created successfully!</p>
                      </motion.div>
                    </div>
                    <motion.div
                      initial={{ x: 0 }}
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <ArrowRight className="text-purple-500 opacity-70 group-hover:opacity-100" size={20} />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Info text */}
                <motion.div
                  className="mt-4 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-sm text-gray-600">Click anywhere to continue to Leads Table</p>
                </motion.div>

                {/* Action button */}
                <motion.div
                  className="mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <motion.button
                    onClick={handleNavigateToLeadTable}
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={20} />
                    <span>Continue to Leads Table</span>
                    <ArrowRight size={18} />
                  </motion.button>
                </motion.div>
              </motion.div>

              {/* Decorative bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Popup;