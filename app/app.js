'use strict'
const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const PORT = 8080
const mongoURI = "mongodb://127.0.0.1:27017/local"

/** init server application **/
const app = express()
/** set body-parser **/
app.use(express.json({ extended: true }))

/**
 * Set API routes
 * */

/** Authorization and login routs **/
app.use('/api/auth/', require('./routes/auth.routes'))

/** Admin API **/
app.use('/api/admin/', require('./routes/admin.routes'))

/** Production mode **/
if (process.env.NODE_ENV === 'production') {
    app.use('/', express.static(path.join(__dirname, '/client/build')))

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '/client/build/index.html'))
    })
}
/** Start server application **/
async function start() {
    try {
        /** db connection **/
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        })
        /** server app listener **/
        app.listen(PORT, () => console.log(`App has been started on port ${PORT}`))
    }
    catch (e) {
        console.log(`Server Error`, e.message)
        process.exit(1)
    }
}

/** Start API server **/
start()