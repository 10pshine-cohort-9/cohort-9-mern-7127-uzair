const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/app');
const { connect, closeDatabase, clearDatabase } = require('./setup');

chai.use(chaiHttp);
const { expect } = chai;

const signupAndGetCookie = async (name, email) => {
  const res = await chai.request(app)
    .post('/auth/signup')
    .send({ name, email, password: 'meetMeAt9pm' });

  return res.headers['set-cookie'];
};

describe('Auth Routes - additional coverage', () => {
  before(async () => { await connect(); });
  after(async () => { await closeDatabase(); });
  afterEach(async () => { await clearDatabase(); });

  describe('POST /auth/signup - input validation', () => {
    it('should reject signup when email is not a string', async () => {
      const res = await chai.request(app)
        .post('/auth/signup')
        .send({ name: 'M Uzair', email: { $ne: null }, password: 'uzair5421' });

      expect(res).to.have.status(400);
      expect(res.body.message).to.equal('Invalid input format');
    });
  });

  describe('POST /auth/login - input validation', () => {
    it('should reject login with missing fields', async () => {
      const res = await chai.request(app)
        .post('/auth/login')
        .send({ email: 'someone@gmail.com' });

      expect(res).to.have.status(400);
      expect(res.body.message).to.equal('Please provide Email and Password');
    });

    it('should reject login when password is not a string', async () => {
      const res = await chai.request(app)
        .post('/auth/login')
        .send({ email: 'someone@gmail.com', password: { $ne: null } });

      expect(res).to.have.status(400);
      expect(res.body.message).to.equal('Invalid input format');
    });
  });

  describe('POST /auth/logout', () => {
    it('should clear the auth cookie and confirm logout', async () => {
      const cookie = await signupAndGetCookie('Sara Khan', 'sara.khan@gmail.com');

      const res = await chai.request(app)
        .post('/auth/logout')
        .set('Cookie', cookie);

      expect(res).to.have.status(200);
      expect(res.body.message).to.equal('Logged out Successully');
    });
  });

  describe('GET /auth/me', () => {
    it('returns the logged-in user profile', async () => {
      const cookie = await signupAndGetCookie('Bilal Hussain', 'bilal.hussain@gmail.com');

      const res = await chai.request(app)
        .get('/auth/me')
        .set('Cookie', cookie);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('email', 'bilal.hussain@gmail.com');
    });

    it('rejects the request when no token cookie is present', async () => {
      const res = await chai.request(app).get('/auth/me');

      expect(res).to.have.status(401);
      expect(res.body.message).to.equal('Not Authorized!');
    });
  });

  describe('unmatched routes', () => {
    it('returns 404 for an unknown route', async () => {
      const res = await chai.request(app).get('/this-route-does-not-exist');

      expect(res).to.have.status(404);
      expect(res.body.message).to.equal('Route not found!');
    });
  });
});

