const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/app');
const { connect, closeDatabase, clearDatabase } = require('./setup');

chai.use(chaiHttp);
const { expect } = chai;

describe('Auth Routes', () => {
  before(async () => {await connect();});

  after(async () => {await closeDatabase();});

  afterEach(async () => {await clearDatabase();});

  describe('POST /auth/signup', () => {
    it('should create a new user with valid data', async () => {
      const res = await chai.request(app)
        .post('/auth/signup')
        .send({ name: 'M Uzair', email: 'm.uzair@gmail.com', password: 'uzair5421' });

      expect(res).to.have.status(201);
      expect(res.body.user).to.have.property('email', 'm.uzair@gmail.com');
    });

    it('should reject signup with missing fields', async () => {
      const res = await chai.request(app)
        .post('/auth/signup')
        .send({ name: 'Tahir Akhter' });

      expect(res).to.have.status(400);
    });

    it('should reject signup with a duplicate email', async () => {
      await chai.request(app)
        .post('/auth/signup')
        .send({ name: 'Abdullah', email: 'abdullah.k@outlook.com', password: 'abdullah123' });

      const res = await chai.request(app)
        .post('/auth/signup')
        .send({ name: 'Abdullah K', email: 'abdullah.k@outlook.com', password: 'abdullah1234' });

      expect(res).to.have.status(400);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await chai.request(app)
        .post('/auth/signup')
        .send({ name: 'Ali Ahmed', email: 'ali.ahmed@yahoo.com', password: 'mochachai' });
    });

    it('should log in with correct credentials', async () => {
      const res = await chai.request(app)
        .post('/auth/login')
        .send({ email: 'ali.ahmed@yahoo.com', password: 'mochachai' });

      expect(res).to.have.status(200);
      expect(res).to.have.cookie('token');
    });

    it('should reject login with wrong password', async () => {
      const res = await chai.request(app)
        .post('/auth/login')
        .send({ email: 'ali.ahmed@yahoo.com', password: 'aliahmed' });

      expect(res).to.have.status(401);
    });

    it('should reject login with an email that does not exist', async () => {
      const res = await chai.request(app)
        .post('/auth/login')
        .send({ email: 'notreal.person@gmail.com', password: 'mochachai' });

      expect(res).to.have.status(401);
    });
  });
});