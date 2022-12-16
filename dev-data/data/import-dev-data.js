require('dotenv').config();
const fs = require('fs');
const mongoose = require('mongoose');
const Book = require('../../models/bookModel');

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

const books = JSON.parse(
  fs.readFileSync(`${__dirname}/Books-simple.json`, 'utf-8')
);

const importData = async () => {
  try {
    await Book.create(books);
    console.log('data have loaded');
  } catch (err) {
    return err;
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Book.deleteMany();
    console.log('data have deleted');
  } catch (err) {
    return err;
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
