"use client";

import { motion } from 'framer-motion';

interface FlatCellProps {
  blockName: string;
  floor: number;
  flat: string;
  isOccupied: boolean;
  onClick: () => void;
}

export function FlatCell({ isOccupied, onClick }: FlatCellProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.1, zIndex: 10 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        relative aspect-square flex items-center justify-center text-xs font-bold cursor-pointer
        rounded-lg border-2 transition-all duration-300 overflow-hidden
        ${isOccupied 
          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400 text-white shadow-lg' 
          : 'bg-gradient-to-br from-slate-100 to-slate-200 border-slate-300 text-slate-600 hover:border-slate-400'
        }
      `}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6 }}
      />
      {isOccupied && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
        />
      )}
      <span className="z-10 relative"></span>
    </motion.div>
  );
}
