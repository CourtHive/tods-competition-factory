import { definedAttributes } from '@Tools/definedAttributes';
import { isConvertableInteger } from '@Tools/math';
import { isString } from '@Tools/objects';

// Constants
import { SET, NOAD, TIMED, MATCH_ROOTS, sectionTypes, AGGR, CONSECUTIVE } from '@Constants/matchUpFormatConstants';

type TiebreakFormat = {
  tiebreakTo: number;
  modifier?: string;
  NoAD?: boolean;
  invalid?: boolean;
};

type SetFormat = {
  tiebreakFormat?: TiebreakFormat;
  tiebreakSet?: TiebreakFormat;
  tiebreakAt?: string | number;
  noTiebreak?: boolean;
  modifier?: string;
  minutes?: number;
  timed?: boolean;
  based?: string;
  NoAD?: boolean;
  setTo?: number;
};

type SetFormatResult = SetFormat | undefined | false;

type GameFormat =
  | {
      type: 'AGGR';
    }
  | {
      type: 'CONSECUTIVE';
      count: number;
    };

export type ParsedFormat = {
  matchRoot?: string; // only included when NOT 'SET' (backward compat)
  aggregate?: boolean; // only included when true (match-level A mod)
  matchMods?: string[]; // raw unknown modifiers for forward compat
  finalSetFormat?: any;
  simplified?: boolean;
  exactly?: number;
  setFormat?: any;
  bestOf?: number;
  gameFormat?: GameFormat; // for -G: section
};

export function parse(matchUpFormatCode: string): ParsedFormat | undefined {
  if (isString(matchUpFormatCode)) {
    const type =
      (matchUpFormatCode.startsWith('T') && TIMED) ||
      (MATCH_ROOTS.some((root) => matchUpFormatCode.startsWith(root)) && SET) ||
      '';

    if (type === TIMED) {
      const setFormat = parseTimedSet(matchUpFormatCode);
      const parsedFormat = {
        simplified: true,
        setFormat,
        bestOf: 1,
      };
      if (setFormat) return parsedFormat;
    }
    if (type === SET) return parseMatchFormat(matchUpFormatCode);
  }

  return undefined;
}

// Parse the head token (e.g., "SET7XA", "HAL2A", "QTR4A")
function parseMatchSpec(head: string):
  | {
      matchRoot: string;
      count: number;
      exactly: boolean;
      aggregate: boolean;
      matchMods: string[];
    }
  | undefined {
  // Find which root prefix matches
  const matchRoot = MATCH_ROOTS.find((root) => head.startsWith(root));
  if (!matchRoot) return undefined;

  const rest = head.slice(matchRoot.length);
  const match = /^(\d+)([A-Z]*)$/.exec(rest);
  if (!match) return undefined;

  const count = getNumber(match[1]);
  if (!count) return undefined;

  const modString = match[2];
  let exactly = false;
  let aggregate = false;
  const matchMods: string[] = [];

  for (const ch of modString) {
    if (ch === 'X') {
      exactly = true;
    } else if (ch === 'A') {
      aggregate = true;
    } else {
      matchMods.push(ch);
    }
  }

  return { matchRoot, count, exactly, aggregate, matchMods };
}

// Parse -G: section value
function parseGameFormat(value: string): GameFormat | undefined {
  if (value === AGGR) return { type: AGGR };
  const match = /^([1-9]\d*)C$/.exec(value);
  if (match) return { type: CONSECUTIVE, count: Number(match[1]) };
  return undefined;
}

