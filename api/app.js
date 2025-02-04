const express = require('express')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const cookieParser = require('cookie-parser')
var history = require('connect-history-api-fallback')

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')

const userRouter = require('./routes/userRoutes')
const clumpRouter = require('./routes/clumpRoutes')
const memberRouter = require('./routes/memberRoutes')
const roleRouter = require('./routes/roleRoutes')
const scheduleRouter = require('./routes/scheduleRoutes')
const tagRouter = require('./routes/tagRoutes')
const eventTemplateRouter = require('./routes/eventTemplateRoutes')
const eventRouter = require('./routes/eventRoutes')
const eventAttendeeRouter = require('./routes/eventAttendeeRoutes')
const eventExceptionRouter = require('./routes/eventExceptionRoutes')
const noteRouter = require('./routes/noteRoutes')

const app = express()

app.use(
  history({
    htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
  })
)

//Set HTTP Security Headers
app.use(helmet())

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP.',
})
app.use('/api', limiter)

//Body parser and limit data size for requests
app.use(
  express.json({
    limit: '10kb',
  })
)
app.use(cookieParser())

const path = `${__dirname}/views`
app.use(express.static(path))

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize())

// Data Sanitization against XSS
app.use(xss())

//Prevent parameter pollution
//white list for parameters you want multiple of
app.use(
  hpp({
    whitelist: ['duration'],
  })
)

app.use('/api/v1/users', userRouter)
app.use('/api/v1/clumps', clumpRouter)
app.use('/api/v1/members', memberRouter)
app.use('/api/v1/roles', roleRouter)
app.use('/api/v1/schedules', scheduleRouter)
app.use('/api/v1/tags', tagRouter)
app.use('/api/v1/event-templates', eventTemplateRouter)
app.use('/api/v1/events', eventRouter)
app.use('/api/v1/event-attendees', eventAttendeeRouter)
app.use('/api/v1/event-exceptions', eventExceptionRouter)
app.use('/api/v1/notes', noteRouter)

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
})

app.use(globalErrorHandler)

module.exports = app
