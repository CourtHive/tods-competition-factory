import { MAIN, QUALIFYING } from '../../constants/drawDefinitionConstants';

export const definitionTemplate = () => ({
  drawId: undefined,
  drawName: undefined,
  drawType: undefined, // NOTE: appears both in drawDefinition and in drawDefinitionProfile.  Topic in flux.
  entries: [],
  links: [],
  structures: [],
  extensions: [
    {
      name: 'drawProfile',
      value: {
        automated: undefined,
        drawType: undefined,
      },
    },
    {
      name: 'entryProfile',
      value: {
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
    },
  ],
});

export const keyValidation = ['drawId', 'structures'];

export default definitionTemplate;
