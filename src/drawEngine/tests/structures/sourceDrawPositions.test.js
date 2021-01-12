import { getAllStructureMatchUps } from '../../getters/getMatchUps';
import { feedInChampionship } from '../../tests/primitives/feedIn';

import { FEED_IN_CHAMPIONSHIP_TO_SF } from '../../../constants/drawDefinitionConstants';

it('can generate FEED_IN_CHAMPIONSHIP to RSF', () => {
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

  const validations = [
    [1, 1, 1, '1-2', 'C-R16-Q'],
    [1, 1, 2, '3-4', 'C-R16-Q'],
    [1, 2, 1, '5-6', 'C-R16-Q'],
    [1, 2, 2, '7-8', 'C-R16-Q'],
    [1, 3, 1, '9-10', 'C-R16-Q'],
    [1, 3, 2, '11-12', 'C-R16-Q'],
    [1, 4, 1, '13-14', 'C-R16-Q'],
    [1, 4, 2, '15-16', 'C-R16-Q'],
    [1, 5, 1, '17-18', 'C-R16-Q'],
    [1, 5, 2, '19-20', 'C-R16-Q'],
    [1, 6, 1, '21-22', 'C-R16-Q'],
    [1, 6, 2, '23-24', 'C-R16-Q'],
    [1, 7, 1, '25-26', 'C-R16-Q'],
    [1, 7, 2, '27-28', 'C-R16-Q'],
    [1, 8, 1, '29-30', 'C-R16-Q'],
    [1, 8, 2, '31-32', 'C-R16-Q'],

    [2, 1, 1, '29-32', 'C-R16'],
    [2, 2, 1, '25-28', 'C-R16'],
    [2, 3, 1, '21-24', 'C-R16'],
    [2, 4, 1, '17-20', 'C-R16'],
    [2, 5, 1, '13-16', 'C-R16'],
    [2, 6, 1, '9-12', 'C-R16'],
    [2, 7, 1, '5-8', 'C-R16'],
    [2, 8, 1, '1-4', 'C-R16'],

    [4, 1, 1, '1-8', 'C-QF'],
    [4, 2, 1, '9-16', 'C-QF'],
    [4, 3, 1, '17-24', 'C-QF'],
    [4, 4, 1, '25-32', 'C-QF'],

    [6, 1, 1, '17-32', 'C-SF'],
    [6, 2, 1, '1-16', 'C-SF'],
  ];

  validateSourceDrawPositionRanges({
    matchUps,
    validations,
  });
});

function validateSourceDrawPositionRanges({ matchUps, validations }) {
  validations.forEach((validation) => {
    const [
      roundNumber,
      roundPosition,
      sideNumber,
      range,
      roundName,
    ] = validation;
    const matchUp = matchUps.find(
      (matchUp) =>
        matchUp.roundNumber === roundNumber &&
        matchUp.roundPosition === roundPosition
    );
    const side = matchUp.sides.find((side) => side.sideNumber === sideNumber);

    if (side?.sourceDrawPositionRange !== range) {
      console.log(validation);
      console.log(matchUp);
    }
    expect(side.sourceDrawPositionRange).toEqual(range);
    expect(matchUp.roundName).toEqual(roundName);
  });
}
