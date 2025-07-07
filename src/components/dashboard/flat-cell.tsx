"use client";

import { motion } from 'framer-motion';

interface FlatCellProps {
  blockName: string;
  floor: number;
  flat: string;
  isRegistered: boolean;
  ownerInitials: string;
  onClick: () => void;
}

export function FlatCell({ isRegistered, ownerInitials, onClick }: FlatCellProps) {
  const hasSignedUp = !isRegistered && !!ownerInitials;

  const getCellStateClasses = () => {
    if (isRegistered) {
      return 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-400 text-white shadow-lg';
    }
    if (hasSignedUp) {
      return 'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-300 text-white shadow-md';
    }
    // isVacant is the default
    return 'bg-gradient-to-br from-slate-100 to-slate-200 border-slate-300 text-slate-600 hover:border-slate-400';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.1, zIndex: 10 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        relative aspect-square flex items-center justify-center text-xs font-bold
        rounded-lg border-2 transition-all duration-300 overflow-hidden
        cursor-pointer
        ${getCellStateClasses()}
      `}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6 }}
      />
      {isRegistered && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
        />
      )}
      {hasSignedUp && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-amber-300 rounded-full border-2 border-white"
        />
      )}
      <span className="z-10 relative">{ownerInitials || '?'}</span>
    </motion.div>
  );
}
