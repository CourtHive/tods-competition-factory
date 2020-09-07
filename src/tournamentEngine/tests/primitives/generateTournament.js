import { tournamentEngine } from 'src/tournamentEngine';
import { generateParticipants } from 'src/tests/fakerParticipants';

import { SUCCESS } from 'src/constants/resultConstants';
import { SINGLES } from 'src/constants/eventConstants';

export function tournamentRecordWithParticipants({ startDate, endDate, participantsCount, matchUpType=SINGLES }) {
    tournamentEngine.newTournamentRecord({ startDate, endDate});
    
    const { participants } = generateParticipants({ participantsCount, matchUpType });
    expect(participants.length).toEqual(participantsCount);

    let result = tournamentEngine.addParticipants({participants});
    expect(result).toMatchObject(SUCCESS)

    return { tournamentRecord: tournamentEngine.getState(), participants };
}
