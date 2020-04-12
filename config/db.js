const mongoose = require('mongoose')

const connectDB = async () => {
  const connection = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })

  console.log(`MongoDB Connected: ${connection.connection.host}`.cyan.underline.bold)

  // No need to add try/catch block to look for errors,
  // as we have added process.on('unhandledRejection'...)
  // method inside server.js
}

module.exports = connectDB