const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    minlength: [3, 'Username must be at least 3 characters long.'],
    maxlength: [30, 'Username cannot exceed 30 characters.'],
    validate: [
      {
        validator: function (value) {
          return /^[a-zA-Z0-9_-]+$/.test(value)
        },
        message: 'Username can only contain letters, numbers, underscores (_), and hyphens (-).'
      },
      {
        validator: function (value) {
          return /^[a-zA-Z]/.test(value)
        },
        message: 'Username must contain at least one letter.'
      }
    ]
  },
  name: String,
  passwordHash: String,
  notes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note'
    }
  ]
})



userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User