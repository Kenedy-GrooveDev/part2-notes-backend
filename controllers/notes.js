const noteRouter = require('express').Router()
const note = require('../models/note')
const Note = require('../models/note')
const { error } = require('../utils/logger')

noteRouter.get('/notes', async (request, response) => {
  const notes = await Note.find({})
  response.json(notes)
})

noteRouter.get('/notes/:id', async (request, response, next) => {
  const id = request.params.id

  try{
    const note = await Note.findById(id)

    if(!note) {
      return response.status(404).json({error: "Note not found"})
    }
    response.json(note)
  }catch (error) {
    next(error)
  }
})

noteRouter.post('/notes', async (request, response, next) => {
  const body = request.body

  if (!body.content || body.content === '') {
    return response.status(400).json({ error: 'content missing' })
  }
  const note = new Note({
    content: body.content,
    important: body.important ?? false,
  })

  try {
    const savedNote = await note.save()
    response.status(201).json(savedNote)
  }catch (error) {
    next(error)
  }
})

noteRouter.delete('/notes/:id', async (request, response, next) => {
  const id = request.params.id

  try {
    const note = await Note.findByIdAndDelete(id)

    console.log(note)

    if (!note) {
      return response.status(404).json({error: "Note not found"})
    }

    response.status(204).end()
  }catch (error) {
    next(error)
  }

})

noteRouter.put('/notes/:id', async (request, response, next) => {
  const { content, important } = request.body
  const id = request.params.id

  try {
    const note = await Note.findById(id)
    
    if (!note) return response.status(404).json({ error: 'note not found' })
    
    note.content = content
    note.important = important ?? note.important

    const updatedNote = await note.save()
    response.json(updatedNote)
  } catch (error) {
    next(error)
  }
  
})

noteRouter.get('/length', async (request, response, next) => {
  try {
    const notes = await Note.find({})

    response.send(`<p>${notes.length}</p>`)
  }catch (error) {
    next(error)
  }
})

module.exports = noteRouter