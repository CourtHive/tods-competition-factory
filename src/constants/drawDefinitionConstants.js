// stage types
export const MAIN = 'MAIN';
export const QUALIFYING = 'QUALIFYING';
export const CONSOLATION = 'CONSOLATION';

// structureType
export const ITEM = 'ITEM';
export const CONTAINER = 'CONTAINER';

// Match and Link types
export const POSITION = 'POSITION'; // participant advances based on their finishing position
export const WINNER = 'WINNER'; // participant advances based on winning a matchUp
export const LOSER = 'LOSER'; // partticipant advances based on losing a matchUp

// draw types
export const FEED_IN = 'FEED IN';
export const COMPASS = 'COMPASS';
export const PLAYOFF = 'PLAYOFF';
export const OLYMPIC = 'OLYMPIC';
export const KNOCKOUT = 'ELIMINATION';
export const ELIMINATION = 'ELIMINATION';
export const DOUBLE_ELIMINATION = 'DOUBLE ELIMINATION';
export const FMLC = 'FIRST MATCH LOSER CONSOLATION';

export const CURTIS = 'CURTIS CONSOLATION';

export const FICSF = 'FEED IN CHAMPIONSHIP TO SF';
export const FICQF = 'FEED IN CHAMPIONSHIP TO QF';
export const FICR16 = 'FEED IN CHAMPIONSHIP TO R16';
export const MFIC = 'MODIFIED FEED IN CHAMPIONSHIP';
export const FEED_IN_CHAMPIONSHIP = 'FEED IN CHAMPIONSHIP';

export const ROUND_ROBIN = 'ROUND ROBIN';
export const ROUND_ROBIN_WITH_PLAYOFF = 'ROUND ROBIN WITH PLAYOFF';

// structure naming
export const BACKDRAW = 'BACKDRAW';
export const COMPASS_ATTRIBUTES = {
  '0': { name: 'EAST', abbreviation: 'E' },
  '0-1': { name: 'WEST', abbreviation: 'W' },
  '0-2': { name: 'NORTH', abbreviation: 'N' },
  '0-3': { name: 'NORTHEAST', abbreviation: 'NE' },
  '0-1-1': { name: 'SOUTH', abbreviation: 'S' },
  '0-1-2': { name: 'SOUTHWEST', abbreviation: 'SW' },
  '0-2-1': { name: 'NORTHWEST', abbreviation: 'NW' },
  '0-1-1-1': { name: 'SOUTHEAST', abbreviation: 'SE' },
};
export const OLYMPIC_ATTRIBUTES = {
  '0': { name: 'EAST', abbreviation: 'E' },
  '0-1': { name: 'WEST', abbreviation: 'W' },
  '0-2': { name: 'NORTH', abbreviation: 'N' },
  '0-1-1': { name: 'SOUTH', abbreviation: 'S' },
};

// positioningProfile
export const DRAW = 'DRAW';
export const RANDOM = 'RANDOM';
export const TOP_DOWN = 'TOP_DOWN';
export const BOTTOM_UP = 'BOTTOM_UP';
export const WATERFALL = 'WATERFALL';

// finishingPosition determination
export const WIN_RATIO = 'WIN_RATIO';
export const ROUND_OUTCOME = 'ROUND_OUTCOME';

export const drawDefinitionConstants = {
  MAIN,
  QUALIFYING,
  CONSOLATION,
  ITEM,
  CONTAINER,
  WINNER,
  LOSER,
  FEED_IN,
  COMPASS,
  PLAYOFF,
  OLYMPIC,
  KNOCKOUT,
  ELIMINATION,
  DOUBLE_ELIMINATION,
  FMLC,
  CURTIS,
  FICSF,
  FICQF,
  FICR16,
  MFIC,
  FEED_IN_CHAMPIONSHIP,
  ROUND_ROBIN,
  ROUND_ROBIN_WITH_PLAYOFF,
  BACKDRAW,
  COMPASS_ATTRIBUTES,
  DRAW,
  RANDOM,
  TOP_DOWN,
  BOTTOM_UP,
  WATERFALL,
  WIN_RATIO,
  ROUND_OUTCOME,
};

export default drawDefinitionConstants;
