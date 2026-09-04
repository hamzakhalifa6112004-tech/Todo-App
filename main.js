/* Dark Mode Theme */
const themeToggle = document.querySelector(".theme-toggle");

// Load saved theme from localStorage, or default to "light" if none exists
const savedTheme = localStorage.getItem("theme") || "light";
document.body.setAttribute("data-theme", savedTheme);

themeToggle.addEventListener("click", () => {
  const isDark = document.body.getAttribute("data-theme") === "dark";
  const newTheme = isDark ? "light" : "dark";

  document.body.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme); // save the new theme choice
});

/* ----------------------------------------------------- */
// Load saved tasks from localStorage, or start with an empty array if none exist

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = tasks.length ? Math.max(...tasks.map((task) => task.id)) + 1 : 1;

const todoForm = document.querySelector(".input-section");
const todoList = document.querySelector(".todo-list");
const itemsLeftEl = document.querySelector(".items-left");
const newTodoInput = document.querySelector(".new-todo-input");

let currentFilter = "all"; // tracks which filter is currently active: "all" | "active" | "completed"
const filterBtns = document.querySelectorAll(".filter-btn");
const clearCompletedBtn = document.querySelector(".clear-completed");

function updateItemsLeft() {
  const remaining = tasks.filter((task) => !task.completed).length;
  itemsLeftEl.textContent = `${remaining} ${remaining === 1 ? "item" : "items"} left`;
}

// Save the current tasks array to localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  let visibleTasks = tasks;

  if (currentFilter === "active") {
    visibleTasks = tasks.filter((task) => !task.completed);
  } else if (currentFilter === "completed") {
    visibleTasks = tasks.filter((task) => task.completed);
  }
  todoList.innerHTML = visibleTasks
    .map(
      (task) => `
      <li class="todo-item" data-id="${task.id}">
        <div class="todo-item-content">
          <button type="button" class="circle ${task.completed ? "checked" : ""}" aria-label="Mark todo as complete"></button>
          <p class="todo-text ${task.completed ? "completed" : ""}">${task.text}</p>
        </div>
        <button class="delete-btn" type="button" aria-label="Delete todo">
          <img src="./images/icon-cross.svg" alt="" />
        </button>
      </li>
    `,
    )
    .join("");

  updateItemsLeft();
}

/* Add todo item */
todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const todoText = newTodoInput.value.trim();
  if (!todoText) return;

  tasks.push({ id: nextId++, text: todoText, completed: false });
  newTodoInput.value = "";
  saveTasks();
  renderTasks();
});

/* Delete + toggle complete */
todoList.addEventListener("click", (e) => {
  const taskItem = e.target.closest(".todo-item");
  if (!taskItem) return;
  const taskId = Number(taskItem.dataset.id);

  const deleteBtn = e.target.closest(".delete-btn");
  if (deleteBtn) {
    tasks = tasks.filter((task) => task.id !== taskId);
    saveTasks();
    renderTasks();
    return;
  }

  const circleBtn = e.target.closest(".circle");
  if (circleBtn) {
    const task = tasks.find((t) => t.id === taskId);
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  }
});

/* Drag and drop reordering */
new Sortable(todoList, {
  animation: 150,
  ghostClass: "dragging",

  onEnd: (evt) => {
    if (currentFilter !== "all") return;

    const { oldIndex, newIndex } = evt;
    const [movedTask] = tasks.splice(oldIndex, 1);
    tasks.splice(newIndex, 0, movedTask);
    saveTasks();
  },
});

/* Filter buttons (All / Active / Completed) */
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Update which filter is active
    currentFilter = btn.dataset.filter;

    // Remove "active" class from all buttons, then add it only to the clicked one
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderTasks();
  });
});

/* Clear Completed button */
clearCompletedBtn.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
});

renderTasks();
