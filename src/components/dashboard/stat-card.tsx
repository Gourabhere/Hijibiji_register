"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle: string;
  color: string;
}

export function StatCard({ icon: Icon, title, value, subtitle, color }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className={`bg-gradient-to-br ${color} p-6 rounded-2xl shadow-lg border border-white/20 backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-1 font-headline">{value}</p>
          {subtitle && <p className="text-white/60 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className="bg-white/20 p-3 rounded-full">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
}
