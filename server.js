const express = require('express');
const {graphqlHTTP} = require('express-graphql');
const cors = require('cors');
const {buildSchema} = require('graphql');
const {readFileSync} = require('fs');
const {nanoid} = require('nanoid');

let allTodos = [{
    id: 'first-test-todo',
    title: 'First test todo',
    completed: false
}];

const schemaString = readFileSync('./schema.graphql', {encoding: 'utf8'});

const schema = buildSchema(schemaString);

const root = {
    batchSyncTodos: ({todosToAdd = [], todosToRemove = [], todosToUpdate = []}) => {
      const addedTodoItems = todosToAdd.map(todoTitle => {
        const todo = {
            id: nanoid(),
            completed: false,
            title: todoTitle,
        };
        allTodos.unshift(todo);
        return todo;
      })
      const removedTodoItems = todosToRemove.map(todoTitle => {
        const todo = allTodos.find(todo => todo.title = todoTitle);
        const indexOfTodo = allTodos.indexOf(todo);
        const [removedTodo] = allTodos.splice(indexOfTodo, 1);
        return removedTodo;
      })
      const updatedTodoItems = todosToUpdate.map(todoToUpdate => {
        let todo = allTodos.find(todo => todo.title == todoToUpdate.title);
        todo = Object.assign(todo, todoToUpdate)
        return todo;
      })
      return {
        addedTodoItems,
        removedTodoItems,
        updatedTodoItems
      }
    },
  
    getAllTodos: ({search = ""}) => {
      return allTodos.filter(todo => todo.title.includes(search));
    },

    addTodo: title => {
        const todo = {
            id: nanoid(),
            completed: false,
            title,
        };
        allTodos.unshift(todo);
        return todo;
    },

    updateTodo: params => {
        const todo = allTodos.find(({id}) => params.id === id);
        todo.completed = !todo.completed;
        return allTodos;
    },

    removeTodo: params => {
        allTodos = allTodos.filter(({id}) => params.id !== id)
        return allTodos;
    },
};

const app = express();

app.use(cors());

app.use(
    '/graphql',
    graphqlHTTP({
        schema: schema,
        rootValue: root,
        graphiql: true
    })
);

app.listen(3005, () => console.log('Server started on 3005 port'));
