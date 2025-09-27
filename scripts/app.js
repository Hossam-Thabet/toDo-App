
const appKey = "ml_todo_all";
const langKey = "ml_todo_lang";

// ------- TRANSLATIONS -------
const translations = {
  en: {
    appTitle: "Multilingual To-Do App",
    appSub: "Simple local-only multilingual tasks",
    loginTitle: "Login",
    registerTitle: "Register",
    firstName: "First Name",
    lastName: "Last Name",
    username: "Username",
    password: "Password",
    loginBtn: "Login",
    registerBtn: "Register",
    gotoRegister: "Create an account",
    gotoLogin: "Already have an account? Login",
    logout: "Logout",
    addPlaceholder: "Add a new task",
    addBtn: "Add",
    editBtn: "Edit",
    deleteBtn: "Delete",
    doneLabel: "Done",
    markDone: "Mark done",
    myTasks: "My Tasks",
    welcomeMsg: "Welcome",
    noTasks: "No tasks yet — add one.",
    confirmDelete: "Delete this task?",
    editPrompt: "Edit task",
    stats: (done, total) => `${total} tasks — ${done} done`,
    invalidCreds: "Invalid username or password.",
    userExists: "User already exists.",
    fillAll: "Please fill all fields.",
    registeredOk: "Registered and logged in.",
    mustLogin: "You must be logged in.",
    backHome: "Back to Home",
  },
  ar: {
    appTitle: "تطبيق المهام متعدد اللغات",
    appSub: "تطبيق محلي بسيط يدعم العربية والإنجليزية",
    loginTitle: "تسجيل الدخول",
    registerTitle: "تسجيل",
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    username: "اسم المستخدم",
    password: "كلمة المرور",
    loginBtn: "دخول",
    registerBtn: "إنشاء حساب",
    gotoRegister: "إنشاء حساب جديد",
    gotoLogin: "هل لديك حساب؟ سجل الدخول",
    logout: "تسجيل الخروج",
    addPlaceholder: "أضف مهمة جديدة",
    addBtn: "إضافة",
    editBtn: "تعديل",
    deleteBtn: "حذف",
    doneLabel: "مكتملة",
    markDone: "وضع كمكتملة",
    myTasks: "مهامي",
    welcomeMsg: "مرحبا",
    noTasks: "لا توجد مهام بعد — أضف واحدة.",
    confirmDelete: "هل تريد حذف هذه المهمة؟",
    editPrompt: "تعديل المهمة",
    stats: (done, total) => `${total} مهمة — ${done} مكتملة`,
    invalidCreds: "اسم المستخدم أو كلمة المرور غير صحيحة.",
    userExists: "المستخدم موجود مسبقاً.",
    fillAll: "يرجى ملء جميع الحقول.",
    registeredOk: "تم التسجيل وتسجيل الدخول.",
    mustLogin: "يجب تسجيل الدخول.",
    backHome: "العودة للرئيسية",
  },
};

function t(key, ...args) {
  const lang = localStorage.getItem(langKey) || "en";
  const entry = translations[lang] && translations[lang][key];
  if (typeof entry === "function") return entry(...args);
  return entry || key;
}

// ------- STORAGE -------
function readState() {
  try {
    return (
      JSON.parse(localStorage.getItem(appKey)) || { users: {}, sessions: {} }
    );
  } catch (e) {
    return { users: {}, sessions: {} };
  }
}
function writeState(s) {
  localStorage.setItem(appKey, JSON.stringify(s));
}

// ------- AUTH -------
function registerUser(username, password, firstName, lastName) {
  const s = readState();
  if (!username || !password || !firstName || !lastName)
    return { ok: false, msg: "fill" };
  if (s.users[username]) return { ok: false, msg: "exists" };
  s.users[username] = { password, tasks: [], nextId: 1 };
  s.sessions.currentUser = username;
  writeState(s);
  return { ok: true };
}

function loginUser(username, password) {
  const s = readState();
  const u = s.users[username];
  if (!u || u.password !== password) return { ok: false };
  s.sessions.currentUser = username;
  writeState(s);
  return { ok: true };
}

