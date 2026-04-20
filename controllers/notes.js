const noteRouter = require("express").Router();
const note = require("../models/note");
const Note = require("../models/note");
const { error } = require("../utils/logger");

noteRouter.get("/notes", async (request, response) => {
  const notes = await Note.find({});
  response.json(notes);
});

noteRouter.get("/notes/:id", async (request, response) => {
  const id = request.params.id;

  const note = await Note.findById(id);

  if (!note) {
    return response.status(404).json({ error: "Note not found" });
  }
  response.json(note);
});

noteRouter.post("/notes", async (request, response) => {
  const body = request.body;

  const note = new Note({
    content: body.content,
    important: body.important ?? false,
  });

  const savedNote = await note.save();
  response.status(201).json(savedNote);
});

noteRouter.delete("/notes/:id", async (request, response) => {
  const id = request.params.id;

  const note = await Note.findByIdAndDelete(id);

  console.log(note);

  if (!note) {
    return response.status(404).json({ error: "Note not found" });
  }
  response.status(204).end();
});

noteRouter.put("/notes/:id", async (request, response) => {
  const { content, important } = request.body;
  const id = request.params.id;

  const note = await Note.findById(id);

  if (!note) return response.status(404).json({ error: "note not found" });

  note.content = content;
  note.important = important ?? note.important;

  const updatedNote = await note.save();
  response.json(updatedNote);
});

noteRouter.get("/length", async (request, response, next) => {
  const notes = await Note.find({});

  response.send(`<p>${notes.length}</p>`);
});

module.exports = noteRouter;
