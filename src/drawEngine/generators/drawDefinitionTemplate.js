import { MAIN, QUALIFYING } from '../../constants/drawDefinitionConstants';

export const definitionTemplate = () => ({
  drawId: undefined,
  drawName: undefined,
  drawProfile: {
    automated: undefined,
    drawType: undefined,
  },
  entryProfile: {
    [QUALIFYING]: {
      drawSize: undefined,
      sequenceMap: undefined,
      alternates: true,
      wildcardsCount: undefined,
    },
    [MAIN]: {
      drawSize: undefined,
      qualifiersCount: undefined,
      alternates: true,
      wildcardsCount: undefined,
    },
  },
  entries: [],
  links: [],
  structures: [],
});

export const keyValidation = ['drawId', 'structures'];

export default definitionTemplate;
