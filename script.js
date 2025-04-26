
    tailwind.config = {
      darkMode: 'class',
    };

    if (!localStorage.getItem("theme")) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else if (localStorage.getItem("theme") === "dark") {
      document.documentElement.classList.add("dark");
    }

    function toggleTheme() {
      const html = document.documentElement;
      html.classList.toggle("dark");
      const newTheme = html.classList.contains("dark") ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
    }

    function showTab(tabId) {
  const sections = ['todo', 'chat', 'plan'];
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });

  const target = document.getElementById(tabId);
  if (target) target.classList.remove('hidden');
}

let countdownInterval;
let countdownEndTime;
let countdownSound; // <- neu


  function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')} : ${String(m).padStart(2, '0')} : ${String(s).padStart(2, '0')}`;
}

function updateCountdown() {
  const now = Date.now();
  const remaining = countdownEndTime - now;
  document.getElementById("countdownDisplay").textContent = formatCountdown(remaining);

  if (remaining <= 0) {
    clearInterval(countdownInterval);
    document.getElementById("countdownDisplay").textContent = "00 : 00 : 00";

    // Sound abspielen & merken
    countdownSound = new Audio("https://www.soundjay.com/free-music/midnight-ride-01a.mp3");
    countdownSound.play();
  }
}

function startCountdown() {
  const minutes = parseInt(document.getElementById("countdownInput").value);
  if (isNaN(minutes) || minutes <= 0) return;

  countdownEndTime = Date.now() + minutes * 60 * 1000;
  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 500);

  // Falls vorher Sound lief -> stoppen
  if (countdownSound) {
    countdownSound.pause();
    countdownSound.currentTime = 0;
  }
}

function stopCountdown() {
  clearInterval(countdownInterval);
  if (countdownSound) {
    countdownSound.pause();
    countdownSound.currentTime = 0;
  }
}

function resetCountdown() {
  clearInterval(countdownInterval);
  document.getElementById("countdownDisplay").textContent = "00 : 00 : 00";
  if (countdownSound) {
    countdownSound.pause();
    countdownSound.currentTime = 0;
  }
}






async function askGemini() {
  const input = document.getElementById("prompt");
  const chatbox = document.getElementById("chatbox");
  const prompt = input.value.trim();
  if (!prompt) return;

  // --- User-Nachricht (rechts) ---
  const userMsg = document.createElement("div");
  userMsg.className = "flex justify-end fade-in";     // hier rechts ausrichten
  userMsg.innerHTML = `
    <div class="bg-cyan-100 dark:bg-cyan-700/30 p-2 rounded-md max-w-[80%]">
       ${prompt}
    </div>
  `;
  chatbox.appendChild(userMsg);
  input.value = "";

  // Denk-Nachricht (zentriert, optional)
  const thinkingMsg = document.createElement("div");
  thinkingMsg.id = "thinking";
  thinkingMsg.className = "italic text-gray-400 dark:text-gray-500 fade-in";
  thinkingMsg.textContent = "Denke nach...";
  chatbox.appendChild(thinkingMsg);
  chatbox.scrollTop = chatbox.scrollHeight;

  // Anfrage an die API…
  
 const res = await fetch("/ask", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ prompt })
});

  const data = await res.json();
  document.getElementById("thinking")?.remove();

  // --- KI-Nachricht (links) ---
  const botMsg = document.createElement("div");
  botMsg.className = "flex justify-start fade-in";   // hier links ausrichten
  botMsg.innerHTML = `
    <div class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-2 rounded-md prose dark:prose-invert max-w-[80%]">
       ${marked.parse(data.response)}
    </div>
  `;
  chatbox.appendChild(botMsg);
  chatbox.scrollTop = chatbox.scrollHeight;
}
 

    function addTask(event, input) {
      if (event.key === "Enter" && input.value.trim()) {
        event.preventDefault();
        const newItem = document.createElement("li");
        newItem.className = "flex items-center gap-2 fade-in";
        newItem.innerHTML = `
          <button onclick="toggleDone(this)" class="text-xl">🔲</button>
          <input type="text" class="bg-transparent border-none w-full focus:outline-none" value="${input.value}" onkeydown="addTask(event, this)" />
        `;
        input.value = "";
        input.parentElement.parentElement.insertAdjacentElement("beforebegin", newItem);
      }
    }



