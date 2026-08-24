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

describe('Notes Routes', () => {
  before(async () => { await connect(); });
  after(async () => { await closeDatabase(); });
  afterEach(async () => { await clearDatabase(); });

  it('creates a note for the logged-in user', async () => {
    const cookie = await signupAndGetCookie('M Uzair', 'm.uzair.notes@gmail.com');

    const res = await chai.request(app)
      .post('/notes')
      .set('Cookie', cookie)
      .send({ title: 'Grocery run', content: 'Milk, eggs, and karahi ghee' });

    expect(res).to.have.status(201);
    expect(res.body).to.have.property('title', 'Grocery run');
  });

  it('only returns notes belonging to the logged-in user', async () => {
    const cookieA = await signupAndGetCookie('Tahir Akhter', 'tahir.akhter@hotmail.com');
    const cookieB = await signupAndGetCookie('Abdullah', 'abdullah.notes@gmail.com');

    await chai.request(app)
      .post('/notes')
      .set('Cookie', cookieA)
      .send({ title: 'Rent reminder', content: 'Pay rent by the 5th' });

    const res = await chai.request(app)
      .get('/notes')
      .set('Cookie', cookieB);

    expect(res).to.have.status(200);
    expect(res.body).to.be.an('array').that.is.empty;
  });

  it('soft-deletes a note instead of removing it permanently', async () => {
    const cookie = await signupAndGetCookie('Ali Ahmed', 'ali.ahmed.notes@gmail.com');

    const createRes = await chai.request(app)
      .post('/notes')
      .set('Cookie', cookie)
      .send({ title: 'Call the dentist', content: 'Reschedule to next week' });

    const noteId = createRes.body._id;

    await chai.request(app)
      .delete(`/notes/${noteId}`)
      .set('Cookie', cookie);

    const notesRes = await chai.request(app)
      .get('/notes')
      .set('Cookie', cookie);
    expect(notesRes.body).to.be.empty;

    const trashRes = await chai.request(app)
      .get('/notes/trash')
      .set('Cookie', cookie);
    expect(trashRes.body).to.have.lengthOf(1);
  });
});