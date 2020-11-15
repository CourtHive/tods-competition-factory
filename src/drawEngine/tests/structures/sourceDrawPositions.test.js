import { getAllStructureMatchUps } from '../../getters/getMatchUps';
import { feedInChampionship } from '../../tests/primitives/feedIn';

import { FEED_IN_CHAMPIONSHIP_TO_SF } from '../../../constants/drawDefinitionConstants';

it.only('can generate FEED_IN_CHAMPIONSHIP to RSF', () => {
  const {
    links,
    drawDefinition,
    mainDrawMatchUps,
    consolationMatchUps,
    consolationStructure,
  } = feedInChampionship({
    drawSize: 32,
    drawType: FEED_IN_CHAMPIONSHIP_TO_SF,
  });

  expect(mainDrawMatchUps.length).toEqual(31);
  expect(consolationMatchUps.length).toEqual(29);
  expect(links.length).toEqual(4);

  const { matchUps } = getAllStructureMatchUps({
    structure: consolationStructure,
    inContext: true,
    drawDefinition,
  });

  console.log({ matchUps });

  const validations = [
    [1, 1, '1-2', 'C-Q16'],
    [1, 2, '3-4', 'C-Q16'],
    [1, 3, '5-6', 'C-Q16'],
    [1, 4, '7-8', 'C-Q16'],
    [1, 5, '9-10', 'C-Q16'],
    [1, 6, '11-12', 'C-Q16'],
    [1, 7, '13-14', 'C-Q16'],
    [1, 8, '15-16', 'C-Q16'],
    [2, 1, '29-32', 'C-R16'],
    [2, 2, '25-28', 'C-R16'],
    [2, 3, '21-24', 'C-R16'],
    [2, 4, '17-20', 'C-R16'],
  ];

  validateSourceDrawPositionRanges({
    matchUps,
    validations,
  });
});

function validateSourceDrawPositionRanges({ matchUps, validations }) {
  validations.forEach(validation => {
    const [roundNumber, roundPosition, range, roundName] = validation;
    const matchUp = matchUps.find(
      matchUp =>
        matchUp.roundNumber === roundNumber &&
        matchUp.roundPosition === roundPosition
    );
    expect(matchUp.sourceDrawPositionRange).toEqual(range);
    expect(matchUp.roundName).toEqual(roundName);
  });
}
