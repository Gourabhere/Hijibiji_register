export const HijibijiFlatData = {
  'Block 1': {
    floors: 12,
    flatsPerFloor: ['A', 'B', 'C', 'D', 'E'],
    occupiedFlats: [
      { floor: 2, flat: 'D' },
      { floor: 4, flat: 'D' }
    ]
  },
  'Block 2': {
    floors: 12,
    flatsPerFloor: ['A', 'B', 'C', 'D'],
    occupiedFlats: [
      { floor: 1, flat: 'A' },
      { floor: 3, flat: 'B' },
      { floor: 7, flat: 'D' }
    ]
  },
  'Block 3': {
    floors: 12,
    flatsPerFloor: ['A', 'B', 'C', 'D', 'E'],
    occupiedFlats: [
      { floor: 1, flat: 'A' }, { floor: 1, flat: 'D' },
      { floor: 2, flat: 'A' }, { floor: 2, flat: 'B' }, { floor: 2, flat: 'D' },
      { floor: 3, flat: 'A' }, { floor: 3, flat: 'B' }, { floor: 3, flat: 'D' }, { floor: 3, flat: 'E' },
      { floor: 4, flat: 'A' }, { floor: 4, flat: 'D' },
      { floor: 5, flat: 'A' }, { floor: 6, flat: 'C' },
      { floor: 9, flat: 'D' }, { floor: 10, flat: 'A' },
      { floor: 12, flat: 'A' }, { floor: 12, flat: 'D' }
    ]
  },
  'Block 4': {
    floors: 12,
    flatsPerFloor: ['A', 'B', 'C', 'D', 'E'],
    occupiedFlats: [
      { floor: 2, flat: 'E' },
      { floor: 4, flat: 'A' }, { floor: 4, flat: 'B' }, { floor: 4, flat: 'C' },
      { floor: 6, flat: 'A' }, { floor: 7, flat: 'A' },
      { floor: 8, flat: 'A' }, { floor: 8, flat: 'D' }, { floor: 8, flat: 'E' },
      { floor: 10, flat: 'E' }
    ]
  },
  'Block 5': {
    floors: 12,
    flatsPerFloor: ['A', 'B', 'C', 'D', 'E'],
    occupiedFlats: [
      { floor: 1, flat: 'A' }, { floor: 1, flat: 'C' },
      { floor: 2, flat: 'A' }, { floor: 2, flat: 'B' }, { floor: 2, flat: 'C' },
      { floor: 4, flat: 'A' }, { floor: 5, flat: 'A' }
    ]
  },
  'Block 6': {
    floors: 12,
    flatsPerFloor: ['A', 'B', 'C', 'D'],
    occupiedFlats: []
  }
};

export type BlockData = typeof HijibijiFlatData['Block 1'];
export type BlockName = keyof typeof HijibijiFlatData;
