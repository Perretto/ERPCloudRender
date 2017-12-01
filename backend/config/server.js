const port = 3001

const bodyParser = require('body-parser')
const express = require('express')
const server = express()
const allowCors = require('./cors')
const queryParser = require('express-query-int')

server.use(bodyParser.urlencoded({ limit:'100mb' }))
server.use(bodyParser.json({limit:'100mb'}))
server.use(allowCors)
server.use(queryParser())

server.listen(3001, function() {
    console.log(`BACKEND is running on port ${port}.`)
})

module.exports = server