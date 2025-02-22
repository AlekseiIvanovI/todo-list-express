const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient
const PORT = 2121
require('dotenv').config()

// Database connection details
let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'todo'

// Connect to MongoDB
MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)
    })

// Set up view engine and middleware
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Route to render the main page
app.get('/', async (request, response) => {
    // Retrieve todo items and count incomplete ones
    const todoItems = await db.collection('todos').find().toArray()
    const itemsLeft = await db.collection('todos').countDocuments({ completed: false })
    // Render the index page with todo items and count
    response.render('index.ejs', { items: todoItems, left: itemsLeft })
    // db.collection('todos').find().toArray()
    // .then(data => {
    //     db.collection('todos').countDocuments({completed: false})
    //     .then(itemsLeft => {
    //         response.render('index.ejs', { items: data, left: itemsLeft })
    //     })
    // })
    // .catch(error => console.error(error))
})

// Route to add a new todo item
app.post('/addTodo', (request, response) => {
    // Insert the new todo item into the database
    db.collection('todos').insertOne({ thing: request.body.todoItem, completed: false })
        .then(result => {
            console.log('Todo Added')
            response.redirect('/')
        })
        .catch(error => console.error(error))
})

// Route to mark a todo item as complete
app.put('/markComplete', (request, response) => {
    // Update the completed status of the specified todo item
    db.collection('todos').updateOne({ thing: request.body.itemFromJS }, {
        $set: {
            completed: true
        }
    }, {
        sort: { _id: -1 },
        upsert: false
    })
        .then(result => {
            console.log('Marked Complete')
            response.json('Marked Complete')
        })
        .catch(error => console.error(error))
})

// Route to mark a todo item as incomplete
app.put('/markUnComplete', (request, response) => {
    // Update the completed status of the specified todo item
    db.collection('todos').updateOne({ thing: request.body.itemFromJS }, {
        $set: {
            completed: false
        }
    }, {
        sort: { _id: -1 },
        upsert: false
    })
        .then(result => {
            console.log('Marked Incomplete')
            response.json('Marked Incomplete')
        })
        .catch(error => console.error(error))
})

// Route to delete a todo item
app.delete('/deleteItem', (request, response) => {
    // Delete the specified todo item from the database
    db.collection('todos').deleteOne({ thing: request.body.itemFromJS })
        .then(result => {
            console.log('Todo Deleted')
            response.json('Todo Deleted')
        })
        .catch(error => console.error(error))
})

// Start the server
app.listen(process.env.PORT || PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
