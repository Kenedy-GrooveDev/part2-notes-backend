const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const User = require('../models/user')
const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')

const api = supertest(app)

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const saltRounds = 10
    const passwordHash = await bcrypt.hash('Sekret@211', saltRounds)

    const user = new User({
      username: 'root',
      passwordHash: passwordHash,
    })

    await user.save()
  })

  test('creation succeed with a fresh username', async () => {
    const userAtStart = await helper.userInDb()
    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'Salainen@1',
    }
    await api
      .post('/app/users/')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const userAtEnd = await helper.userInDb()

    assert.strictEqual(userAtEnd.length, userAtStart.length + 1)
    const userNames = userAtEnd.map((name) => name.username)

    assert(userNames.includes(newUser.username))
  })

  test('creation fails with proper statuscode and message for invalid usernames or duplicates', async () => {
    const usersAtStart = await helper.userInDb()

    const invalidUsers = [
      {
        data: { username: 'root', name: 'Superuser', password: 'Salainen@12' },
        expectedError: 'expected `username` to be unique',
      },
      {
        data: { username: 'r', name: 'Superuser', password: 'Salainen12@' },
        expectedError: 'Username must be at least 3 characters long.',
      },
      {
        data: {
          username: 'rootKenedyGoodluckLyimoDeveloper',
          name: 'Superuser',
          password: 'Salainen12@',
        },
        expectedError: 'Username cannot exceed 30 characters.',
      },
    ]

    for (const scenario of invalidUsers) {
      const response = await api
        .post('/app/users')
        .send(scenario.data)
        .expect(400)
        .expect('content-type', /application\/json/)

      assert(response.body.error.includes(scenario.expectedError))
    }

    const usersAtEnd = await helper.userInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if password does not meet strength requirements', async () => {
    const userAtStart = await helper.userInDb()
    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'Salainen',
    }
    const response = await api
      .post('/app/users/')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const userAtEnd = await helper.userInDb()

    assert.strictEqual(userAtEnd.length, userAtStart.length)
    assert(response.body.error.includes('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'))
  })
})

after(async () => {
  await mongoose.connection.close()
})
