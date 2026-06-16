const usersRouter = require('express').Router()
const User = require('../models/user')
const middleware = require('../utils/middleware')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})
  response.json(users)
})

usersRouter.post('/', middleware.hashedPasswordMiddleware, async (request, response, next) => {
  try {
    const { username, name, passwordHash } = request.body

    const user = new User({
      username,
      name,
      passwordHash
    })

    const savedUser = await user.save()
    response.status(201).json(savedUser)
  } catch (error) {
    next(error)
  }
})

module.exports = usersRouter