describe('Notes Routes - additional coverage', () => {
  before(async () => { await connect(); });
  after(async () => { await closeDatabase(); });
  afterEach(async () => { await clearDatabase(); });

  describe('POST /notes - validation', () => {
    it('rejects note creation when title or content is missing', async () => {
      const cookie = await signupAndGetCookie('Hina Rafiq', 'hina.rafiq@gmail.com');

      const res = await chai.request(app)
        .post('/notes')
        .set('Cookie', cookie)
        .send({ title: 'Only a title' });

      expect(res).to.have.status(400);
      expect(res.body.message).to.equal('Please Provide Title and Content!');
    });
  });

  describe('PUT /notes/:id', () => {
    it('rejects an update with a malformed note id', async () => {
      const cookie = await signupAndGetCookie('Zainab Malik', 'zainab.malik@gmail.com');

      const res = await chai.request(app)
        .put('/notes/not-a-valid-id')
        .set('Cookie', cookie)
        .send({ title: 'New title', content: 'New content' });

      expect(res).to.have.status(400);
      expect(res.body.message).to.equal('Invalid Note ID!');
    });

    it('returns 404 when updating a note that does not exist', async () => {
      const cookie = await signupAndGetCookie('Kamran Aziz', 'kamran.aziz@gmail.com');

      const res = await chai.request(app)
        .put('/notes/507f1f77bcf86cd799439011')
        .set('Cookie', cookie)
        .send({ title: 'New title', content: 'New content' });

      expect(res).to.have.status(404);
      expect(res.body.message).to.equal('Note Not Found!');
    });

    it('returns 403 when updating a note owned by another user', async () => {
      const cookieA = await signupAndGetCookie('Owner User', 'owner.user@gmail.com');
      const cookieB = await signupAndGetCookie('Other User', 'other.user@gmail.com');

      const createRes = await chai.request(app)
        .post('/notes')
        .set('Cookie', cookieA)
        .send({ title: 'Private note', content: 'Only for the owner' });

      const res = await chai.request(app)
        .put(`/notes/${createRes.body._id}`)
        .set('Cookie', cookieB)
        .send({ title: 'Hijacked title', content: 'Hijacked content' });

      expect(res).to.have.status(403);
      expect(res.body.message).to.equal('Not Authorized!');
    });
  });

  describe('DELETE /notes/:id - validation', () => {
    it('rejects a delete with a malformed note id', async () => {
      const cookie = await signupAndGetCookie('Fahad Iqbal', 'fahad.iqbal@gmail.com');

      const res = await chai.request(app)
        .delete('/notes/not-a-valid-id')
        .set('Cookie', cookie);

      expect(res).to.have.status(400);
      expect(res.body.message).to.equal('Invalid Note ID!');
    });

    it('returns 404 when deleting a note that does not exist', async () => {
      const cookie = await signupAndGetCookie('Rabia Yousaf', 'rabia.yousaf@gmail.com');

      const res = await chai.request(app)
        .delete('/notes/507f1f77bcf86cd799439011')
        .set('Cookie', cookie);

      expect(res).to.have.status(404);
      expect(res.body.message).to.equal('Note Not Found!');
    });
  });

  describe('GET /notes/trash', () => {
    it('returns only soft-deleted notes for the logged-in user', async () => {
      const cookie = await signupAndGetCookie('Junaid Malik', 'junaid.malik@gmail.com');

      const createRes = await chai.request(app)
        .post('/notes')
        .set('Cookie', cookie)
        .send({ title: 'To be trashed', content: 'Trash me' });

      await chai.request(app)
        .delete(`/notes/${createRes.body._id}`)
        .set('Cookie', cookie);

      const res = await chai.request(app)
        .get('/notes/trash')
        .set('Cookie', cookie);

      expect(res).to.have.status(200);
      expect(res.body).to.have.lengthOf(1);
      expect(res.body[0].title).to.equal('To be trashed');
    });
  });

  describe('PATCH /notes/:id/restore', () => {
    it('rejects a restore with a malformed note id', async () => {
      const cookie = await signupAndGetCookie('Sana Tariq', 'sana.tariq@gmail.com');

      const res = await chai.request(app)
        .patch('/notes/not-a-valid-id/restore')
        .set('Cookie', cookie);

      expect(res).to.have.status(400);
      expect(res.body.message).to.equal('Invalid Note ID!');
    });

    it('returns 404 when restoring a note that does not exist', async () => {
      const cookie = await signupAndGetCookie('Waleed Farooq', 'waleed.farooq@gmail.com');

      const res = await chai.request(app)
        .patch('/notes/507f1f77bcf86cd799439011/restore')
        .set('Cookie', cookie);

      expect(res).to.have.status(404);
      expect(res.body.message).to.equal('Note not found!');
    });
  });

  describe('DELETE /notes/:id/permanent', () => {
    it('rejects a permanent delete with a malformed note id', async () => {
      const cookie = await signupAndGetCookie('Imran Sheikh', 'imran.sheikh@gmail.com');

      const res = await chai.request(app)
        .delete('/notes/not-a-valid-id/permanent')
        .set('Cookie', cookie);

      expect(res).to.have.status(400);
      expect(res.body.message).to.equal('Invalid Note ID!');
    });

    it('returns 404 when permanently deleting a note that is not in the trash', async () => {
      const cookie = await signupAndGetCookie('Farah Naz', 'farah.naz@gmail.com');

      const createRes = await chai.request(app)
        .post('/notes')
        .set('Cookie', cookie)
        .send({ title: 'Still active', content: 'Not trashed yet' });

      const res = await chai.request(app)
        .delete(`/notes/${createRes.body._id}/permanent`)
        .set('Cookie', cookie);

      expect(res).to.have.status(404);
      expect(res.body.message).to.equal('Note not found!');
    });
  });
});