function logoutUser() {
  const s = readState();
  delete s.sessions.currentUser;
  writeState(s);
  // go to login
  window.location.href = "./login.html";
}

function currentUser() {
  const s = readState();
  return s.sessions && s.sessions.currentUser;
}

// ------- TASKS -------
function getTasks() {
  const s = readState();
  const user = currentUser();
  if (!user) return [];
  return s.users[user].tasks || [];
}

function saveTasks(tasks) {
  const s = readState();
  const user = currentUser();
  if (!user) return;
  s.users[user].tasks = tasks;
  writeState(s);
}

function addTask(title) {
  if (!title) return;
  const s = readState();
  const user = currentUser();
  if (!user) return;
  const meta = s.users[user];
  const task = new Task(meta.nextId++, title);
  meta.tasks.push(task);
  writeState(s);
  return task;
}

function editTask(id, title) {
  const tasks = getTasks();
  const tsk = tasks.find((x) => x.id == id);
  if (tsk) {
    tsk.title = title;
    saveTasks(tasks);
  }
}

function deleteTask(id) {
  let tasks = getTasks();
  tasks = tasks.filter((x) => x.id != id);
  saveTasks(tasks);
}

function toggleDone(id) {
  const tasks = getTasks();
  const tsk = tasks.find((x) => x.id == id);
  if (tsk) {
    tsk.done = !tsk.done;
    saveTasks(tasks);
  }
}

// ------- LANGUAGE UI & APPLY -------
function populateLangSelect(selectEl) {
  selectEl.innerHTML = "";
  const optEn = document.createElement("option");
  optEn.value = "en";
  optEn.textContent = "English";
  const optAr = document.createElement("option");
  optAr.value = "ar";
  optAr.textContent = "العربية";
  selectEl.appendChild(optEn);
  selectEl.appendChild(optAr);
  selectEl.value = localStorage.getItem(langKey) || "en";
  selectEl.addEventListener("change", (e) => {
    setLanguage(e.target.value);
  });
}

function setLanguage(code) {
  localStorage.setItem(langKey, code);

  // document.documentElement.lang = code;
  // document.documentElement.dir = (code === 'ar') ? 'rtl' : 'ltr';
  // reapply translations on the page
  // applyTranslations();

  // force reload so all text re-renders correctly
  window.location.reload();
}

// scan for [data-i18n] attributes and placeholders
function applyTranslations() {
  const elems = document.querySelectorAll("[data-i18n]");
  elems.forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      const ph = t(key);
      el.placeholder = ph;
    } else {
      el.textContent = t(key);
    }
  });

  // special dynamic elements: e.g. stats
  const statsEl = document.getElementById("stats");
  if (statsEl) {
    const tasks = getTasks();
    statsEl.textContent = t(
      "stats",
      tasks.filter((x) => x.done).length,
      tasks.length
    );
  }
}

// ------- Small helpers -------
function el(q, from = document) {
  return from.querySelector(q);
}

function onReady(fn) {
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", fn);
  else fn();
}

// ------- Page-specific initialization -------
onReady(() => {
  // language selector(s) - any page may have an element with id="lang"
  const langSelects = document.querySelectorAll("#lang, .lang-select");
  langSelects.forEach((s) => populateLangSelect(s));

  // set initial language direction
  const lang = localStorage.getItem(langKey) || "en";
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

  applyTranslations();

  // common header logout button (if exists)
  const logoutBtn = el("#logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", logoutUser);

  // Run page-specific runner by pathname
  const path = window.location.pathname.split("/").pop();

  if (path === "" || path === "index.html") {
    // protect: must be logged in
    if (!currentUser()) {
      window.location.href = "./login.html";
      return;
    }
    initHomePage();
  } else if (path === "login.html") {
    if (currentUser()) {
      window.location.href = "./index.html";
      return;
    }
    initLoginPage();
  } else if (path === "register.html") {
    if (currentUser()) {
      window.location.href = "./index.html";
      return;
    }
    initRegisterPage();
  }

});

