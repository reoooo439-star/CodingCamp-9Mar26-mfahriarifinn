// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const theme = body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
});

// Time and Date Display
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
    const dateString = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    document.getElementById('time').textContent = timeString;
    document.getElementById('date').textContent = dateString;
    
    // Update greeting based on time
    const hour = now.getHours();
    let greeting = 'Good Evening';
    if (hour < 12) greeting = 'Good Morning';
    else if (hour < 18) greeting = 'Good Afternoon';
    
    document.getElementById('greeting-text').textContent = greeting;
}

updateTime();
setInterval(updateTime, 1000);

// User Name
const userNameInput = document.getElementById('user-name');
const savedName = localStorage.getItem('userName');
if (savedName) {
    userNameInput.value = savedName;
}

userNameInput.addEventListener('blur', () => {
    localStorage.setItem('userName', userNameInput.value);
});

// To-Do List
const todoInput = document.getElementById('todo-input');
const addTodoBtn = document.getElementById('add-todo');
const todoList = document.getElementById('todo-list');

let todos = JSON.parse(localStorage.getItem('todos')) || [];

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function renderTodos() {
    todoList.innerHTML = '';
    todos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo(${index})">
            <span>${todo.text}</span>
            <button class="delete-todo" onclick="deleteTodo(${index})">Delete</button>
        `;
        todoList.appendChild(li);
    });
}

function addTodo() {
    const text = todoInput.value.trim();
    if (text) {
        todos.push({ text, completed: false });
        saveTodos();
        renderTodos();
        todoInput.value = '';
    }
}

function toggleTodo(index) {
    todos[index].completed = !todos[index].completed;
    saveTodos();
    renderTodos();
}

function deleteTodo(index) {
    todos.splice(index, 1);
    saveTodos();
    renderTodos();
}

addTodoBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});

renderTodos();

// Pomodoro Timer
const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start-timer');
const pauseBtn = document.getElementById('pause-timer');
const resetBtn = document.getElementById('reset-timer');
const timerMode = document.getElementById('timer-mode');
const workTimeInput = document.getElementById('work-time');
const breakTimeInput = document.getElementById('break-time');

let timerInterval = null;
let timeLeft = 25 * 60;
let isWorkSession = true;
let isRunning = false;

// Load saved timer settings
const savedWorkTime = localStorage.getItem('workTime');
const savedBreakTime = localStorage.getItem('breakTime');
if (savedWorkTime) workTimeInput.value = savedWorkTime;
if (savedBreakTime) breakTimeInput.value = savedBreakTime;

workTimeInput.addEventListener('change', () => {
    localStorage.setItem('workTime', workTimeInput.value);
    if (!isRunning) {
        timeLeft = workTimeInput.value * 60;
        updateTimerDisplay();
    }
});

breakTimeInput.addEventListener('change', () => {
    localStorage.setItem('breakTime', breakTimeInput.value);
});

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            
            if (timeLeft === 0) {
                clearInterval(timerInterval);
                isRunning = false;
                playNotification();
                switchSession();
            }
        }, 1000);
    }
}

function pauseTimer() {
    clearInterval(timerInterval);
    isRunning = false;
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    isWorkSession = true;
    timeLeft = workTimeInput.value * 60;
    updateTimerDisplay();
    timerMode.textContent = 'Work Session';
}

function switchSession() {
    isWorkSession = !isWorkSession;
    if (isWorkSession) {
        timeLeft = workTimeInput.value * 60;
        timerMode.textContent = 'Work Session';
    } else {
        timeLeft = breakTimeInput.value * 60;
        timerMode.textContent = 'Break Time';
    }
    updateTimerDisplay();
}

function playNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Pomodoro Timer', {
            body: isWorkSession ? 'Break time is over!' : 'Work session complete!',
            icon: '⏰'
        });
    }
}

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

updateTimerDisplay();

// Quick Links
const linksGrid = document.getElementById('links-grid');
const linkNameInput = document.getElementById('link-name');
const linkUrlInput = document.getElementById('link-url');
const addLinkBtn = document.getElementById('add-link');

let links = JSON.parse(localStorage.getItem('links')) || [
    { name: 'Google', url: 'https://google.com' },
    { name: 'YouTube', url: 'https://youtube.com' },
    { name: 'GitHub', url: 'https://github.com' }
];

function saveLinks() {
    localStorage.setItem('links', JSON.stringify(links));
}

function renderLinks() {
    linksGrid.innerHTML = '';
    links.forEach((link, index) => {
        const linkDiv = document.createElement('a');
        linkDiv.className = 'link-item';
        linkDiv.href = link.url;
        linkDiv.target = '_blank';
        linkDiv.innerHTML = `
            ${link.name}
            <button class="delete-link" onclick="deleteLink(event, ${index})">×</button>
        `;
        linksGrid.appendChild(linkDiv);
    });
}

function addLink() {
    const name = linkNameInput.value.trim();
    const url = linkUrlInput.value.trim();
    
    if (name && url) {
        links.push({ name, url });
        saveLinks();
        renderLinks();
        linkNameInput.value = '';
        linkUrlInput.value = '';
    }
}

function deleteLink(event, index) {
    event.preventDefault();
    event.stopPropagation();
    links.splice(index, 1);
    saveLinks();
    renderLinks();
}

addLinkBtn.addEventListener('click', addLink);

renderLinks();
