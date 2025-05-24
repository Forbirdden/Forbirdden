// app/mxwm/zcom.js
function hasGraphicsImplementation() {
    return true;
}

// Глобальное хранилище окон
window.mxwm_windows = window.mxwm_windows || [];

/** Создает окно и возвращает [wid, context] */
function createWindow(options = {}) {
    const wid = `win_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const container = document.createElement("div");
    const canvas = document.createElement("canvas");
    const titleBar = document.createElement("div");
    const resizeHandle = document.createElement("div");

    // Стили контейнера
    container.style.position = "absolute";
    container.style.border = "2px solid #333";
    container.style.borderRadius = "8px";
    container.style.overflow = "hidden";
    container.style.backgroundColor = "#fff";
    container.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";

    // Заголовок окна
    titleBar.style.background = "#e0e0e0";
    titleBar.style.padding = "8px";
    titleBar.style.cursor = "move";
    titleBar.style.fontFamily = "Arial";
    titleBar.style.fontWeight = "bold";
    titleBar.textContent = options.title || "New Window";

    // Холст для содержимого
    canvas.width = options.width || 400;
    canvas.height = options.height || 300;
    canvas.style.display = "block";

    // Маркер изменения размера
    resizeHandle.style.position = "absolute";
    resizeHandle.style.right = "2px";
    resizeHandle.style.bottom = "2px";
    resizeHandle.style.width = "12px";
    resizeHandle.style.height = "12px";
    resizeHandle.style.cursor = "nwse-resize";
    resizeHandle.style.backgroundColor = "#666";

    // Сборка элементов
    container.appendChild(titleBar);
    container.appendChild(canvas);
    container.appendChild(resizeHandle);
    document.body.appendChild(container);

    // Позиционирование
    container.style.left = `${options.x || 50}px`;
    container.style.top = `${options.y || 50}px`;

    // Состояние окна
    const win = {
        wid,
        canvas,
        container,
        title: options.title,
        x: parseInt(container.style.left),
        y: parseInt(container.style.top),
        width: canvas.width,
        height: canvas.height,
        context: canvas.getContext("2d"),
        onsignal: options.onsignal || (() => {}),
        onkeydown: options.onkeydown || (() => {}),
        onkeyup: options.onkeyup || (() => {}),
        onmousedown: options.onmousedown || (() => {}),
        onmouseup: options.onmouseup || (() => {}),
        onmousemove: options.onmousemove || (() => {}),
        onresize: options.onresize || (() => {})
    };

    // Перемещение окна
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;

    titleBar.addEventListener("mousedown", (e) => {
        isDragging = true;
        dragStartX = e.clientX - win.x;
        dragStartY = e.clientY - win.y;
        document.body.style.userSelect = "none";
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        win.x = e.clientX - dragStartX;
        win.y = e.clientY - dragStartY;
        container.style.left = `${win.x}px`;
        container.style.top = `${win.y}px`;
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
        document.body.style.userSelect = "";
    });

    // Изменение размера
    let isResizing = false;
    let resizeStartX = 0;
    let resizeStartY = 0;

    resizeHandle.addEventListener("mousedown", (e) => {
        isResizing = true;
        resizeStartX = e.clientX;
        resizeStartY = e.clientY;
        e.stopPropagation();
    });

    document.addEventListener("mousemove", (e) => {
        if (!isResizing) return;
        const newWidth = win.width + (e.clientX - resizeStartX);
        const newHeight = win.height + (e.clientY - resizeStartY);
        
        win.width = Math.max(100, newWidth);
        win.height = Math.max(80, newHeight);
        
        canvas.width = win.width;
        canvas.height = win.height;
        win.onresize(win.width, win.height);
        
        resizeStartX = e.clientX;
        resizeStartY = e.clientY;
    });

    document.addEventListener("mouseup", () => {
        isResizing = false;
    });

    // Фокус при клике
    container.addEventListener("mousedown", () => {
        moveWindowToTop(wid);
    });

    window.mxwm_windows.push(win);
    return [wid, win.context];
}

function moveWindow(wid, x, y, w, h) {
    const win = window.mxwm_windows.find(w => w.wid === wid);
    if (!win) return;

    win.x = x;
    win.y = y;
    win.width = Math.max(100, w);
    win.height = Math.max(80, h);
    
    win.container.style.left = `${x}px`;
    win.container.style.top = `${y}px`;
    win.canvas.width = win.width;
    win.canvas.height = win.height;
    win.onresize(win.width, win.height);
}

function signalWindow(wid, signal) {
    const win = window.mxwm_windows.find(w => w.wid === wid);
    if (win) win.onsignal(signal);
}

function closeWindow(wid) {
    const win = window.mxwm_windows.find(w => w.wid === wid);
    if (!win) return;
    
    win.container.remove();
    window.mxwm_windows = window.mxwm_windows.filter(w => w.wid !== wid);
}

function getWindow(wid) {
    return window.mxwm_windows.find(w => w.wid === wid) || null;
}

function listWindows() {
    return [...window.mxwm_windows];
}

// Вспомогательная функция для поднятия окна наверх
function moveWindowToTop(wid) {
    const winIndex = window.mxwm_windows.findIndex(w => w.wid === wid);
    if (winIndex === -1) return;
    
    const [win] = window.mxwm_windows.splice(winIndex, 1);
    window.mxwm_windows.push(win);
    
    // Визуальное поднятие через z-index
    window.mxwm_windows.forEach((w, index) => {
        w.container.style.zIndex = index + 1;
    });
}
