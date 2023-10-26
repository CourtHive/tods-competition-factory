export const structure = {
  finishingPosition:
    '{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"false\\",\\"note\\":\\"e.g. ROUND_OUTCOME, WIN_RATION\\"}',
  matchUpFormat:
    '{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"TODS matchup format, e.g. \'SET3-S:6/TB7\'\\"}',
  matchUps:
    '{\\"type\\":\\"object\\",\\"object\\":\\"matchUp\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\"}',
  positionAssignments:
    '{\\"type\\":\\"object\\",\\"object\\":\\"positionAssignment\\",\\"required\\":\\"false\\"}',
  seedAssignments:
    '{\\"type\\":\\"object\\",\\"object\\":\\"seedAssignment\\",\\"required\\":\\"false\\"}',
  seedLimit:
    '{\\"type\\":\\"number\\",\\"required\\":\\"false\\",\\"note\\":\\"Maximum # allowed seeds\\"}',
  seedingProfile:
    '{\\"type\\":\\"enum\\",\\"enum\\": \\"\\",\\"required\\":\\"false\\",\\"note\\":\\"e.g. WATERFALL for round robin structures\\"}',
  stage:
    '{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"e.g. MAIN, CONSOLATION\\"}',
  stageSequence: '{\\"type\\":\\"number\\",\\"required\\":\\"false\\"}',
  structureAbbreviation:
    '{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"used in construction of roundNames\\"}',
  structureId:
    '{\\"type\\":\\"string\\",\\"required\\":\\"true\\",\\"note\\":\\"id unique within drawDefinition\\"}',
  structureName:
    '{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"e.g. North, South for Compass Draws\\"}',
  structures:
    '{\\"type\\":\\"object\\",\\"object\\":\\"structure\\",\\"array\\":\\"true\\",\\"required\\":\\"false\\",\\"note\\":\\"Contained structures, e.g. round robin groups\\"}',
  structureType:
    '{\\"type\\":\\"string\\",\\"required\\":\\"false\\",\\"note\\":\\"CONTAINER or ITEM\\"}',
  tieFormat:
    '{\\"type\\":\\"object\\",\\"object\\":\\"tieFormat\\",\\"required\\":\\"false\\"}',
};

export default structure;
