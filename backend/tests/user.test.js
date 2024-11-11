const request = require('supertest');
const { app } = require('../src/index');
const User = require('../src/models/user');

describe('User API', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('should create a new user', async () => {
    const userData = { name: 'John Doe', email: 'johndoe@example.com' };
    const response = await request(app).post('/api/users').send(userData);
    expect(response.status).toBe(201);
    expect(response.body.name).toBe(userData.name);
    expect(response.body.email).toBe(userData.email);
  });

  it('should get all users', async () => {
    await User.create([
      { name: 'John Doe', email: 'johndoe@example.com' },
      { name: 'Jane Doe', email: 'janedoe@example.com' },
    ]);
    const response = await request(app).get('/api/users');
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });
});