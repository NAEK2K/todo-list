// express + socket.io
const app = require('express')()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
port = 8080

// file system
const path = require('path')
const fs = require('fs')

// lowdb
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)

// lowdb init
db.defaults({tasks: []}).write()

// uuidv4
const { uuid } = require('uuidv4')

io.on('connection', socket => {
    socket.on('addTask', (data) => {
        db.get('tasks').push({id: uuid(), task: data.task, completed: false}).write()
    })
    socket.on('updateTasks', () => {
        socket.emit('updateTasks', {tasks: db.get('tasks')})
    })
    socket.on('tick', (data) => {
        db.get('tasks').find({ id: data.id}).assign({completed: !(db.get('tasks').find({ id: data.id}).get('completed').value())}).value()
        db.write()
    })
    socket.on('clearChecked', () => {
        db.get('tasks').remove({ completed: true }).write()
    })
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

server.listen(port, () => {

})