// ------- HOME (index.html) -------
function initHomePage() {
  // elements expected on index.html
  const addInput = el("#new-task");
  const addBtn = el("#add-btn");
  const list = el("#tasks-list");
  const empty = el("#empty-message");
  const userNode = el("#current-user");
  const statsNode = el("#stats");

  function render() {
    applyTranslations();
    const tasks = getTasks();
    list.innerHTML = "";
    if (tasks.length === 0) {
      empty.style.display = "block";
    } else {
      empty.style.display = "none";
    }

    tasks.forEach((task) => {
      const item = document.createElement("div");
      item.className = "task" + (task.done ? " done" : "");
      item.innerHTML = `
        <input type="checkbox" class="chk" ${
          task.done ? "checked" : ""
        } data-id="${task.id}" />
        <div class="title">${escapeHtml(task.title)}</div>
        <div class="task-actions">
          <button class="btn ghost edit" data-id="${task.id}">${t(
        "editBtn"
      )}</button>
          <button class="btn ghost delete" data-id="${task.id}">${t(
        "deleteBtn"
      )}</button>
        </div>
      `;
      list.appendChild(item);
    });

    // wire events
    list.querySelectorAll(".chk").forEach((cb) => {
      cb.addEventListener("change", (e) => {
        const id = Number(e.target.dataset.id);
        toggleDone(id);
        render();
      });
    });

    list.querySelectorAll(".edit").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = Number(e.currentTarget.dataset.id);
        const tasks = getTasks();
        const tsk = tasks.find((x) => x.id == id);
        const newTitle = prompt(t("editPrompt"), tsk ? tsk.title : "");
        if (newTitle != null && newTitle.trim() !== "") {
          editTask(id, newTitle.trim());
          render();
        }
      });
    });

    list.querySelectorAll(".delete").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = Number(e.currentTarget.dataset.id);
        if (confirm(t("confirmDelete"))) {
          deleteTask(id);
          render();
        }
      });
    });

    // user and stats
    userNode.textContent = currentUser() || "—";
    if (statsNode)
      statsNode.textContent = t(
        "stats",
        getTasks().filter((x) => x.done).length,
        getTasks().length
      );
  }

  // add
  addBtn.addEventListener("click", () => {
    const v = addInput.value.trim();
    if (!v) return;
    addTask(v);
    addInput.value = "";
    render();
  });
  
  addInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addBtn.click();
  });

  // initial render
  render();
}

// ------- LOGIN PAGE -------
function initLoginPage() {
  clearAuthInputs("#login-form");
  const formLogin = el("#login-form");
  const linkRegister = el("#to-register");

  formLogin.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const u = el("#login-username").value.trim();
    const p = el("#login-password").value;
    if (!u || !p) {
      alert(t("fillAll"));
      return;
    }
    const r = loginUser(u, p);
    if (!r.ok) {
      alert(t("invalidCreds"));
      return;
    }
    window.location.href = "./index.html";
  });

  linkRegister.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "./register.html";
  });
}

// ------- REGISTER PAGE -------
function initRegisterPage() {
  clearAuthInputs("#register-form");
  const form = el("#register-form");
  const toLogin = el("#to-login");

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const firstName = el("#reg-firstname").value.trim();
    const lastName = el("#reg-lastname").value.trim();
    const u = el("#reg-username").value.trim();
    const p = el("#reg-password").value;
    if (!u || !p || !firstName || !lastName) {
      alert(t("fillAll"));
      return;
    }
    const r = registerUser(u, p, firstName, lastName);
    if (!r.ok) {
      if (r.msg === "exists") alert(t("userExists"));
      else alert("Error");
      return;
    }
    // on success redirect to home
    window.location.href = "./index.html";
  });

  toLogin.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "./login.html";
  });
}

// ------- TASK CLASS -------
class Task {
  constructor(id, title, done = false, created = Date.now()) {
    this.id = id;
    this.title = title;
    this.done = done;
    this.created = created;
  }
}

// ------- util escape html -------
function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// ------- code to clear all input fields in login and register forms -------
function clearAuthInputs(formSelector) {
  const form = document.querySelector(formSelector);
  if (form) {
    form.querySelectorAll("input").forEach((input) => {
      input.value = "";
    });
  }
}
