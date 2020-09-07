import { tournamentEngine } from 'competitionFactory/tournamentEngine';
import { generateParticipants } from 'competitionFactory/tests/fakerParticipants';

import { SUCCESS } from 'competitionFactory/constants/resultConstants';
import { SINGLES } from 'competitionFactory/constants/eventConstants';

export function tournamentRecordWithParticipants({ startDate, endDate, participantsCount, matchUpType=SINGLES }) {
    tournamentEngine.newTournamentRecord({ startDate, endDate});
    
    const { participants } = generateParticipants({ participantsCount, matchUpType });
    expect(participants.length).toEqual(participantsCount);

    let result = tournamentEngine.addParticipants({participants});
    expect(result).toMatchObject(SUCCESS)

    return { tournamentRecord: tournamentEngine.getState(), participants };
}
