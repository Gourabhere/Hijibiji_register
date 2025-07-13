
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { countries, Country } from '@/data/countries';
import { Button } from './button';
import { Input } from './input';

interface PhoneInputProps {
  phone: string;
  onPhoneChange: (phone: string) => void;
  onCountryChange: (country: Country) => void;
  defaultCountryCode?: string;
}

export const PhoneInput = ({ phone, onPhoneChange, onCountryChange, defaultCountryCode = 'IN' }: PhoneInputProps) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    () => countries.find(c => c.code === defaultCountryCode) || countries[0]
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.dialCode.includes(searchQuery) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isDropdownOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isDropdownOpen]);
  
  useEffect(() => {
      onCountryChange(selectedCountry);
  }, [selectedCountry, onCountryChange]);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative flex rounded-xl border border-input bg-background shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-ring transition-all duration-200 h-12">
      <div className="relative" ref={dropdownRef}>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center px-3 py-3 border-r border-input hover:bg-muted/50 transition-colors duration-200 rounded-l-xl h-full"
        >
          <span className="text-lg mr-2">{selectedCountry.flag}</span>
          <span className="text-sm font-medium text-foreground mr-1">
            {selectedCountry.dialCode}
          </span>
          <motion.div
            animate={{ rotate: isDropdownOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </motion.div>
        </Button>

        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 mt-2 w-80 bg-popover rounded-xl shadow-lg border border-border z-50 max-h-64 overflow-hidden"
            >
              <div className="p-3 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    ref={searchRef}
                    type="text"
                    placeholder="Search countries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-input rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto">
                {filteredCountries.map((country) => (
                  <motion.button
                    key={country.code}
                    whileHover={{ backgroundColor: 'var(--accent)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCountrySelect(country)}
                    className="w-full flex items-center px-4 py-3 hover:bg-accent transition-colors duration-150 text-left"
                  >
                    <span className="text-lg mr-3">{country.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-popover-foreground truncate">
                          {country.name}
                        </span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {country.dialCode}
                        </span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Input
        type="tel"
        value={phone}
        onChange={(e) => onPhoneChange(e.target.value.replace(/\D/g, ''))}
        placeholder="Phone Number"
        className="flex-1 px-4 py-3 border-0 rounded-r-xl focus:outline-none focus:ring-0 text-foreground placeholder-muted-foreground bg-transparent h-full"
      />
    </div>
  );
};

    