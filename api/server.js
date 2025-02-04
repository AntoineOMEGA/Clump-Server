const mongoose = require('mongoose')
const dotenv = require('dotenv')

process.on('uncaughtException', (err) => {
  console.log('☣️ Uncaught Exception ☣️ Shutting Down')
  console.log(err)
  process.exit(1)
})

dotenv.config({ path: './config.env' })

const app = require('./app')

const DB = process.env.DATABASE_LOCAL

mongoose.connect(DB).then(() => console.log('DB Connetion Successful'))

const port = process.env.PORT || 3000
const server = app.listen(port, () =>
  console.log(`App listening on port ${port}!`)
)

process.on('unhandledRejection', (err) => {
  console.log('☣️ Unhandled Rejection ☣️ Shutting Down')
  console.log(err.name, err.message)
  server.close(() => {
    process.exit(1)
  })
})
