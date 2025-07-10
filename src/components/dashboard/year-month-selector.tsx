
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Check } from 'lucide-react';
import { parse, format } from 'date-fns';

interface YearMonthSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    value: string; // e.g., "July 2024"
    onSelect: (value: string) => void;
}

export const YearMonthSelector = ({ isOpen, onClose, value, onSelect }: YearMonthSelectorProps) => {
  const initialDate = value ? parse(value, 'MMMM yyyy', new Date()) : new Date();

  const [selectedYear, setSelectedYear] = useState(initialDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(initialDate.getMonth());
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'year'
  const [yearRange, setYearRange] = useState({ start: new Date().getFullYear() - 5, end: new Date().getFullYear() + 4 });

  useEffect(() => {
    if (value) {
      try {
        const parsedDate = parse(value, 'MMMM yyyy', new Date());
        if (!isNaN(parsedDate.getTime())) {
          setSelectedYear(parsedDate.getFullYear());
          setSelectedMonth(parsedDate.getMonth());
        }
      } catch (e) {
        console.error("Error parsing date value:", e);
      }
    }
  }, [value]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthsShort = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const generateYears = () => {
    const years = [];
    for (let year = yearRange.start; year <= yearRange.end; year++) {
      years.push(year);
    }
    return years;
  };

  const handlePrevYearRange = () => {
    setYearRange(prev => ({ start: prev.start - 10, end: prev.end - 10 }));
  };

  const handleNextYearRange = () => {
    setYearRange(prev => ({ start: prev.start + 10, end: prev.end + 10 }));
  };

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setViewMode('month');
  };

  const handleConfirm = () => {
    const newDate = new Date(selectedYear, selectedMonth);
    onSelect(format(newDate, 'MMMM yyyy'));
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 50,
      rotateX: -15
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      y: 50,
      rotateX: 15,
      transition: {
        duration: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className="bg-card/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 w-full max-w-md border border-border/20 shadow-2xl"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground font-headline">
                  {viewMode === 'month' ? 'Select Month' : 'Select Year'}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {viewMode === 'month' ? selectedYear : `${yearRange.start} - ${yearRange.end}`}
                </p>
              </div>
              <motion.button
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-full transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Mode Toggle */}
            <div className="flex mb-6 bg-muted p-1 rounded-lg">
              <motion.button
                onClick={() => setViewMode('month')}
                className={`relative flex-1 py-2 px-4 rounded-md font-medium text-sm transition-colors duration-200 ${
                  viewMode === 'month' 
                    ? 'text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {viewMode === 'month' && (
                    <motion.div
                        className="absolute inset-0 bg-primary rounded-md"
                        layoutId="active-pill"
                    />
                )}
                <span className="relative z-10">Month</span>
              </motion.button>
              <motion.button
                onClick={() => setViewMode('year')}
                className={`relative flex-1 py-2 px-4 rounded-md font-medium text-sm transition-colors duration-200 ${
                  viewMode === 'year' 
                    ? 'text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {viewMode === 'year' && (
                    <motion.div
                        className="absolute inset-0 bg-primary rounded-md"
                        layoutId="active-pill"
                    />
                )}
                <span className="relative z-10">Year</span>
              </motion.button>
            </div>

            {/* Month View */}
            {viewMode === 'month' && (
              <motion.div
                key="month-view"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-3 gap-3">
                  {monthsShort.map((month, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleMonthSelect(index)}
                      className={`relative p-4 rounded-xl font-medium transition-all duration-200 text-sm ${
                        selectedMonth === index
                          ? 'bg-primary text-primary-foreground shadow-lg'
                          : 'bg-muted/50 text-foreground hover:bg-muted'
                      }`}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                        {month}
                        {selectedMonth === index && (
                          <motion.div
                            className="absolute top-1 right-1"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          >
                            <Check className="w-3 h-3" />
                          </motion.div>
                        )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Year View */}
            {viewMode === 'year' && (
              <motion.div
                key="year-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <motion.button
                    onClick={handlePrevYearRange}
                    className="p-2 hover:bg-accent rounded-full transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </motion.button>
                  <span className="font-medium text-foreground">
                    {yearRange.start} - {yearRange.end}
                  </span>
                  <motion.button
                    onClick={handleNextYearRange}
                    className="p-2 hover:bg-accent rounded-full transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </div>

                <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-2">
                  {generateYears().map((year, index) => (
                    <motion.button
                      key={year}
                      onClick={() => handleYearSelect(year)}
                      className={`p-4 rounded-xl font-medium transition-all duration-200 text-sm ${
                        selectedYear === year
                          ? 'bg-primary text-primary-foreground shadow-lg'
                          : 'bg-muted/50 text-foreground hover:bg-muted'
                      }`}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                        {year}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 mt-6">
              <motion.button
                onClick={onClose}
                className="px-5 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent transition-colors text-sm font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleConfirm}
                className="px-5 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 shadow-lg text-sm font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Confirm
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
