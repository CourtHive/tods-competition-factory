import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { TEST_EMAIL, TEST_PASSWORD } from '../../common/constants/test';
import { SINGLES } from '../../../../constants/eventConstants';
import { mocksEngine } from '../../../..';

describe('AppService', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    const loginReq = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
      .expect(200);

    token = loginReq.body.token;
  });

  it('should have a token', () => {
    expect(token).toBeDefined();

    const { tournamentRecord } = mocksEngine.generateTournamentRecord({
      eventProfiles: [{ eventId: 'e1', eventType: SINGLES }],
    });

    expect(tournamentRecord.events.length).toEqual(1);
  });

  afterAll(async () => {
    await app.close();
  });
});
