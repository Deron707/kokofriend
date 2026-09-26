/* =====================================================
   KOKO'S FRIEND
   Main application JavaScript
===================================================== */


/* =====================================================
   DATA
===================================================== */

const punishmentCards = [

    "Do extra activities and school work",

    "Be a cleaner for a whole school day",

    "Lead the School Assembly Warmup routine",

    "Lead the PISQ shine dance",

    "Review or report the previous lesson",

    "Make a study plan for the next lecture",

    "Answer 10 questions from the previous lesson",

    "Share at least 1 issue that should be solved in PISQ",

    "Buy at least 1 item from the cafeteria for the friend",

    "Send your friend a photo of your completed notes"

];


/* =====================================================
   APP STATE
===================================================== */

let state = JSON.parse(
    localStorage.getItem("kokosFriendState")
) || {

    tasks: [],

    schedules: [],

    streak: 0,

    xp: 0,

    level: 1,

    totalCompleted: 0,

    remindersDone: 0,

    inviteCode: null,

    friendConnected: false,

    friendName: "No friend yet"

};


/* =====================================================
   SAVE STATE
===================================================== */

function saveState() {

    localStorage.setItem(
        "kokosFriendState",
        JSON.stringify(state)
    );

}


/* =====================================================
   DOM HELPERS
===================================================== */

const $ = id => document.getElementById(id);

const pages = document.querySelectorAll(".page");

const navButtons =
    document.querySelectorAll(".nav-btn");


/* =====================================================
   PAGE NAVIGATION
===================================================== */

navButtons.forEach(button => {

    button.addEventListener("click", () => {

        const page = button.dataset.page;

        showPage(page);

        document
            .querySelector(".sidebar")
            .classList.remove("open");

    });

});


function showPage(pageName) {

    pages.forEach(page => {

        page.classList.remove("active");

    });

    const selected =
        document.getElementById(pageName);

    if (selected) {

        selected.classList.add("active");

    }


    navButtons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.page === pageName
        );

    });


    const titles = {

        dashboard: [
            "Good day! 👋",
            "Let's keep each other accountable."
        ],

        schedule: [
            "Our Schedule 📅",
            "See what you and your friend need to do."
        ],

        tasks: [
            "Accountability Tasks ✅",
            "Nobody gets to escape their responsibilities."
        ],

        timer: [
            "Work Together ⏱️",
            "Call your friend and get to work."
        ],

        punishments: [
            "Punishment Cards 🎴",
            "If you fail, Koko knows what happens."
        ],

        koko: [
            "Meet Koko 🐨",
            "Your accountability pet grows with you."
        ]

    };


    if (titles[pageName]) {

        $("pageTitle").textContent =
            titles[pageName][0];

        $("pageSubtitle").textContent =
            titles[pageName][1];

    }

}


/* =====================================================
   MOBILE MENU
===================================================== */

$("mobileMenu").addEventListener(
    "click",
    () => {

        document
            .querySelector(".sidebar")
            .classList.toggle("open");

    }
);


/* =====================================================
   MODALS
===================================================== */

function openModal(id) {

    $(id).classList.remove("hidden");

}


function closeModal(id) {

    $(id).classList.add("hidden");

}


document
    .querySelectorAll(".close-modal")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => closeModal(button.dataset.close)
        );

    });


/* =====================================================
   TASK MODAL
===================================================== */

$("addTaskBtn").addEventListener(
    "click",
    () => openModal("taskModal")
);

$("addTaskDashboard").addEventListener(
    "click",
    () => openModal("taskModal")
);


$("saveTask").addEventListener(
    "click",
    addTask
);


function addTask() {

    const text =
        $("taskInput").value.trim();

    const owner =
        $("taskOwner").value;

    const time =
        $("taskTime").value;


    if (!text) {

        alert("Please enter a task.");

        return;

    }


    const task = {

        id: Date.now(),

        text,

        owner,

        time: time || "Anytime",

        completed: false,

        proof: false,

        date: getDateKey(new Date())

    };


    state.tasks.push(task);

    saveState();

    $("taskInput").value = "";

    $("taskTime").value = "";

    closeModal("taskModal");

    renderAll();

}


