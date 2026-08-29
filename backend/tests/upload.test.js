const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/app');
const { connect, closeDatabase, clearDatabase } = require('./setup');

chai.use(chaiHttp);
const { expect } = chai;

// 1x1 transparent PNG, base64-encoded
const TINY_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

const signupAndGetCookie = async () => {
  const res = await chai.request(app)
    .post('/auth/signup')
    .send({ name: 'Upload Tester', email: 'upload.tester@gmail.com', password: 'password123' });

  return res.headers['set-cookie'];
};

describe('POST /auth/profile-picture', () => {
  before(async () => { await connect(); });
  after(async () => { await closeDatabase(); });
  afterEach(async () => { await clearDatabase(); });

  it('accepts a valid image and returns the updated profile', async () => {
    const cookie = await signupAndGetCookie();
    const buffer = Buffer.from(TINY_PNG_BASE64, 'base64');

    const res = await chai.request(app)
      .post('/auth/profile-picture')
      .set('Cookie', cookie)
      .attach('profilePicture', buffer, 'photo.png');

    expect(res).to.have.status(200);
    expect(res.body.profilePicture).to.be.a('string');
    expect(res.body.profilePicture).to.include('/uploads/');
  });

  it('rejects a file that is not a real image', async () => {
    const cookie = await signupAndGetCookie();
    const buffer = Buffer.from('this is definitely not an image');

    const res = await chai.request(app)
      .post('/auth/profile-picture')
      .set('Cookie', cookie)
      .attach('profilePicture', buffer, 'fake.png');

    expect(res).to.have.status(400);
  });

  it('rejects the request when there is no file attached', async () => {
    const cookie = await signupAndGetCookie();

    const res = await chai.request(app)
      .post('/auth/profile-picture')
      .set('Cookie', cookie);

    expect(res).to.have.status(400);
  });
});