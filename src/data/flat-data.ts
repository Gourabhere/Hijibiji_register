export type FloorLayouts = {
    [range: string]: string[];
};

export type BlockConfig = {
  floors: number;
  flatsPerFloor?: string[]; // Kept for simple blocks
  floorLayouts?: FloorLayouts; // For blocks with varying layouts per floor
  occupiedFlats: any[]; // This seems unused by logic, keeping as is.
};

export type SocietyConfig = {
  [blockName: string]: BlockConfig;
};

export const HijibijiFlatData: SocietyConfig = {
  'Block 1': {
    floors: 12,
    floorLayouts: {
        '1-8': ['A', 'B', 'C', 'D', 'E', 'F'],
        '9-12': ['A', 'B', 'C'],
    },
    occupiedFlats: []
  },
  'Block 2': {
    floors: 12,
    flatsPerFloor: ['A', 'B', 'C', 'D'],
    occupiedFlats: []
  },
  'Block 3': {
    floors: 12,
    flatsPerFloor: ['A', 'B', 'C', 'D', 'E'],
    occupiedFlats: []
  },
  'Block 4': {
    floors: 12,
    flatsPerFloor: ['A', 'B', 'C', 'D', 'E'],
    occupiedFlats: []
  },
  'Block 5': {
    floors: 12,
    flatsPerFloor: ['A', 'B', 'C', 'D', 'E'],
    occupiedFlats: []
  },
  'Block 6': {
    floors: 12,
    flatsPerFloor: ['A', 'B', 'C', 'D'],
    occupiedFlats: []
  }
};

export type BlockData = BlockConfig;
export type BlockName = keyof typeof HijibijiFlatData;

// Helper function to get flats for a specific floor in a block
export const getFlatsForFloor = (blockData: BlockConfig, floor: number): string[] => {
    if (blockData.floorLayouts) {
        for (const range in blockData.floorLayouts) {
            const [start, end] = range.split('-').map(Number);
            if (floor >= start && floor <= end) {
                return blockData.floorLayouts[range];
            }
        }
        return []; // No matching range found
    }
    return blockData.flatsPerFloor || []; // Fallback for simple blocks
};

// Helper function to get the total number of flats in a block
export const getTotalFlatsInBlock = (blockData: BlockConfig): number => {
    let total = 0;
    if (blockData.floorLayouts) {
        for (const range in blockData.floorLayouts) {
            const [start, end] = range.split('-').map(Number);
            const numFloors = end - start + 1;
            total += numFloors * blockData.floorLayouts[range].length;
        }
        return total;
    }
    return (blockData.flatsPerFloor?.length || 0) * blockData.floors;
};

// Helper to get a superset of all possible flat letters for the header, sorted alphabetically
export const getAllFlatLettersInBlock = (blockData: BlockConfig): string[] => {
    const allFlats = new Set<string>();
    if (blockData.floorLayouts) {
        Object.values(blockData.floorLayouts).forEach(flats => {
            flats.forEach(flat => allFlats.add(flat));
        });
    } else if (blockData.flatsPerFloor) {
        blockData.flatsPerFloor.forEach(flat => allFlats.add(flat));
    }
    return Array.from(allFlats).sort((a, b) => a.localeCompare(b));
};
