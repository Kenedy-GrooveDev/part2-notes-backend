const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Note = require('../models/note')
const User = require('../models/user')

const api = supertest(app)

beforeEach(async () => {
  await Note.deleteMany({})
  // for (let note of helper.initialNotes) {
  //   let noteObject = new Note(note)
  //   await noteObject.save()
  // }

  await Note.insertMany(helper.initialNotes)
  await User.deleteMany({})
  const saltRounds = 10
  const password = await bcrypt.hash('@Kenedy123', saltRounds)
  const user = new User({ username: 'Kenedy', passwordHash: password })
  await user.save()
})

describe('when there is initially some notes saved', () => {
  test('notes returned as json', async () => {
    console.log('entered test')
    await api
      .get('/app/notes/')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all notes are returned', async () => {
    const response = await api.get('/app/notes')
    assert.strictEqual(response.body.length, helper.initialNotes.length)
  })

  test('a specific note is within the returned notes', async () => {
    const response = await api.get('/app/notes')
    const contents = response.body.map((e) => e.content)

    assert.strictEqual(contents.includes('HTML is easy'), true)
  })
})

describe('viewing a specific note', () => {
  test('succeeds with a valid id', async () => {
    const notesAtStart = await helper.notesInDb()
    const noteToView = notesAtStart[0]

    const resultNote = await api
      .get(`/app/notes/${noteToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.deepStrictEqual(resultNote.body, noteToView)
  })

  test('fails with statuscode 404 if note does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()

    await api.get(`/app/notes/${validNonexistingId}`).expect(404)
  })

  test('fails with statuscode 400 id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api.get(`/app/notes/${invalidId}`).expect(400)
  })
})

describe('addition of a note', () => {
  test('succeeds with valid data', async () => {
    const userAtStart = await helper.userInDb()
    const uID = userAtStart.map((u) => u.id)
    const newNote = {
      content: 'async/await simplifies making async calls',
      important: true,
      userId: uID[0],
    }

    await api
      .post('/app/notes')
      .send(newNote)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const notesAtEnd = await helper.notesInDb()
    assert.strictEqual(notesAtEnd.length, helper.initialNotes.length + 1)

    const contents = notesAtEnd.map((n) => n.content)
    assert(contents.includes('async/await simplifies making async calls'))

    const userAtEnd = await helper.userInDb()
    const creator = userAtEnd.find((u) => u.id === newNote.userId)
    const createdNote = notesAtEnd.find((note) =>
      note.content.includes('async/await simplifies making async calls'),
    )
    const userInNote = createdNote.user.toJSON()
    assert.strictEqual(creator.id, userInNote)
  })

  test('fails with status code 400 if data invalid', async () => {
    const newNote = { important: true }

    await api.post('/app/notes').send(newNote).expect(400)

    const notesAtEnd = await helper.notesInDb()

    assert.strictEqual(notesAtEnd.length, helper.initialNotes.length)
  })
})

describe('deletion of a note', () => {
  test('a note can be deleted', async () => {
    const noteAtStart = await helper.notesInDb()
    const noteToDelete = noteAtStart[0]
    await api.delete(`/app/notes/${noteToDelete.id}`).expect(204)
    const notesAtEnd = await helper.notesInDb()
    const content = notesAtEnd.map((n) => n.id)
    assert.strictEqual(content.includes(noteToDelete.id), false)
    assert.strictEqual(notesAtEnd.length, helper.initialNotes.length - 1)
  })
})

after(async () => {
  await mongoose.connection.close()
})
