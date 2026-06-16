const logger = require('./logger')
const bcrypt = require('bcrypt')
const requestLogger = (request, response, next) => {
  logger.info('Method: ', request.method)
  logger.info('Path: ', request.path)
  logger.info('Body', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    response.status(400).json({ error: error.message })
  } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
    return response.status(400).json({ error: 'expected `username` to be unique' })
  }

  next(error)
}

const hashedPasswordMiddleware = async (request, response, next) => {
  const { password } = request.body

  if (!password || password.length < 3) {
    return response.status(400).json({ error: 'Password must be at least 3 characters long' })
  }

  const strongPasswordRegex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

  if (!strongPasswordRegex.test(password)) {
    return response.status(400).json({ error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.' })
  }

  try {
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
    request.body.passwordHash = passwordHash
    delete request.body.password
    return next() // Safe: Moves to the route handler ONLY when successful
  } catch (error) {
    return next(error)
  }
}

module.exports = { requestLogger, unknownEndpoint, errorHandler, hashedPasswordMiddleware }