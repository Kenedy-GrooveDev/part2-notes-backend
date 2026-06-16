const noteRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')

noteRouter.get('/', async (request, response) => {
  const notes = await Note.find({})
  response.json(notes)
})

noteRouter.get('/:id', async (request, response) => {
  const id = request.params.id

  const note = await Note.findById(id)

  if (!note) {
    return response.status(404).json({ error: 'Note not found' })
  }
  response.json(note)
})

noteRouter.post('/', async (request, response) => {
  const body = request.body

  const user = await User.findById(body.userId)

  if (!user) {
    return response.status(400).json({ error: 'userId missing or not valid' })
  }

  const note = new Note({
    content: body.content,
    important: body.important ?? false,
    user: user._id
  })

  const savedNote = await note.save()
  user.notes = user.notes.concat(savedNote._id)
  await user.save()

  response.status(201).json(savedNote)
})

noteRouter.delete('/:id', async (request, response) => {
  const id = request.params.id

  await Note.findByIdAndDelete(id)
  response.status(204).end()
})

noteRouter.put('/:id', async (request, response) => {
  const { content, important } = request.body
  const id = request.params.id

  const note = await Note.findById(id)

  if (!note) return response.status(404).json({ error: 'note not found' })

  note.content = content
  note.important = important ?? note.important

  const updatedNote = await note.save()
  response.json(updatedNote)
})


module.exports = noteRouter
