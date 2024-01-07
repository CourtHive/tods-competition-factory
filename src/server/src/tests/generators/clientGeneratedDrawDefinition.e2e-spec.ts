import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { TEST_EMAIL, TEST_PASSWORD } from '../../common/constants/test';

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
  });

  /**
  it('should get JWT then successful executionQueue', async () => {
    await request(app.getHttpServer())
      .post('/factory')
      .set('Authorization', 'Bearer ' + token)
      .send({
        executionQueue: [
          {
            params: {
              startDate: '2024-01-01',
              endDate: '2024-01-02',
              tournamentId: TEST,
            },
            method: 'addDrawDefinition',
          },
        ],
        tournamentId: TEST,
      })
      .expect(200);

    return await request(app.getHttpServer())
      .post('/factory/query')
      .set('Authorization', 'Bearer ' + token)
      .send({
        params: { tournamentId: TEST },
        method: 'getTournamentInfo',
        tournamentId: TEST,
      })
      .expect(200);
  });
  */

  afterAll(async () => {
    await app.close();
  });
});
