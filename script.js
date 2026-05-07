let oldCpu = 0;
let oldRam = 0;
let oldDisk = 0;
let oldBattery = 0;

/* ===============================
   CHART
=============================== */
const ctx = document.getElementById("myChart");

let myChart = null;

if (ctx) {
    myChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: [],
            datasets: [
                {
                    label: "CPU %",
                    data: [],
                    borderWidth: 3,
                    tension: 0.4
                },
                {
                    label: "RAM %",
                    data: [],
                    borderWidth: 3,
                    tension: 0.4
                },
                {
                    label: "Disk %",
                    data: [],
                    borderWidth: 3,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

/* ===============================
   ANIMATION
=============================== */
function animateBox(id, label, start, end) {

    const el = document.getElementById(id);
    if (!el) return;

    let current = start;
    let step = (end - start) / 30;

    let timer = setInterval(() => {

        current += step;

        if (
            (step > 0 && current >= end) ||
            (step < 0 && current <= end)
        ) {
            current = end;
            clearInterval(timer);
        }

        el.innerHTML = `
            <h3>${label}</h3>
            <p>${Math.round(current)}%</p>
        `;

    }, 20);
}

/* ===============================
   TOAST
=============================== */
function showToast(msg) {

    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.innerHTML = msg;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

/* ===============================
   UPDATE UI
=============================== */
function updateDashboard(data) {

    animateBox("cpu", "CPU", oldCpu, data.cpu);
    animateBox("ram", "RAM", oldRam, data.ram);
    animateBox("disk", "Disk", oldDisk, data.disk);
    animateBox("battery", "Battery", oldBattery, data.battery);

    oldCpu = data.cpu;
    oldRam = data.ram;
    oldDisk = data.disk;
    oldBattery = data.battery;

    setText("network", `
        <h3>Network</h3>
        <p>${data.network} MB</p>
    `);

    setText("prediction", `
        <h3>Prediction</h3>
        <p>${data.prediction}</p>
    `);

    setText("status", `
        <h3>Load Balancer</h3>
        <p>${data.status}</p>
    `);

    setText("risk", `
        <h3>Risk Level</h3>
        <p>${data.risk}</p>
    `);

    if (data.temp == 0) {
        setText("temp", `
            <h3>Temperature</h3>
            <p>Not Supported</p>
        `);
    } else {
        setText("temp", `
            <h3>Temperature</h3>
            <p>${data.temp}°C</p>
        `);
    }

    setText("warning", `
        <h3>Warning</h3>
        <p>${data.warning_message}</p>
    `);

    setText("process", `
        <h3>Heavy Application</h3>
        <p>${data.heavy_name} (${data.heavy_cpu}% CPU)</p>
    `);

    /* Warning colors */
    const warn = document.getElementById("warning");

    if (warn) {
        warn.style.background =
            data.warning_message !== "No Warning"
                ? "orange"
                : "#333";
    }

    /* Heavy process colors */
    const box = document.getElementById("process");

    if (box) {
        if (data.heavy_cpu > 70) {
            box.style.background = "red";
        } else if (data.heavy_cpu > 40) {
            box.style.background = "orange";
        } else {
            box.style.background = "#333";
        }
    }

    /* Risk colors */
    const riskBox = document.getElementById("risk");

    if (riskBox) {
        if (data.risk === "Critical") {
            riskBox.style.background = "red";
            showToast("⚠ Critical Risk Detected");
        } else if (data.risk === "Warning") {
            riskBox.style.background = "orange";
        } else {
            riskBox.style.background = "green";
        }
    }

    updateChart(data);
}

/* ===============================
   CHART UPDATE
=============================== */
function updateChart(data) {

    if (!myChart) return;

    const time = new Date().toLocaleTimeString();

    myChart.data.labels.push(time);

    myChart.data.datasets[0].data.push(data.cpu);
    myChart.data.datasets[1].data.push(data.ram);
    myChart.data.datasets[2].data.push(data.disk);

    if (myChart.data.labels.length > 10) {

        myChart.data.labels.shift();

        myChart.data.datasets[0].data.shift();
        myChart.data.datasets[1].data.shift();
        myChart.data.datasets[2].data.shift();
    }

    myChart.update();
}

/* ===============================
   DEMO METRICS
=============================== */
function loadMetrics() {

    const cpu = Math.floor(Math.random() * 100);
    const ram = Math.floor(Math.random() * 100);
    const disk = Math.floor(Math.random() * 100);

    let risk = "Safe";

    if (cpu > 85 || ram > 85) {
        risk = "Critical";
    } else if (cpu > 60 || ram > 60) {
        risk = "Warning";
    }

    const data = {
        cpu: cpu,
        ram: ram,
        disk: disk,
        battery: Math.floor(Math.random() * 100),
        network: Math.floor(Math.random() * 500),
        prediction: cpu > 80 ? "Overload Expected" : "Stable",
        status: cpu > 75 ? "Balancing Active" : "Balanced",
        risk: risk,
        temp: Math.floor(Math.random() * 30) + 40,
        warning_message:
            risk === "Critical"
                ? "System Overload Detected"
                : "No Warning",
        heavy_name: "Chrome",
        heavy_cpu: cpu
    };

    updateDashboard(data);
}

/* ===============================
   HELPERS
=============================== */
function setText(id, text) {

    const el = document.getElementById(id);

    if (el) {
        el.innerHTML = text;
    }
}

/* ===============================
   PAGE LOAD
=============================== */
window.onload = function () {

    const loader = document.getElementById("loader");

    if (loader) {
        loader.style.display = "none";
    }

    const bar = document.getElementById("bar");

    if (bar) {
        setTimeout(() => {
            bar.style.width = "100%";
        }, 300);
    }

    loadMetrics();

    setInterval(loadMetrics, 3000);
};
