
const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const searchInput = document.getElementById("search-input");
const emptyMessage = document.getElementById("empty-message");

const totalCount = document.getElementById("total-count");
const completedCount = document.getElementById("completed-count");
const pendingCount = document.getElementById("pending-count");

let todos = JSON.parse(localStorage.getItem("todos")) || [];
let currentFilter = "all";

// Save tasks in browser
function saveTodos() {
    localStorage.setItem("todos", JSON.stringify(todos));
}

// Add a new task
todoForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const taskText = todoInput.value.trim();

    if (taskText === "") {
        alert("Please enter a task!");
        return;
    }

    const todo = {
        id: Date.now(),
        text: taskText,
        completed: false
    };

    todos.push(todo);
    saveTodos();

    todoInput.value = "";
    renderTodos();
});

// Display tasks
function renderTodos() {
    todoList.innerHTML = "";

    const searchText = searchInput.value.toLowerCase().trim();

    const filteredTodos = todos.filter(function (todo) {
        const matchesSearch = todo.text.toLowerCase().includes(searchText);

        const matchesFilter =
            currentFilter === "all" ||
            (currentFilter === "completed" && todo.completed) ||
            (currentFilter === "pending" && !todo.completed);

        return matchesSearch && matchesFilter;
    });

    filteredTodos.forEach(function (todo) {
        const li = document.createElement("li");

        li.innerHTML = `
            <input
                type="checkbox"
                data-action="toggle"
                data-id="${todo.id}"
                ${todo.completed ? "checked" : ""}
                aria-label="Mark task complete"
            >

            <span class="${todo.completed ? "done" : ""}"></span>

            <button data-action="edit" data-id="${todo.id}">
                Edit
            </button>

            <button data-action="delete" data-id="${todo.id}">
                Delete
            </button>
        `;

        li.querySelector("span").textContent = todo.text;
        todoList.appendChild(li);
    });

    emptyMessage.style.display =
        filteredTodos.length === 0 ? "block" : "none";

    if (todos.length === 0) {
        emptyMessage.textContent = "No tasks yet. Add your first task!";
    } else if (filteredTodos.length === 0) {
        emptyMessage.textContent = "No matching tasks found.";
    }

    totalCount.textContent = todos.length;

    completedCount.textContent =
        todos.filter(todo => todo.completed).length;

    pendingCount.textContent =
        todos.filter(todo => !todo.completed).length;
}

// Event delegation: handle all task buttons from the parent list
todoList.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = Number(button.dataset.id);
    const action = button.dataset.action;

    if (action === "delete") {
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        renderTodos();
    }

    if (action === "edit") {
        const todo = todos.find(todo => todo.id === id);
        if (!todo) return;

        const updatedText = prompt("Edit your task:", todo.text);

        if (updatedText === null) return;

        if (updatedText.trim() === "") {
            alert("Task cannot be empty!");
            return;
        }

        todo.text = updatedText.trim();
        saveTodos();
        renderTodos();
    }
});

// Mark task as completed or pending
todoList.addEventListener("change", function (event) {
    if (event.target.dataset.action !== "toggle") return;

    const id = Number(event.target.dataset.id);
    const todo = todos.find(todo => todo.id === id);

    if (todo) {
        todo.completed = event.target.checked;
        saveTodos();
        renderTodos();
    }
});

// Search tasks
searchInput.addEventListener("input", renderTodos);

// All, Pending and Completed filters
document.querySelector(".filters").addEventListener("click", function (event) {
    const button = event.target.closest("button[data-filter]");

    if (!button) return;

    currentFilter = button.dataset.filter;
    renderTodos();
});

// Load saved tasks when page opens
renderTodos();
