import { SINGLES } from '../../constants/matchUpTypes';

export const definitionTemplate = () => ({
  drawId: undefined,
  drawName: undefined,
  matchUpType: SINGLES,
  entries: [],
  links: [],
  structures: [],
});

export const keyValidation = ['drawId', 'structures'];

export default definitionTemplate;
