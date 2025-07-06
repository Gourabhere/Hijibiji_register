"use client";

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface FloatingActionButtonProps {
    icon: LucideIcon;
    onClick: () => void;
    className?: string;
    tooltip: string;
}

export function FloatingActionButton({ icon: Icon, onClick, className = "", tooltip }: FloatingActionButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white font-medium transition-all duration-300 ${className}`}
      title={tooltip}
    >
      <Icon className="w-6 h-6" />
    </motion.button>
  );
}
