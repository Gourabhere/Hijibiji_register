
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Building } from 'lucide-react';
import type { BlockData, BlockName } from '@/data/flat-data';
import { getFlatsForFloor, getTotalFlatsInBlock, getAllFlatLettersInBlock } from '@/data/flat-data';
import { FlatCell } from './flat-cell';
import type { FlatData } from './dashboard-client';

interface BlockCardProps {
  blockName: BlockName;
  blockData: BlockData;
  allFlatData: Record<string, FlatData>;
  onFlatClick: (blockName: BlockName, floor: number, flat: string) => void;
}

export function BlockCard({ blockName, blockData, allFlatData, onFlatClick }: BlockCardProps) {
    const blockNumber = blockName.replace('Block ', '');

    const registeredCount = Object.keys(allFlatData).filter(key => {
        const parts = key.match(/^(\d+)([A-Z])(\d+)$/);
        return parts && parts[1] === blockNumber && allFlatData[key].registered;
    }).length;

    const totalFlats = getTotalFlatsInBlock(blockData);
    const registrationRate = totalFlats > 0 ? (registeredCount / totalFlats) * 100 : 0;
    const allFlatLetters = getAllFlatLettersInBlock(blockData);

    const getOwnerInitials = (name: string | undefined) => {
        if (!name) return '';
        return name
            .split(' ')
            .map((n) => n[0])
            .filter(c => c && c.match(/[a-zA-Z]/))
            .slice(0, 2)
            .join('')
            .toUpperCase();
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -8 }}
        className="bg-card/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-border/20"
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-bold text-foreground font-headline">{blockName}</h3>
            <p className="text-muted-foreground text-sm">
              {registeredCount}/{totalFlats} registered ({registrationRate.toFixed(1)}%)
            </p>
          </div>
          <div className="text-right">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <Building className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
        </div>

        <div 
          className="grid gap-1 mb-4" 
          style={{ gridTemplateColumns: `2rem repeat(${allFlatLetters.length}, minmax(0, 1fr))` }}
        >
          <div className="text-center text-xs font-semibold text-muted-foreground p-1"></div>
          {allFlatLetters.map(flat => (
            <div key={flat} className="text-center text-xs font-semibold text-muted-foreground p-1">
              {flat}
            </div>
          ))}
          
          {Array.from({ length: blockData.floors }, (_, i) => blockData.floors - i).map(floor => {
            const flatsOnThisFloor = getFlatsForFloor(blockData, floor);
            return (
              <React.Fragment key={floor}>
                <div className="flex items-center justify-center text-center text-xs font-semibold text-muted-foreground p-1">
                  {floor}
                </div>
                {allFlatLetters.map(flatLetter => {
                    if (flatsOnThisFloor.includes(flatLetter)) {
                        const flatId = `${blockNumber}${flatLetter}${floor}`;
                        const currentFlatData = allFlatData[flatId];
                        const isRegistered = !!currentFlatData?.registered;
                        const ownerName = currentFlatData?.ownerName || '';
                        const ownerInitials = getOwnerInitials(ownerName);
                        const existsInSheet = currentFlatData !== undefined;

                        return (
                          <FlatCell
                            key={`${floor}-${flatLetter}`}
                            blockName={blockName}
                            floor={floor}
                            flat={flatLetter}
                            isRegistered={isRegistered}
                            ownerInitials={ownerInitials}
                            ownerName={ownerName}
                            flatId={flatId}
                            existsInSheet={existsInSheet}
                            onClick={() => onFlatClick(blockName, floor, flatLetter)}
                          />
                        );
                    } else {
                        // Render an empty placeholder for non-existent flats
                        return <div key={`${floor}-${flatLetter}`} className="aspect-square" />;
                    }
                })}
              </React.Fragment>
            );
          })}
        </div>

        <div className="bg-muted/50 rounded-lg p-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Registration Rate</span>
            <span className="font-bold text-foreground">{registrationRate.toFixed(1)}%</span>
          </div>
          <div className="mt-1 bg-background rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${registrationRate}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-600"
            />
          </div>
        </div>
      </motion.div>
    );
};
