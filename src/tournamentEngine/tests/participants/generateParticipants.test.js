import { tournamentEngine } from '../../../tournamentEngine';

import { tournamentRecordWithParticipants } from '../primitives/generateTournament';

import { SUCCESS } from '../../../constants/resultConstants';
import { RANKING } from '../../../constants/participantConstants';

it('can set participant scaleItems', () => {
    const { tournamentRecord } = tournamentRecordWithParticipants({ participantsCount: 100 });
    tournamentEngine.setState(tournamentRecord);

    const participants = tournamentRecord.participants;

    let { participantId } = participants[0];
    let { participant } = tournamentEngine.findParticipant({participantId});
    expect(participant.participantId).toEqual(participantId);
    
    let scaleItem = {
        scaleValue: 8.3,
        scaleName: 'WTN',
        scaleType: RANKING,
        eventType: 'SINGLES',
        scaleDate: '2020-06-06',
    };

    let result = tournamentEngine.setParticipantScaleItem({participantId, scaleItem});
    expect(result).toMatchObject(SUCCESS);

    const scaleAttributes = { scaleName: 'WTN' };
    ({ scaleItem: result } = tournamentEngine.getParticipantScaleItem({participantId, scaleAttributes}));
    expect(result.scaleValue).toEqual(scaleItem.scaleValue);
});