/* =====================================================
   TASK RENDERING
===================================================== */

function renderTasks(filter = "all") {

    const container = $("allTasks");

    let tasks = [...state.tasks];


    if (filter === "mine") {

        tasks = tasks.filter(
            task => task.owner === "me"
        );

    }


    if (filter === "friend") {

        tasks = tasks.filter(
            task => task.owner === "friend"
        );

    }


    if (filter === "completed") {

        tasks = tasks.filter(
            task => task.completed
        );

    }


    if (tasks.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                No tasks found.
            </div>
        `;

        return;

    }


    container.innerHTML = tasks.map(task => `

        <div class="task-item">

            <button
                class="task-check ${task.completed ? "completed" : ""}"
                onclick="toggleTask(${task.id})"
            >
                ${task.completed ? "✓" : ""}
            </button>

            <div class="task-info">

                <strong
                    style="${task.completed ? "text-decoration:line-through;opacity:.5" : ""}"
                >
                    ${escapeHTML(task.text)}
                </strong>

                <small>
                    ${task.time === "Anytime"
                        ? "Anytime"
                        : "Due " + task.time}
                </small>

            </div>

            <span class="owner-tag">
                ${task.owner === "me" ? "ME" : "FRIEND"}
            </span>

            ${
                task.completed
                ?
                `<button
                    class="secondary-btn"
                    onclick="openProof(${task.id})"
                >
                    ${task.proof ? "✓ Proof" : "Proof"}
                </button>`
                :
                ""
            }

        </div>

    `).join("");

}


/* =====================================================
   TODAY TASKS
===================================================== */

function renderTodayTasks() {

    const container = $("todayTasks");

    const today =
        getDateKey(new Date());


    const tasks =
        state.tasks.filter(
            task => task.date === today
        );


    $("taskCount").textContent =
        `${tasks.length} task${tasks.length === 1 ? "" : "s"}`;


    if (tasks.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                No tasks yet.<br>
                Add something you need to accomplish.
            </div>
        `;

        return;

    }


    container.innerHTML = tasks.map(task => `

        <div class="task-item">

            <button
                class="task-check ${task.completed ? "completed" : ""}"
                onclick="toggleTask(${task.id})"
            >
                ${task.completed ? "✓" : ""}
            </button>

            <div class="task-info">

                <strong>
                    ${escapeHTML(task.text)}
                </strong>

                <small>
                    ${task.time}
                </small>

            </div>

            <span class="owner-tag">
                ${task.owner === "me" ? "ME" : "FRIEND"}
            </span>

        </div>

    `).join("");

}


/* =====================================================
   TOGGLE TASK
===================================================== */

window.toggleTask = function(id) {

    const task =
        state.tasks.find(
            task => task.id === id
        );


    if (!task) return;


    task.completed =
        !task.completed;


    if (task.completed) {

        state.totalCompleted++;

        addXP(20);

    } else {

        state.totalCompleted =
            Math.max(
                0,
                state.totalCompleted - 1
            );

    }


    updateStreak();

    saveState();

    renderAll();

};


/* =====================================================
   PROOF
===================================================== */

let currentProofTask = null;


window.openProof = function(id) {

    currentProofTask = id;

    openModal("proofModal");

};


$("submitProof").addEventListener(
    "click",
    submitProof
);


function submitProof() {

    const file =
        $("proofInput").files[0];


    if (!file) {

        alert("Please choose a photo as proof.");

        return;

    }


    const task =
        state.tasks.find(
            task => task.id === currentProofTask
        );


    if (task) {

        task.proof = true;

        state.remindersDone++;

        addXP(10);

    }


    $("proofInput").value = "";

    closeModal("proofModal");

    saveState();

    renderAll();

    alert("Proof submitted! 🎉");

}


/* =====================================================
   SCHEDULE
===================================================== */

$("addScheduleBtn").addEventListener(
    "click",
    () => openModal("scheduleModal")
);


