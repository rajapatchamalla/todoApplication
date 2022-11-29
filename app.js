const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

app.get("/todos/?status=TO%20DO", async (request, response) => {
  const { status } = request.query;
  const statusArray = ["TO DO", "IN PROGRESS", "DONE"];
  const validStatus = statusArray.some((a) => a === status);
  if (validStatus) {
    const getTodoQuery = `
        SELECT * FROM todo WHERE status = '${status}'`;
    const data = await db.all(getTodoQuery);
    response.send(data);
  } else {
    response.status(400);
    response.send("Invalid Todo Status");
  }
});

app.get("/todos/?priority=HIGH", async (request, response) => {
  const { priority } = request.query;
  const priorityArray = ["HIGH", "MEDIUM", "LOW"];
  const validPriority = priorityArray.some((a) => a === status);
  if (validPriority) {
    const getTodoQuery = `
      SELECT * FROM todo WHERE priority = '${priority}'`;
    const data = await db.all(getTodoQuery);
    response.send(data);
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
});

app.get(
  "/todos/?priority=HIGH&status=IN%20PROGRESS",
  async (request, response) => {
    const { priority, status } = request.query;
    const statusArray = ["TO DO", "IN PROGRESS", "DONE"];
    const priorityArray = ["HIGH", "MEDIUM", "LOW"];
    const validPriority = priorityArray.some((a) => a === priority);
    const validStatus = statusArray.some((a) => a === status);
    if (validPriority === true && validStatus === false) {
      response.status(400);
      response.send("Invalid Todo Status");
    } else if (validPriority === false && validStatus === true) {
      response.status(400);
      response.send("Invalid Todo Priority");
    } else if (validPriority === true && validStatus === true) {
      const getTodoQuery = `
          SELECT * FROM todo WHERE priority = '${priority} AND status = '${status}'`;
      const data = await db.all(getTodoQuery);
      response.send(data);
    }
  }
);

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const getTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      id = ${todoId};`;
  const todo = await database.get(getTodoQuery);
  response.send(todo);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postTodoQuery = `
  INSERT INTO
    todo (id, todo, priority, status)
  VALUES
    (${id}, '${todo}', '${priority}', '${status}');`;
  await database.run(postTodoQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
  }
  const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`;
  const previousTodo = await database.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body;

  const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}'
    WHERE
      id = ${todoId};`;

  await database.run(updateTodoQuery);
  response.send(`${updateColumn} Updated`);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
  DELETE FROM
    todo
  WHERE
    id = ${todoId};`;

  await database.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
