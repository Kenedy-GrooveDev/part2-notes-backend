const noteRouter = require('express').Router()
const Note = require('../models/note')

noteRouter.get('/', (request, response) => {
  Note.find({}).then((notes) => {
    response.json(notes)
  })
})

noteRouter.get('/:id', (request, response, next) => {
  const id = request.params.id
  Note.findById(id)
    .then((note) => {
      if (!note)
        return response.status(404).json({ error: 'note not found' })
      response.json(note)
    })
    .catch((error) => next(error))
})

noteRouter.post('/', (request, response, next) => {
  const body = request.body

  if (!body.content || body.content === '') {
    return response.status(400).json({ error: 'content missing' })
  }
  const note = new Note({
    content: body.content,
    important: body.important ?? false,
  })

  note.save().then(savedNote => {
    response.status(201).json(savedNote)
  }).catch(error => next(error))
})

noteRouter.delete('/:id', (request, response, next) => {
  const id = request.params.id
  Note.findByIdAndDelete(id)
    .then((note) => {
      if (!note) return response.status(404).json({ error: 'note not found' })
      response.status(204).end()
    })
    .catch((error) => next(error))
})

noteRouter.put('/:id', (request, response, next) => {
  const { content, important } = request.body
  const id = request.params.id
  Note.findById(id)
    .then((note) => {
      if (!note) return response.status(404).json({ error: 'note not found' })
      note.content = content
      note.important = important ?? false

      return note.save().then(updatedNote => {
        response.json(updatedNote)
      })
    })
    .catch((error) => next(error))
})

module.exports = noteRouter