const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as an argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://fullstack:${password}@farm-cluster.uacdiwb.mongodb.net/noteApp?retryWrites=true&w=majority&appName=farm-cluster`

mongoose.set('strictQuery', false)

mongoose.connect(url, { family: 4 })

const noteSchema = new mongoose.Schema({
  content: String,
  date: Date,
  important: Boolean,
})

const Note = mongoose.model('Note', noteSchema)

// const note = new Note({
//   content: "MongoDB is beginner friendly Database",
//   date: new Date(),
//   important: true,
// });


// Note.insertMany(notes).then(result => {
//   console.log(`${result} \n saved successfully`);
//   mongoose.connection.close();
// });

Note.find({ important: false }).then(result => {
  result.forEach(note => {
    console.log(note)
  })
  mongoose.connection.close()
})


