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
db.defaults({tasks: [], lists: ["Main"]}).write()

// uuidv4
const { uuid } = require('uuidv4')

io.on('connection', socket => {
    socket.list = "Main"
    socket.on('addTask', (data) => {
        db.get('tasks').push({id: uuid(), task: data.task, completed: false, list: socket.list}).write()
    })
    socket.on('updateTasks', () => {
        socket.emit('updateTasks', {tasks: db.get('tasks').filter((task) => task.list == socket.list).value()})
    })
    socket.on('updateLists', () => {
        socket.emit('updateLists', {lists: db.get('lists').value()})
    })
    socket.on('tick', (data) => {
        db.get('tasks').find({ id: data.id}).assign({completed: !(db.get('tasks').find({ id: data.id}).get('completed').value())}).write()
    })
    socket.on('clearChecked', () => {
        db.get('tasks').remove({ completed: true }).write()
    })
    socket.on('changeList', (data) => {
        socket.list = data.list
    })
    socket.on('addList', (data) => {
        if(db.get('lists').value().includes(data.list)) return
        db.get('lists').push(data.list).write()
        socket.list = data.list
    })
    socket.on('removeList', (data) => {
        if(data.list == 'Main') return
        db.get('tasks').remove({list: data.list}).write()
        db.get('lists').pull(data.list).write()
        socket.list = 'Main'
    })
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.get('/index.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.js'))
})

server.listen(port, () => {

})