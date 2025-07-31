// Core game engine for Galaxy Garden Crush
// Provides utilities for board generation, matching, clearing and dropping.

const Engine = (() => {
  const ROWS = 8;
  const COLS = 8;
  const TYPES = 5; // number of base tile types
  // Special codes: 0 normal, 1 row clear, 2 column clear, 3 cross clear, 4 stasis, 5 shockwave
  const SPECIAL = {
    NONE: 0,
    ROW: 1,
    COL: 2,
    CROSS: 3,
    STASIS: 4,
    SHOCK: 5
  };
  // Map tile type to special created on 4/5 match
  const TYPE_TO_SPECIAL = {
    0: SPECIAL.ROW,     // Rose Bud => Watering Can (row clear)
    1: SPECIAL.COL,     // Bonsai-prise => Photon Burst (column clear)
    2: SPECIAL.CROSS,   // Fern Spiral => Hydro Burst (cross explosion)
    3: SPECIAL.STASIS,  // Succulent Star => Stasis Field (pause timer)
    4: SPECIAL.SHOCK    // Evidence Tag => Shockwave (3x3)
  };

  // Return a random tile object
  function randomTile() {
    return { type: Math.floor(Math.random() * TYPES), special: SPECIAL.NONE, iced: 0 };
  }

  // Create a fresh board with no initial matches
  function createBoard(options = {}) {
    let board;
    do {
      board = [];
      for (let r = 0; r < ROWS; r++) {
        const row = [];
        for (let c = 0; c < COLS; c++) {
          row.push(randomTile());
        }
        board.push(row);
      }
    } while (findMatches(board).length > 0);
    return board;
  }

  // Deep clone board (for safe operations)
  function cloneBoard(board) {
    return board.map(row => row.map(cell => Object.assign({}, cell)));
  }

  // Swap two positions in board
  function swap(board, r1, c1, r2, c2) {
    const tmp = board[r1][c1];
    board[r1][c1] = board[r2][c2];
    board[r2][c2] = tmp;
  }

  // Determine if two positions are adjacent
  function isAdjacent(r1, c1, r2, c2) {
    return (Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1;
  }

  // Find all matches on the board. Returns array of match groups where each group is an array of [r,c]
  function findMatches(board) {
    const marked = [];
    for (let r = 0; r < ROWS; r++) {
      marked[r] = Array(COLS).fill(false);
    }
    // Horizontal matches
    for (let r = 0; r < ROWS; r++) {
      let runStart = 0;
      for (let c = 1; c <= COLS; c++) {
        const curr = c < COLS ? board[r][c] : null;
        const prev = board[r][c - 1];
        if (c < COLS && curr && prev && curr.type === prev.type) {
          continue;
        }
        const runEnd = c;
        const runLength = runEnd - runStart;
        if (runLength >= 3) {
          for (let i = runStart; i < runEnd; i++) {
            marked[r][i] = true;
          }
        }
        runStart = c;
      }
    }
    // Vertical matches
    for (let c = 0; c < COLS; c++) {
      let runStart = 0;
      for (let r = 1; r <= ROWS; r++) {
        const curr = r < ROWS ? board[r][c] : null;
        const prev = board[r - 1][c];
        if (r < ROWS && curr && prev && curr.type === prev.type) {
          continue;
        }
        const runEnd = r;
        const runLength = runEnd - runStart;
        if (runLength >= 3) {
          for (let i = runStart; i < runEnd; i++) {
            marked[i][c] = true;
          }
        }
        runStart = r;
      }
    }
    // Form groups (connected components) of marked cells
    const visited = [];
    for (let r = 0; r < ROWS; r++) visited[r] = Array(COLS).fill(false);
    const groups = [];
    const drc = [[1,0],[-1,0],[0,1],[0,-1]];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (marked[r][c] && !visited[r][c]) {
          // BFS to get group
          const queue = [[r,c]];
          visited[r][c] = true;
          const group = [];
          while (queue.length) {
            const [cr, cc] = queue.pop();
            group.push([cr, cc]);
            for (const [dr, dc] of drc) {
              const nr = cr + dr;
              const nc = cc + dc;
              if (nr>=0 && nr<ROWS && nc>=0 && nc<COLS && marked[nr][nc] && !visited[nr][nc]) {
                visited[nr][nc] = true;
                queue.push([nr,nc]);
              }
            }
          }
          groups.push(group);
        }
      }
    }
    return groups;
  }

  // Clear matches and create specials. Accepts groups from findMatches.
  // Returns an object with cleared positions, created specials and flags.
  function clearMatches(board, groups) {
    const cleared = [];
    const createdSpecials = [];
    let stasisTriggered = false;
    for (const group of groups) {
      const length = group.length;
      // Determine tile type (use first cell)
      const [pr, pc] = group[0];
      const baseType = board[pr][pc].type;
      let specialCreated = false;
      let specialPos = null;
      if (length >= 4) {
        // choose a cell to create special from this group
        specialPos = group[Math.floor(Math.random() * group.length)];
        specialCreated = true;
      }
      for (const [r, c] of group) {
        const cell = board[r][c];
        if (specialCreated && r === specialPos[0] && c === specialPos[1]) {
          // convert to special tile
          cell.special = TYPE_TO_SPECIAL[cell.type];
          // keep tile; do not clear; also break ice if present
          if (cell.iced > 0) cell.iced = 0;
          createdSpecials.push({ r, c, special: cell.special, type: cell.type });
        } else {
          if (cell.iced > 0) {
            // break ice only
            cell.iced = 0;
          } else {
            // remove tile
            cleared.push([r, c]);
            board[r][c] = null;
          }
        }
      }
    }
    return { cleared, createdSpecials, stasisTriggered };
  }

  // Activate special at position. Returns array of positions to clear and a flag if stasis triggered.
  function activateSpecial(board, r, c) {
    const cell = board[r][c];
    const positions = [];
    let stasis = false;
    switch (cell.special) {
      case SPECIAL.ROW:
        for (let cc = 0; cc < COLS; cc++) {
          if (cc !== c) positions.push([r, cc]);
        }
        break;
      case SPECIAL.COL:
        for (let rr = 0; rr < ROWS; rr++) {
          if (rr !== r) positions.push([rr, c]);
        }
        break;
      case SPECIAL.CROSS:
        // row and column
        for (let cc = 0; cc < COLS; cc++) {
          if (cc !== c) positions.push([r, cc]);
        }
        for (let rr = 0; rr < ROWS; rr++) {
          if (rr !== r) positions.push([rr, c]);
        }
        break;
      case SPECIAL.SHOCK:
        // 3x3 region
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
              if (!(nr === r && nc === c)) positions.push([nr, nc]);
            }
          }
        }
        break;
      case SPECIAL.STASIS:
        // Stasis: pause timer, no additional clears
        stasis = true;
        break;
      default:
        break;
    }
    return { positions, stasis };
  }

  // Drop tiles and fill empty spaces with new random tiles. Returns list of newly filled positions.
  function dropTiles(board) {
    const newPositions = [];
    for (let c = 0; c < COLS; c++) {
      let emptyCount = 0;
      for (let r = ROWS - 1; r >= 0; r--) {
        const cell = board[r][c];
        if (cell === null) {
          emptyCount++;
        } else if (emptyCount > 0) {
          // move down
          board[r + emptyCount][c] = cell;
          board[r][c] = null;
        }
      }
      // fill top with new random tiles
      for (let i = 0; i < emptyCount; i++) {
        const newTile = randomTile();
        board[i][c] = newTile;
        newPositions.push([i, c]);
      }
    }
    return newPositions;
  }

  return {
    ROWS,
    COLS,
    TYPES,
    SPECIAL,
    randomTile,
    createBoard,
    cloneBoard,
    swap,
    isAdjacent,
    findMatches,
    clearMatches,
    activateSpecial,
    dropTiles
  };
})();

// Expose Engine globally
if (typeof window !== 'undefined') {
  window.Engine = Engine;
}