// Main parser for SET/HAL/QTR/etc. formats
function parseMatchFormat(formatstring: string): ParsedFormat | undefined {
  const parts = formatstring.split('-');
  const spec = parseMatchSpec(parts[0]);
  if (!spec) return undefined;

  const { matchRoot, count, exactly: isExactly, aggregate, matchMods } = spec;

  // Special case: SET1 and SET1X are both treated as bestOf: 1
  const bestOf = isExactly && count !== 1 ? undefined : count;
  const exactly = isExactly && count !== 1 ? count : undefined;

  // Key-based section dispatch (not positional)
  let setFormat: SetFormatResult;
  let finalSetFormat: SetFormatResult;
  let gameFormat: GameFormat | undefined;
  let sCount = 0;
  let fCount = 0;
  let gCount = 0;

  for (let i = 1; i < parts.length; i++) {
    const colonIdx = parts[i].indexOf(':');
    if (colonIdx < 0) return undefined; // invalid section without key

    const key = parts[i].slice(0, colonIdx);
    const value = parts[i].slice(colonIdx + 1);

    if (!(key in sectionTypes)) return undefined; // unknown section key

    if (key === 'S') {
      sCount++;
      if (sCount > 1) return undefined; // duplicate
      setFormat = parseSetFormatString(parts[i], value);
    } else if (key === 'F') {
      fCount++;
      if (fCount > 1) return undefined; // duplicate
      finalSetFormat = parseSetFormatString(parts[i], value);
    } else if (key === 'G') {
      gCount++;
      if (gCount > 1) return undefined; // duplicate -G: section
      gameFormat = parseGameFormat(value);
      if (!gameFormat) return undefined; // invalid game format value
    }
  }

  const timed = (setFormat && setFormat.timed) || (finalSetFormat && finalSetFormat.timed);

  // Validation: for SET root, apply strict bestOf/exactly rules
  if (matchRoot === SET) {
    const validSetsCount = (bestOf && bestOf < 6) || (timed && exactly);
    if (!validSetsCount) return undefined;
  } else {
    // For non-SET roots: just require count > 0 (already checked in parseMatchSpec)
  }

  const validFinalSet = !finalSetFormat || finalSetFormat;
  const validSetsFormat = setFormat;

  if (!validSetsFormat || !validFinalSet) return undefined;

  const result: ParsedFormat = definedAttributes({
    setFormat,
    exactly,
    bestOf,
  });

  // Only include matchRoot when NOT 'SET' (backward compat)
  if (matchRoot !== SET) result.matchRoot = matchRoot;

  // Only include aggregate when true
  if (aggregate) result.aggregate = true;

  // Only include matchMods when non-empty
  if (matchMods.length > 0) result.matchMods = matchMods;

  if (finalSetFormat) result.finalSetFormat = finalSetFormat;
  if (gameFormat) result.gameFormat = gameFormat;

  return result;
}

function parseSetFormatString(formatstring: string, setFormatString: string): SetFormatResult {
  if (setFormatString.startsWith('TB')) {
    return parseTiebreakSetFormat(setFormatString);
  }

  if (setFormatString.startsWith('T')) {
    return parseTimedSet(setFormatString);
  }

  return parseStandardSetFormat(formatstring, setFormatString);
}

function parseTiebreakSetFormat(setFormatString: string): SetFormatResult {
  const tiebreakSet = parseTiebreakFormat(setFormatString);
  if (tiebreakSet === false) return false;
  return typeof tiebreakSet === 'object' ? { tiebreakSet } : undefined;
}

function parseStandardSetFormat(formatstring: string, setFormatString: string): SetFormat | false {
  const parts = /^[FS]:(\d+)([A-Za-z]*)/.exec(formatstring);
  const NoAD = (parts && isNoAD(parts[2])) || false;
  const validNoAD = !parts?.[2] || NoAD;
  const setTo = parts ? getNumber(parts[1]) : undefined;

  const tiebreakAtValue = parseTiebreakAt(setFormatString);
  const validTiebreakAt = tiebreakAtValue !== false;
  const tiebreakAt = (validTiebreakAt && tiebreakAtValue) || setTo;

  const tiebreakFormat = parseTiebreakFormat(setFormatString.split('/')[1]);
  const validTiebreak = tiebreakFormat !== false;

  if (!setTo || !validNoAD || !validTiebreak || !validTiebreakAt) return false;

  return buildSetFormatResult(setTo, NoAD, tiebreakFormat, tiebreakAt);
}

function buildSetFormatResult(
  setTo: number,
  NoAD: boolean,
  tiebreakFormat: TiebreakFormat | undefined,
  tiebreakAt: string | number | undefined,
): SetFormat {
  const result: SetFormat = { setTo };
  if (NoAD) result.NoAD = true;

  if (tiebreakFormat) {
    result.tiebreakFormat = tiebreakFormat;
    result.tiebreakAt = tiebreakAt;
  } else {
    result.noTiebreak = true;
  }

  return result;
}

