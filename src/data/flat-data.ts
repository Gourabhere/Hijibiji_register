export const HijibijiFlatData = {
  'Block 1': {
    floors: 12,
    flatsPerFloor: ['A', 'B', 'C', 'D', 'E'],
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

export type BlockData = typeof HijibijiFlatData['Block 1'];
export type BlockName = keyof typeof HijibijiFlatData;
