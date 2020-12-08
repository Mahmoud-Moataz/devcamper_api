const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');

//load env vars
dotenv.config({ path: './config/config.env' });

//connect to database
connectDB();

//Route files
const bootcamps = require('./routes/bootcamps');

const app = express();

//Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Mount routers
app.use('/api/v1/bootcamps', bootcamps);

const PORT = process.env.PORT;

const server = app.listen(
  PORT,
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

//Handle Unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
  console.log(`error: ${err.message}`);

  //close server & exit process
  server.close(() => process.exit(1));
});
