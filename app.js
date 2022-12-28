const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRouter');
const bookRouter = require('./routes/bookRouter');
const defaultRouter = require('./routes/defaultRouter');

app.use(helmet());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many request from this IP, please try again in an hour',
});
app.use('/api', limiter);
app.use(express.json({ limit: '25kb' }));
app.use(mongoSanitize());
app.use(xss());

app.use(
  hpp({
    // whitelist: ['genre', 'ratingsAverage', 'ratingsQuantity', 'pages'],
    whitelist: ['genre', 'pages'],
  })
);
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
app.use('/api/v1/books', bookRouter);
app.use('/api/v1/users', userRouter);
app.use('/', defaultRouter);
app.all('*', (req, res, next) => {
  next(new AppError(`Can not find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
