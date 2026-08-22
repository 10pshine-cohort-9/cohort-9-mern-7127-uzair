const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/app')
const { connect, closeDatabase, clearDatabase } = require('./setup');

require('dotenv').config();

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
        .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });

      expect(res).to.have.status(201);
      expect(res.body.user).to.have.property('email', 'test@example.com');
    });

    it('should reject signup with missing fields', async () => {
      const res = await chai.request(app)
        .post('/auth/signup')
        .send({ name: 'Test User' });

      expect(res).to.have.status(400);
    });

    it('should reject signup with a duplicate email', async () => {
      await chai.request(app)
        .post('/auth/signup')
        .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });

      const res = await chai.request(app)
        .post('/auth/signup')
        .send({ name: 'Another User', email: 'test@example.com', password: 'password456' });

      expect(res).to.have.status(400);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await chai.request(app)
        .post('/auth/signup')
        .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });
    });

    it('should log in with correct credentials', async () => {
      const res = await chai.request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res).to.have.status(200);
      expect(res).to.have.cookie('token');
    });

    it('should reject login with wrong password', async () => {
      const res = await chai.request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' });

      expect(res).to.have.status(401);
    });

    it('should reject login with an email that does not exist', async () => {
      const res = await chai.request(app)
        .post('/auth/login')
        .send({ email: 'nobody@example.com', password: 'password123' });

      expect(res).to.have.status(401);
    });
  });
});