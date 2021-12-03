import app from '../../src/app.js';
import supertest from 'supertest';

import {
    recommendationsIncorrectFactory,
    recommendationsFactory,
    createRecommendation,
} from '../factories/recommendationsFactory.js';

import { clearDatabase, endConnection } from '../database/clearDatabase.js';

const agent = supertest(app);

afterAll(async () => {
    await clearDatabase();
    endConnection();
});

describe('post /recommendations', () => {
    it('should return 400 for incorrect data sent', async () => {
        const result = await agent
            .post('/recommendations')
            .send(recommendationsIncorrectFactory());
        expect(result.status).toEqual(400);
    });

    it('should return 200 for correct data sent', async () => {
        const result = await agent
            .post('/recommendations')
            .send(recommendationsFactory());
        expect(result.status).toEqual(201);
    });
});

describe('post /recommendations/:id/upvote', () => {
    beforeAll(async () => {
        await clearDatabase();
    });

    it('returns 404 for a non-existent id in database', async () => {
        const result = await agent.post('/recommendations/1/upvote');
        expect(result.status).toEqual(404);
    });

    it('returns 201 for an existent id in database', async () => {
        const id = await createRecommendation();
        const result = await agent.post(`/recommendations/${id}/upvote`);
        expect(result.status).toEqual(201);
    });
});

describe('post /recommendations/:id/downvote', () => {
    beforeAll(async () => {
        await clearDatabase();
    });

    it('returns 404 for a non-existent id in database', async () => {
        const result = await agent.post('/recommendations/1/downvote');
        expect(result.status).toEqual(404);
    });

    it('returns 201 for an existent id in database', async () => {
        const id = await createRecommendation();
        const result = await agent.post(`/recommendations/${id}/downvote`);
        expect(result.status).toEqual(201);
    });
});

describe('get /recommendations/random', () => {
    beforeAll(async () => {
        await clearDatabase();
    });

    afterEach(async () => {
        await createRecommendation();
    });

    it('returns 404 for no recommendations in database', async () => {
        const result = await agent.get('/recommendations/random');
        expect(result.status).toEqual(404);
    });

    it('returns 200 for recommendation in database', async () => {
        const result = await agent.get('/recommendations/random');
        expect(result.status).toEqual(200);
        expect(result.body).toHaveProperty('id');
        expect(result.body).toHaveProperty('name');
        expect(result.body).toHaveProperty('youtubeLink');
        expect(result.body).toHaveProperty('score');
    });
});

describe('get /recommendations/top/:amount', () => {
    beforeAll(async () => {
        await clearDatabase();
    });

    afterEach(async () => {
        await createRecommendation();
    });

    it('returns 404 if no recommendations exist', async () => {
        const result = await agent.get('/recommendations/top/2');
        expect(result.status).toEqual(404);
    });

    it('returns 400 if amount is not a number', async () => {
        const result = await agent.get('/recommendations/top/as');
        expect(result.status).toEqual(400);
    });

    it('returns 400 if amount is less than 1', async () => {
        const result = await agent.get('/recommendations/top/0');
        expect(result.status).toEqual(400);
    });

    it('returns 200 and an array of songs', async () => {
        const result = await agent.get('/recommendations/top/4');
        expect(result.status).toEqual(200);
        expect(result.body.length).toEqual(3);
        expect(result.body[0]).toHaveProperty('id');
        expect(result.body[0]).toHaveProperty('name');
        expect(result.body[0]).toHaveProperty('youtubeLink');
        expect(result.body[0]).toHaveProperty('score');
    });
});