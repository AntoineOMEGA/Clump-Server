const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const userRouter = require('./routes/userRoutes');
const calendarRouter = require('./routes/calendarRoutes');
const eventRouter = require('./routes/eventRoutes');

const app = express();

//Implement CORS
app.use(cors());

//Set HTTP Security Headers
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP.',
});
app.use('/api', limiter);

//Body parser and limit data size for requests
app.use(
  express.json({
    limit: '10kb',
  })
);

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data Sanitizatoin against XSS
app.use(xss());

//Prevent parameter pollution
//white list for parameters you want multiple of
app.use(hpp({
  whitelist: [
    'duration'
  ]
}));

app.use('/api/v1/users', userRouter);
app.use('/api/v1/calendars', calendarRouter);
app.use('/api/v1/events', eventRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
