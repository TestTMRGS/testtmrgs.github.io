document.addEventListener("DOMContentLoaded", () => {

    let targetTime = null;
    let countdownInterval = null;
    let remainingSeconds = 0;

    let blockData = [];

    const dateLabel = document.getElementById("date-label");
    const timeLabel = document.getElementById("time-label");
    const remainingLabel = document.getElementById("remaining-label");
    const messageLabel = document.getElementById("message-label");
    const halfBlocks = document.getElementById("half-hour-blocks");

    const startBtn = document.getElementById("start-btn");
    const pauseBtn = document.getElementById("pause-btn");
    const resumeBtn = document.getElementById("resume-btn");
    const resetBtn = document.getElementById("reset-btn");
    const durationInput = document.getElementById("duration-input");

    const examEntry = document.getElementById("exam-entry");
    const examTitle = document.getElementById("exam-title");

    // --- Live clock ---
    setInterval(() => {
        const now = new Date();
        dateLabel.textContent = `Date: ${now.toLocaleDateString()}`;
        timeLabel.textContent = `Time: ${now.toLocaleTimeString()}`;
    }, 1000);

    // --- Create half-hour blocks ---
    function createHalfHourBlocks(totalSeconds) {
        halfBlocks.innerHTML = "";
        blockData = [];

        let t = totalSeconds;

        while (t > 0) {
            const h = Math.floor(t / 3600);
            const m = Math.floor((t % 3600) / 60);
            const label = `${h}:${String(m).padStart(2,"0")}`;

            blockData.push({ label, threshold: t });
            t -= 1800; // 30 minutes
        }

        blockData.push({ label: "0:00", threshold: 0 });

        blockData.forEach(block => {
            const div = document.createElement("div");
            div.textContent = block.label;
            block.element = div;
            halfBlocks.appendChild(div);
        });
    }

    // --- Update crossed-off blocks ---
    function updateBlockStyles() {
        blockData.forEach(block => {
            if (remainingSeconds <= block.threshold) {
                block.element.style.textDecoration = "line-through";
                block.element.style.opacity = "0.4";
            } else {
                block.element.style.textDecoration = "none";
                block.element.style.opacity = "1";
            }
        });
    }

    // --- Countdown update ---
    function updateCountdown() {
        const now = new Date();
        remainingSeconds = Math.floor((targetTime - now) / 1000);

        if (remainingSeconds <= 0) {
            clearInterval(countdownInterval);
            remainingLabel.textContent = "Finished!";
            remainingSeconds = 0;
            updateBlockStyles();
            return;
        }

        const h = Math.floor(remainingSeconds / 3600);
        const m = Math.floor((remainingSeconds % 3600) / 60);
        const s = remainingSeconds % 60;

        remainingLabel.textContent =
            `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;

        updateBlockStyles();
    }

    // --- START ---
    startBtn.onclick = () => {
        const mins = parseInt(durationInput.value);
        if (!mins || mins <= 0) {
            messageLabel.textContent = "Enter a valid duration.";
            return;
        }

        remainingSeconds = mins * 60;
        targetTime = new Date(Date.now() + remainingSeconds*1000);

        createHalfHourBlocks(remainingSeconds);

        countdownInterval = setInterval(updateCountdown, 1000);
        updateCountdown();

        startBtn.disabled = true;
        pauseBtn.disabled = false;
    };

    // --- PAUSE ---
    pauseBtn.onclick = () => {
        clearInterval(countdownInterval);
        pauseBtn.disabled = true;
        resumeBtn.disabled = false;
    };

    // --- RESUME ---
    resumeBtn.onclick = () => {
        targetTime = new Date(Date.now() + remainingSeconds*1000);
        countdownInterval = setInterval(updateCountdown, 1000);
        resumeBtn.disabled = true;
        pauseBtn.disabled = false;
    };

    // --- RESET ---
    resetBtn.onclick = () => {
        clearInterval(countdownInterval);
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        resumeBtn.disabled = true;
        remainingLabel.textContent = "";
        messageLabel.textContent = "";
        durationInput.value = "";
        halfBlocks.innerHTML = "";
        blockData = [];
    };

    // --- Sync exam title ---
    examEntry.addEventListener("input", () => {
        examTitle.textContent = examEntry.value || "Exam";
    });


    // --- DRAG TO RESIZE LEFT PANEL ---
    const dragBar = document.getElementById("drag-bar");
    const layout = document.getElementById("layout");
    let isDragging = false;

    dragBar.addEventListener("mousedown", () => {
        isDragging = true;
        document.body.style.cursor = "col-resize";
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
        document.body.style.cursor = "default";
    });

    document.addEventListener("mousemove", e => {
        if (!isDragging) return;

        const totalWidth = layout.offsetWidth;
        let leftWidth = e.clientX / totalWidth * 100;

        if (leftWidth < 20) leftWidth = 20;
        if (leftWidth > 70) leftWidth = 70;

        layout.style.gridTemplateColumns = `${leftWidth}% 5px ${100 - leftWidth}%`;
    });

});
