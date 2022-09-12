import { getParticipantId } from '../../../global/functions/extractors';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { QUALIFYING } from '../../../constants/drawDefinitionConstants';
import { RATING, SEEDING } from '../../../constants/scaleConstants';
import { SINGLES } from '../../../constants/eventConstants';
import { ELO } from '../../../constants/ratingConstants';

const scenarios = [
  {
    qualifyingParticipants: 21,
    qualifyingPositions: 2,
    seedsCount: 4,
    drawSize: 32,
  },
];

it.each(scenarios)(
  'can generate qualifying with varying participantsCount',
  (scenario) => {
    const participantsCount = 100;
    const ratingType = ELO;

    const {
      eventIds: [eventId],
      tournamentRecord,
    } = mocksEngine.generateTournamentRecord({
      eventProfiles: [{ eventName: 'QTest' }],
      participantsProfile: {
        scaledParticipantsCount: participantsCount,
        category: { ratingType },
        participantsCount,
      },
    });

    tournamentEngine.setState(tournamentRecord);

    const participants =
      tournamentEngine.getTournamentParticipants().tournamentParticipants;
    expect(participants.length).toEqual(participantsCount);

    const participantIds = participants.map(getParticipantId);
    const qualifyingStageEntryIds = participantIds.slice(
      0,
      scenario.qualifyingParticipants
    );

    const scaleAttributes = {
      scaleType: RATING,
      eventType: SINGLES,
      scaleName: ELO,
    };
    const sortedQualifyingParticipantIds = qualifyingStageEntryIds.sort(
      (a, b) =>
        tournamentEngine.getParticipantScaleItem({
          scaleAttributes,
          participantId: a,
        }).scaleItem.scaleValue -
        tournamentEngine.getParticipantScaleItem({
          scaleAttributes,
          participantId: b,
        }).scaleItem.scaleValue
    );

    let result = tournamentEngine.addEventEntries({
      participantIds: qualifyingStageEntryIds,
      entryStage: QUALIFYING,
      eventId,
    });
    expect(result.success).toEqual(true);

    const qualifyingSeedingScaleName = 'QS';
    const scaleValues = [1, 2, 3, 4, 5, 6, 7, 8];
    scaleValues.forEach((scaleValue, index) => {
      let scaleItem = {
        scaleName: qualifyingSeedingScaleName,
        scaleType: SEEDING,
        eventType: SINGLES,
        scaleValue,
      };
      const participantId = sortedQualifyingParticipantIds[index];
      let result = tournamentEngine.setParticipantScaleItem({
        participantId,
        scaleItem,
      });
      expect(result.success).toEqual(true);
    });

    result = tournamentEngine.generateDrawDefinition({
      qualifyingProfiles: [
        {
          structureProfiles: [
            {
              seedingScaleName: qualifyingSeedingScaleName,
              ...scenario,
            },
          ],
        },
      ],
      qualifyingOnly: true,
      eventId,
    });

    console.log(result);
    /*
    expect(result.success).toEqual(true);

    const drawDefinition = result.drawDefinition;
    expect(drawDefinition.structures.length).toEqual(2);

    const qualifyingStructure = drawDefinition.structures[0];

    expect(
      qualifyingStructure.positionAssignments.filter(
        ({ participantId }) => participantId
      ).length
    ).toEqual(scenario.qualifyingParticipants);

    console.log(qualifyingStructure.positionAssignments);
    console.log(qualifyingStructure.seedAssignments);
    */
  }
);
