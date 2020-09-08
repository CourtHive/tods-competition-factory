import { tournamentEngine } from '../../../tournamentEngine';
import { generateParticipants } from '../../../tests/fakerParticipants';

import { SUCCESS } from '../../../constants/resultConstants';
import { SINGLES } from '../../../constants/eventConstants';

export function tournamentRecordWithParticipants({ startDate, endDate, participantsCount, matchUpType=SINGLES }) {
    tournamentEngine.newTournamentRecord({ startDate, endDate});
    
    const { participants } = generateParticipants({ participantsCount, matchUpType });
    expect(participants.length).toEqual(participantsCount);

    let result = tournamentEngine.addParticipants({participants});
    expect(result).toMatchObject(SUCCESS)

    return { tournamentRecord: tournamentEngine.getState(), participants };
}
