require('dotenv').config();
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log('uncaught exception appear, Shutting down !');
  console.log(err.name, err.message);
  process.exit(1);
});
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASS
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('DB Connection successful!');
  });

const port = process.env.PORT;
const host = process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0';
const server = app.listen(port, host, () => {
  console.log(`app running on ${host}:${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('unhandled error appear, Shutting down !');
  console.log(`💥Error Name💥: ${err.name}`);
  console.log(`💥💥Error Text: ${err}`);
  server.close(() => {
    process.exit(1);
  });
});