$("saveSchedule").addEventListener(
    "click",
    addSchedule
);


function addSchedule() {

    const text =
        $("scheduleInput").value.trim();

    const time =
        $("scheduleTime").value;

    const owner =
        $("scheduleOwner").value;


    if (!text || !time) {

        alert("Please enter the activity and time.");

        return;

    }


    state.schedules.push({

        id: Date.now(),

        text,

        time,

        owner,

        date: getDateKey(new Date())

    });


    $("scheduleInput").value = "";

    $("scheduleTime").value = "";


    closeModal("scheduleModal");

    saveState();

    renderSchedule();

}


/* =====================================================
   SCHEDULE RENDER
===================================================== */

let calendarDate =
    new Date();


function renderSchedule() {

    const dateKey =
        getDateKey(calendarDate);


    $("calendarDate").textContent =
        formatDate(calendarDate);


    const schedules =
        state.schedules
            .filter(
                item => item.date === dateKey
            )
            .sort(
                (a,b) =>
                    a.time.localeCompare(b.time)
            );


    const container =
        $("scheduleList");


    if (schedules.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                Nothing scheduled for this day.
            </div>
        `;

        return;

    }


    container.innerHTML =
        schedules.map(item => `

            <div class="schedule-item">

                <div class="schedule-time">
                    ${item.time}
                </div>

                <div class="schedule-info">

                    <strong>
                        ${escapeHTML(item.text)}
                    </strong>

                    <p>
                        ${item.owner === "me"
                            ? "Your task"
                            : "Friend's task"}
                    </p>

                </div>

                <span class="owner-tag">
                    ${item.owner === "me"
                        ? "ME"
                        : "FRIEND"}
                </span>

            </div>

        `).join("");

}


$("previousDay").addEventListener(
    "click",
    () => {

        calendarDate.setDate(
            calendarDate.getDate() - 1
        );

        renderSchedule();

    }
);


$("nextDay").addEventListener(
    "click",
    () => {

        calendarDate.setDate(
            calendarDate.getDate() + 1
        );

        renderSchedule();

    }
);


/* =====================================================
   TASK FILTERS
===================================================== */

document
    .querySelectorAll(".filter")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".filter")
                    .forEach(
                        b => b.classList.remove("active")
                    );

                button.classList.add("active");

                renderTasks(
                    button.dataset.filter
                );

            }
        );

    });


/* =====================================================
   INVITE CODE
===================================================== */

$("createInvite").addEventListener(
    "click",
    createInviteCode
);


function createInviteCode() {

    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code = "";

    for (let i = 0; i < 6; i++) {

        code +=
            chars[
                Math.floor(
                    Math.random() * chars.length
                )
            ];

    }


    state.inviteCode = code;

    saveState();

    $("inviteCode").textContent =
        code;

    $("inviteDisplay")
        .classList.remove("hidden");

}


$("copyInvite").addEventListener(
    "click",
    async () => {

        if (!state.inviteCode) return;

        await navigator.clipboard.writeText(
            state.inviteCode
        );

        $("copyInvite").textContent =
            "Copied!";

        setTimeout(() => {

            $("copyInvite").textContent =
                "Copy";

        }, 1500);

    }
);


/* =====================================================
   JOIN FRIEND
===================================================== */

$("joinFriend").addEventListener(
    "click",
    () => openModal("friendModal")
);


$("connectFriend").addEventListener(
    "click",
    connectFriend
);


function connectFriend() {

    const code =
        $("friendCodeInput")
            .value
            .trim()
            .toUpperCase();


    if (code.length !== 6) {

        alert("Enter a valid 6-character code.");

        return;

    }


    state.friendConnected = true;

    state.friendName = "Your Friend";


    saveState();

    closeModal("friendModal");

    updateFriendUI();

    alert(
        "Friend connected! 🤝\n\nIn the full online version, both users would now share the same account data."
    );

}


function updateFriendUI() {

    if (state.friendConnected) {

        $("friendNameSide")
            .textContent =
            state.friendName;

        $("friendStatus")
            .textContent =
            "Connected ✓";

        $("connectionTitle")
            .textContent =
            "You're connected! 🤝";

        $("connectionText")
            .textContent =
            "You and your friend can now keep each other accountable.";

    }

}


/* =====================================================
   WORK TIMER
===================================================== */

let timerSeconds = 0;

let timerInterval = null;


function updateTimerDisplay() {

    const hours =
        Math.floor(timerSeconds / 3600);

    const minutes =
        Math.floor(
            (timerSeconds % 3600) / 60
        );

    const seconds =
        timerSeconds % 60;


    $("timerDisplay").textContent =

        `${String(hours).padStart(2,"0")}:` +

        `${String(minutes).padStart(2,"0")}:` +

        `${String(seconds).padStart(2,"0")}`;

}


$("startTimer").addEventListener(
    "click",
    () => {

        if (timerInterval) return;


        $("timerStatus").textContent =
            "Working with your friend... 💪";


        timerInterval =
            setInterval(() => {

                timerSeconds++;

                updateTimerDisplay();

            }, 1000);

    }
);


$("pauseTimer").addEventListener(
    "click",
    () => {

        clearInterval(timerInterval);

        timerInterval = null;

        $("timerStatus").textContent =
            "Timer paused.";

    }
);


$("resetTimer").addEventListener(
    "click",
    () => {

        clearInterval(timerInterval);

        timerInterval = null;

        timerSeconds = 0;

        updateTimerDisplay();

        $("timerStatus").textContent =
            "Ready to work.";

    }
);


/* =====================================================
   CALL BUTTON
===================================================== */

$("callFriend").addEventListener(
    "click",
    () => {

        if (!state.friendConnected) {

            alert(
                "Connect with your friend first!"
            );

            return;

        }


        alert(
            "📞 Call feature placeholder.\n\nFor the full version, this can connect to a video/audio call service."
        );

    }
);


/* =====================================================
   PUNISHMENTS
===================================================== */

function renderPunishments() {

    $("punishmentGrid").innerHTML =
        punishmentCards.map(
            (punishment,index) => `

                <div class="punishment-tile">

                    <span>
                        CARD #${index + 1}
                    </span>

                    <h3>
                        ${punishment}
                    </h3>

                </div>

            `
        ).join("");

}


$("drawPunishment").addEventListener(
    "click",
    drawPunishment
);


function drawPunishment() {

    const index =
        Math.floor(
            Math.random() *
            punishmentCards.length
        );


    $("punishmentNumber")
        .textContent =
        `#${index + 1}`;

    $("punishmentText")
        .textContent =
        punishmentCards[index];


    $("punishmentResult")
        .classList.remove("hidden");


    $("punishmentResult")
        .scrollIntoView({
            behavior: "smooth"
        });

}


$("acceptPunishment").addEventListener(
    "click",
    () => {

        alert(
            "Punishment accepted. 😭\n\nRemember to show proof when you complete it!"
        );

    }
);


/* =====================================================
   KOKO XP
===================================================== */

function addXP(amount) {

    state.xp += amount;


    while (state.xp >= 100) {

        state.xp -= 100;

        state.level++;

    }


    saveState();

    updateKoko();

}


function updateKoko() {

    const level =
        state.level;


    let emoji =
        "🐨";

    let description =
        "Baby Koko";


    if (level >= 3) {

        emoji = "🐨✨";

        description =
            "Growing Koko";

    }


    if (level >= 5) {

        emoji = "🐨🌸";

        description =
            "Happy Koko";

    }


    if (level >= 8) {

        emoji = "🐨💖";

        description =
            "Super Koko";

    }


    if (level >= 12) {

        emoji = "🐨👑";

        description =
            "Accountability King Koko";

    }


    $("bigKoko").textContent =
        emoji;

    $("kokoEmojiHero").textContent =
        emoji;

    $("kokoLevel").textContent =
        `Level ${level}`;

    $("kokoLevelHero").textContent =
        `Koko • Level ${level}`;

    $("kokoDescription").textContent =
        description;


    $("xpText").textContent =
        `${state.xp} / 100`;


    $("xpFill").style.width =
        `${state.xp}%`;


    $("totalCompleted").textContent =
        state.totalCompleted;


    $("currentStreak").textContent =
        state.streak;


    $("remindersDone").textContent =
        state.remindersDone;


    $("streakNumber").textContent =
        state.streak;

}


/* =====================================================
   STREAK
===================================================== */

function updateStreak() {

    const todayTasks =
        state.tasks.filter(
            task =>
                task.date === getDateKey(new Date())
        );


    if (
        todayTasks.length > 0 &&
        todayTasks.every(task => task.completed)
    ) {

        if (state.streak === 0) {

            state.streak = 1;

        }

    }


    saveState();

}


/* =====================================================
   DAILY PROGRESS
===================================================== */

function updateProgress() {

    const today =
        getDateKey(new Date());


    const tasks =
        state.tasks.filter(
            task => task.date === today
        );


    if (tasks.length === 0) {

        $("progressPercent")
            .textContent =
            "0%";

        $("progressFill")
            .style.width =
            "0%";

        $("progressText")
            .textContent =
            "Complete your tasks to help Koko grow!";

        return;

    }


    const completed =
        tasks.filter(
            task => task.completed
        ).length;


    const percent =
        Math.round(
            (completed / tasks.length) * 100
        );


    $("progressPercent")
        .textContent =
        `${percent}%`;

    $("progressFill")
        .style.width =
        `${percent}%`;


    $("progressText")
        .textContent =
        `${completed} of ${tasks.length} tasks completed.`;

}


/* =====================================================
   REMINDER SYSTEM
===================================================== */

let reminderInterval = null;

let reminderSeconds = 300;


/* Test reminder */

$("startReminder").addEventListener(
    "click",
    startReminder
);


function startReminder() {

    openModal("reminderModal");

    reminderSeconds = 300;

    updateReminderCountdown();


    clearInterval(reminderInterval);


    reminderInterval =
        setInterval(() => {

            reminderSeconds--;

            updateReminderCountdown();


            if (reminderSeconds <= 0) {

                clearInterval(reminderInterval);

                $("reminderMessage").textContent =
                    "Time is up! Please show proof.";

            }

        },1000);

}


function updateReminderCountdown() {

    const minutes =
        Math.floor(
            reminderSeconds / 60
        );

    const seconds =
        reminderSeconds % 60;


    $("proofCountdown")
        .textContent =
        `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;

}


/* =====================================================
   REMINDER PROOF
===================================================== */

$("showProof").addEventListener(
    "click",
    () => {

        clearInterval(reminderInterval);

        closeModal("reminderModal");

        openModal("proofModal");

    }
);


$("dismissReminder").addEventListener(
    "click",
    () => {

        clearInterval(reminderInterval);

        closeModal("reminderModal");

    }
);


/* =====================================================
   TEST REMINDER SOUND
===================================================== */

let audioContext = null;


function playAlarm() {

    try {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();


        const oscillator =
            audioContext.createOscillator();

        const gain =
            audioContext.createGain();


        oscillator.connect(gain);

        gain.connect(
            audioContext.destination
        );


        oscillator.frequency.value =
            800;

        gain.gain.value =
            0.15;


        oscillator.start();

        oscillator.stop(
            audioContext.currentTime + 0.5
        );

    } catch(e) {

        console.log(
            "Audio unavailable."
        );

    }

}


/* =====================================================
   UTILITIES
===================================================== */

function getDateKey(date) {

    return date.toISOString()
        .split("T")[0];

}


function formatDate(date) {

    return date.toLocaleDateString(
        undefined,
        {
            weekday: "long",
            month: "long",
            day: "numeric"
        }
    );

}


function escapeHTML(text) {

    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =====================================================
   RENDER EVERYTHING
===================================================== */

function renderAll() {

    renderTodayTasks();

    renderTasks();

    renderSchedule();

    renderPunishments();

    updateKoko();

    updateProgress();

    updateFriendUI();

}


/* =====================================================
   INITIALIZE
===================================================== */

renderAll();

updateTimerDisplay();