function toggleDone(button) {
  const input = button.nextElementSibling;
  input.classList.toggle("line-through");
  button.textContent = input.classList.contains("line-through") ? "✅" : "🔲";
}

    function downloadCalendarPDF() {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text("📅 Wochenplan", 20, 20);

      const table = document.getElementById("calendarTable");
      const rows = table.querySelectorAll("tr");
      let y = 30;
      rows.forEach((row) => {
        let rowText = "";
        row.querySelectorAll("td, th").forEach(cell => {
          rowText += (cell.innerText || cell.textContent).trim() + " | ";
        });
        doc.text(rowText.trim(), 20, y);
        y += 10;
      });

      doc.save("wochenplan.pdf");
    }

    function downloadTodoPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text("Deine To-Do-Liste", 20, 20);

  const tasks = document.querySelectorAll("#todoList li input[type='text']");
  let y = 30;
  tasks.forEach((input) => {
    const done = input.classList.contains("line-through") ? "[x]" : "[ ]";
    if (input.value.trim()) {
      doc.text(`${done} ${input.value}`, 20, y);
      y += 10;
    }
  });

  doc.save("todo-liste.pdf");
}

function toggleDone(button) {
  const input = button.nextElementSibling;
  input.classList.toggle("line-through");
  button.textContent = input.classList.contains("line-through") ? "✅" : "🔲";
  saveTodoList();
}

function saveTodoList() {
  const todos = [];
  document.querySelectorAll("#todoList li input[type='text']").forEach(input => {
    todos.push({
      text: input.value,
      done: input.classList.contains("line-through")
    });
  });
  localStorage.setItem("todoList", JSON.stringify(todos));
}

function loadTodoList() {
  const saved = JSON.parse(localStorage.getItem("todoList") || "[]");
  const list = document.getElementById("todoList");
  list.innerHTML = ""; // Alles leeren

  saved.forEach(({ text, done }) => {
    const item = document.createElement("li");
    item.className = "flex items-center gap-2 fade-in";
    item.innerHTML = `
      <button onclick="toggleDone(this)" class="text-xl">${done ? "✅" : "🔲"}</button>
      <input type="text" class="bg-transparent border-none w-full focus:outline-none ${done ? "line-through" : ""}" value="${text}" onkeydown="addTask(event, this)" />
    `;
    list.appendChild(item);
  });
}

function addEmptyTask() {
  const list = document.getElementById("todoList");
  const item = document.createElement("li");
  item.className = "flex items-center gap-2 fade-in";
  item.innerHTML = `
    <button onclick="toggleDone(this)" class="text-xl">🔲</button>
    <input type="text" class="bg-transparent border-none w-full focus:outline-none" placeholder="Neue Aufgabe..." onkeydown="addTask(event, this)" />
  `;
  list.appendChild(item);
}

function addTask(event, input) {
  if (event.key === "Enter" && input.value.trim()) {
    event.preventDefault();
    input.blur();
    saveTodoList();
  }
}

function saveCalendar() {
  const rows = document.querySelectorAll("#calendarTable tbody tr");
  const data = [];
  rows.forEach(row => {
    const cells = row.querySelectorAll("td");
    const time = cells[0].innerText;
    const entries = [];
    for (let i = 1; i < cells.length; i++) {
      entries.push(cells[i].innerText);
    }
    data.push({ time, entries });
  });
  localStorage.setItem("calendarData", JSON.stringify(data));
}

function loadCalendar() {
  const data = JSON.parse(localStorage.getItem("calendarData") || "[]");
  if (data.length === 0) return;
  const rows = document.querySelectorAll("#calendarTable tbody tr");
  rows.forEach((row, i) => {
    const cells = row.querySelectorAll("td");
    if (!data[i]) return;
    for (let j = 1; j < cells.length; j++) {
      cells[j].innerText = data[i].entries[j - 1] || "";
    }
  });
}

function resetAll() {
  localStorage.removeItem("todoList");
  localStorage.removeItem("calendarData");
  loadTodoList();

  const rows = document.querySelectorAll("#calendarTable tbody tr");
  rows.forEach(row => {
    const cells = row.querySelectorAll("td");
    for (let i = 1; i < cells.length; i++) {
      cells[i].innerText = "";
    }
  });
}


window.addEventListener("DOMContentLoaded", () => {
  loadTodoList();
  loadCalendar();

  // Reset-Button einfügen (einmalig)
  const todoSection = document.querySelector("#todo");
  if (todoSection && !document.getElementById("resetButton")) {
    const btn = document.createElement("button");
    btn.id = "resetButton";
    btn.textContent = "🗑️ Zurücksetzen";
    btn.className = "mt-4 bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-sm w-full";
    btn.onclick = resetAll;
    todoSection.appendChild(btn);
  }

  // + Button zum neuen Task hinzufügen
  if (!document.getElementById("addTaskButton")) {
    const addBtn = document.createElement("button");
    addBtn.id = "addTaskButton";
    addBtn.textContent = "+ Neue Aufgabe";
    addBtn.className = "mt-2 bg-cyan-600 text-white px-2 py-1 rounded hover:bg-cyan-700 text-sm w-full";
    addBtn.onclick = addEmptyTask;
    todoSection.appendChild(addBtn);
  }
});

window.addEventListener("beforeunload", () => {
  saveTodoList();
  saveCalendar();
});
