const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Note = require('../models/note')

const api = supertest(app)

beforeEach(async () => {
  await Note.deleteMany({})
  // for (let note of helper.initialNotes) {
  //   let noteObject = new Note(note)
  //   await noteObject.save()
  // }
  await Note.insertMany(helper.initialNotes)
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
  test('a specific note can be viewed', async () => {
    const noteAtStart = await helper.notesInDb()
    const noteToView = noteAtStart[0]

    await api
      .get(`/app/notes/${noteToView.id}`)
      .expect(200)
      .expect('content-type', /application\/json/)
  })
})


describe('addition of a note', () => {
  test('succeeds with valid data', async () => {
    const newNote = {
      content: 'async/await simplifies making async calls',
      important: true,
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
