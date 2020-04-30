var tasks;
var lists;
var socket = io()

$('#task-input').keyup((e) => {
    if(e.keyCode === 13) {
        $('#addTaskBtn').click()
    }
})

$('#list-input').keyup((e) => {
    if(e.keyCode === 13) {
        $('#addListBtn').click()
    }
})

function addTask() {
    if ($('#task-input').val() == '') return
    socket.emit('addTask', { task: $('#task-input').val() })
    $('#task-input').val('')
    updateTasks()
}

function addList() {
    if ($('#list-input').val() == '') return
    socket.emit('addList', { list: $('#list-input').val() })
    $('#list-input').val('')
    updateTasks()
}

function removeList() {
    if ($('#list-input').val() == '') return
    socket.emit('removeList', { list: $('#list-input').val() })
    $('#list-input').val('')
    updateTasks()
}

function updateTasks() {
    socket.emit('updateTasks')
    updateLists()
}

function updateLists() {
    socket.emit('updateLists')
}

function tick(x) {
    socket.emit('tick', { id: x.value })
    updateTasks()
}

function renderTasks() {
    $('#tasks > ul').empty()
    var completed_tasks = []
    tasks.forEach(task => {
        var newTask = $('<li class=\"task\"></li>').text(task.task)
        if (task.completed == true) {
            newTask.prepend($(`<input type=\"checkbox\" value=\"${task.id}\" onclick=\"tick(this);\" checked><spacer>`))
            completed_tasks.push(newTask)
        } else if (task.completed == false) {
            newTask.prepend($(`<input type=\"checkbox\" value=\"${task.id}\" onclick=\"tick(this);\"><spacer>`))
            $('#tasks > ul').append(newTask)
        }
    })
    completed_tasks.forEach(task => {
        $('#tasks > ul').append(task)
    })
}

function changeList(x) {
    socket.emit('changeList', { list: x.getAttribute("value")})
    updateTasks()
}

function renderLists() {
    $('#lists').empty()
    lists.forEach(list => {
        var newList = $(`<a class=\"dropdown-item\" onclick=\"changeList(this);\" value=\"${list}\"></a>`).text(list)
        $('#lists').append(newList)
    })
}

function clearChecked() {
    socket.emit('clearChecked')
    updateTasks()
}

socket.on('updateTasks', (data) => {
    tasks = data.tasks
    renderTasks()
})

socket.on('updateLists', (data) => {
    lists = data.lists
    socket.emit('currentList')
    renderLists()
})


socket.on('currentList', (data) => {
    console.log('t')
    $('#list-name').text(`Current List: ${data.list}`)
})