function parseTiebreakAt(setFormatString: string, expectNumber: boolean = true) {
  const tiebreakAtValue = setFormatString?.indexOf('@') > 0 && setFormatString.split('@');
  if (tiebreakAtValue) {
    const tiebreakAt = expectNumber ? getNumber(tiebreakAtValue[1]) : tiebreakAtValue[1];
    return tiebreakAt || false;
  }

  return undefined;
}

function parseTiebreakFormat(formatstring: string): TiebreakFormat | undefined | false {
  if (!formatstring) return undefined;
  if (!formatstring.startsWith('TB')) return false;

  return parseTiebreakDetails(formatstring);
}

function parseTiebreakDetails(formatstring: string): TiebreakFormat | false {
  const modifier = parseTiebreakAt(formatstring, false);
  const parts = /^TB(\d+)([A-Za-z]*)/.exec(formatstring);
  const tiebreakToString = parts?.[1];
  const NoAD = parts && isNoAD(parts[2]);
  const validNoAD = !parts?.[2] || NoAD;
  const tiebreakTo = getNumber(tiebreakToString);

  if (!tiebreakTo || !validNoAD) return false;

  const result: TiebreakFormat = { tiebreakTo };

  // modifiers cannot be numeric
  if (modifier && typeof modifier === 'string' && !isConvertableInteger(modifier)) {
    result.modifier = modifier;
  }

  // NOTE: NoAD in tiebreaks is a NON-STANDARD EXTENSION for recreational use.
  // Official TODS only defines NoAD for game-level scoring (no deuce/advantage).
  // Standard tennis tiebreaks always require win-by-2 (e.g., 10-8, 11-9, 12-10).
  // NoAD in tiebreaks changes winBy from 2 to 1 (first to tiebreakTo wins).
  // This is not recognized by ITF, ATP, WTA, or USTA official formats.
  if (NoAD) result.NoAD = true;

  return result;
}

function parseTimedSet(formatstring: string): SetFormat | undefined {
  const timestring = formatstring.slice(1);

  // Parse T{minutes}[P|G|A][/TB{n}]
  // Examples: T10, T10A, T10P/TB1, T10G/TB1
  const parts = /^(\d+)([PGA])?(?:\/TB(\d+))?(@[A-Za-z]+)?$/.exec(timestring);
  const minutes = getNumber(parts?.[1]);
  if (!minutes) return;

  const setFormat: SetFormat = { timed: true, minutes };

  // Parse scoring method (P, G, or A)
  const scoringMethod = parts?.[2];
  if (scoringMethod === 'A') {
    setFormat.based = 'A';
  } else if (scoringMethod === 'P') {
    setFormat.based = 'P';
  } else if (scoringMethod === 'G') {
    setFormat.based = 'G';
  }
  // If no suffix, leave 'based' undefined (games is default)

  // Parse set-level tiebreak (if present)
  // Note: This is notation only for tournament directors
  const setTiebreakTo = parts?.[3];
  if (setTiebreakTo) {
    const tiebreakToNumber = getNumber(setTiebreakTo);
    if (tiebreakToNumber) {
      setFormat.tiebreakFormat = { tiebreakTo: tiebreakToNumber };
    }
  }

  // Handle legacy modifiers (backward compatibility)
  const legacyModifier = parts?.[4];
  const validModifier = [undefined, 'P', 'G', ''].includes(legacyModifier);
  if (legacyModifier && !validModifier) {
    const modifier = /^(\d+)([PGA])?(?:\/TB\d+)?(@)([A-Za-z]+)$/.exec(timestring)?.[4];
    if (modifier) {
      setFormat.modifier = modifier;
      return setFormat;
    }
    return;
  }

  // Keep 'based' for backward compatibility
  if (legacyModifier) setFormat.based = legacyModifier;

  return setFormat;
}

function isNoAD(formatstring) {
  return formatstring?.includes(NOAD);
}

function getNumber(formatstring: string | undefined) {
  const num = Number(formatstring);
  return Number.isNaN(num) ? 0 : num;
}
