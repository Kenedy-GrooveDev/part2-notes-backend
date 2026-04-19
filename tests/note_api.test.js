const { test, after, beforeEach } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const Note = require("../models/note");

const api = supertest(app);

const initialNotes = [
  {
    content: "HTML is easy",
    important: false,
  },
  {
    content: "Browser can execute only JavaScript",
    important: true,
  },
];

beforeEach(async () => {
  await Note.deleteMany({});
  let noteObject = new Note(initialNotes[0]);
  await noteObject.save();
  noteObject = new Note(initialNotes[1]);
  await noteObject.save();
});

test("notes returned as json", async () => {
  await api
    .get("/app/notes/")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("all notes are returned", async () => {
  const response = await api.get("/app/notes");
  assert.strictEqual(response.body.length, initialNotes.length);
});

test("a specific note is within the returned notes", async () => {
  const response = await api.get("/app/notes");
  const contents = response.body.map((e) => e.content);

  assert.strictEqual(contents.includes("HTML is easy"), true);
});

test("a valid note can be added", async () => {
  const newNote = {
    content: "async/await simplifies making async calls",
    important: true,
  };

  await api
    .post("/app/notes/")
    .send(newNote)
    .expect(201)
    .expect("content-type", /application\/json/);

  const response = await api.get("/app/notes/");

  const content = response.body.map((n) => n.content);

  assert.strictEqual(response.body.length, initialNotes.length + 1);

  assert(content.includes("async/await simplifies making async calls"));
});

test("note without content is not added", async () => {
  const newNote = {
    important: true,
  };

  await api.post("/app/notes/").send(newNote).expect(400);

  const response = await api.get("/app/notes/");

  assert.strictEqual(response.body.length, initialNotes.length);
});

after(async () => {
  await mongoose.connection.close();
});
