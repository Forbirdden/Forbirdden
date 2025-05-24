async function main(args) {
    try {
        // Инициализация графики
        enableGraphics({
            onmousemove: (x, y) => handleMouse(x, y),
            onmousedown: (btn) => handleMouseButton(btn, true),
            onmouseup: (btn) => handleMouseButton(btn, false),
            onkeydown: (key) => handleKey(key, true),
            onkeyup: (key) => handleKey(key, false)
        });

        // Скрытие терминала
        document.getElementById("terminal").style.display = "none";
        document.getElementById("cursor").style.display = "none";

        // Создание окна терминала
        createTerminalWindow();

        // Основной цикл рендеринга
        setInterval(() => {
            render();
        }, 1000 / 60);

        return 0;
    } catch (e) {
        writeStdout("Ошибка запуска WebWM: " + e + "\n");
        return 1;
    }
}

// Реализация оконной системы
let windows = [];
let focusedWindow = null;

function createTerminalWindow() {
    const termWindow = {
        id: "terminal",
        x: 50,
        y: 50,
        width: 600,
        height: 400,
        title: "Terminal",
        content: "",
        buffer: [],
        scroll: 0
    };
    windows.push(termWindow);
    focusedWindow = termWindow;
}

function handleMouse(x, y) {
    // Логика взаимодействия с окнами
}

function render() {
    const ctx = getGraphics();
    ctx.fillStyle = "#002b36";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Отрисовка всех окон
    windows.forEach(window => {
        drawWindow(window);
    });
}

function drawWindow(window) {
    const ctx = getGraphics();
    // Рамка окна
    ctx.fillStyle = "#073642";
    ctx.fillRect(window.x, window.y, window.width, window.height);
    
    // Заголовок
    ctx.fillStyle = "#586e75";
    ctx.fillRect(window.x, window.y - 20, window.width, 20);
    
    // Текст заголовка
    ctx.fillStyle = "#93a1a1";
    ctx.font = "14px monospace";
    ctx.fillText(window.title, window.x + 5, window.y - 5);
}

// Обработчики ввода
function handleKey(key, pressed) {
    if (!focusedWindow) return;
    
    // Перенаправление ввода в эмулированный терминал
    if (pressed && key.length === 1) {
        focusedWindow.buffer.push(key);
        stdin += key;
    }
}

// Экспорт для ppm
const package = {
    name: "webwm",
    apps: ["webwm.js"],
    configs: [],
    version: "1.0"
};
