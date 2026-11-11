const win = document.querySelector('.window');
const titleBar = win.querySelector('.title-bar');

let isDragging = false;
let offsetX, offsetY;

titleBar.addEventListener('mousedown', (e) => {
    if (e.target.tagName === 'BUTTON') return;

    isDragging = true;

    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
});

let isResizing = false;
let currentResizer = null;
let startX, startY, startWidth, startHeight, startLeft, startTop;

const resizers = win.querySelectorAll('.resize');

resizers.forEach(resizer => {
    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        currentResizer = resizer.classList[1];

        const computedStyle = window.getComputedStyle(win);
        const width = parseInt(computedStyle['width']);
        const height = parseInt(computedStyle['height']);
        const left = parseInt(computedStyle['left']);
        const top = parseInt(computedStyle['top']);

        startX = e.clientX;
        startY = e.clientY;
        startWidth = width;
        startHeight = height;
        startLeft = left;
        startTop = top;

        e.stopPropagation();
    });
});

function getMinSize(el) {
    // Get the intrinsic minimum width/height
    const minWidth = el.scrollWidth;
    const minHeight = el.scrollHeight;
    return { minWidth, minHeight };
}

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        win.style.left = (e.clientX - offsetX) + 'px';
        win.style.top = (e.clientY - offsetY) + 'px';
    }

    if (isResizing) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        const computedStyle = window.getComputedStyle(win);
        const width = parseInt(computedStyle['width']);
        const height = parseInt(computedStyle['height']);
        const minWidth = parseInt(computedStyle['min-width']);
        const minHeight = parseInt(computedStyle['min-height']);

        let newWidth = startWidth;
        let newHeight = startHeight;
        let newLeft = startLeft;
        let newTop = startTop;

        if (currentResizer.includes('e')) {
            newWidth = startWidth + dx;
            newWidth = Math.max(newWidth, minWidth);
        }
        if (currentResizer.includes('w')) {
            newWidth = startWidth - dx;
            newLeft = startLeft + dx;

            if (newWidth < minWidth) {
                newLeft -= (minWidth - newWidth);
                newWidth = minWidth;
            }
        }

        if (currentResizer.includes('s')) {
            newHeight = startHeight + dy;
            newHeight = Math.max(newHeight, minHeight);
        }
        if (currentResizer.includes('n')) {
            newHeight = startHeight - dy;
            newTop = startTop + dy;

            if (newHeight < minHeight) {
                newTop -= (minHeight - newHeight);
                newHeight = minHeight;
            }
        }

        win.style.width = newWidth + 'px';
        win.style.height = newHeight + 'px';
        win.style.left = newLeft + 'px';
        win.style.top = newTop + 'px';
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    isResizing = false;
    currentResizer = null;
});

let restoreWidth, restoreHeight, restoreLeft, restoreTop;
let maximizeOrRestoreButton = document.getElementById("maximize-or-restore-button");

function maximizeOrRestore() {
    if (maximizeOrRestoreButton.ariaLabel == 'Maximize') {
        const computedStyle = window.getComputedStyle(win);
        const width = parseInt(computedStyle['width']);
        const height = parseInt(computedStyle['height']);
        const left = parseInt(computedStyle['left']);
        const top = parseInt(computedStyle['top']);

        restoreWidth = width;
        restoreHeight = height;
        restoreLeft = left;
        restoreTop = top;

        win.style.width = window.innerWidth + 'px';
        win.style.height = window.innerHeight + 'px';
        win.style.top = 0;
        win.style.left = 0;

        maximizeOrRestoreButton.ariaLabel = "Restore";
    } else {
        win.style.width = restoreWidth + 'px';
        win.style.height = restoreHeight + 'px';
        win.style.top = restoreTop + 'px';
        win.style.left = restoreLeft + 'px';

        maximizeOrRestoreButton.ariaLabel = "Maximize";
    }
}

function errorDialogs(n) {
    if (n == 0) {
        setTimeout(() => {
            window.location.reload();
        }, 4000);

        return;
    }

    const dialogHTML = `<div class="window error" style="position: absolute; left: ${Math.floor(Math.random() * 101)}vw; top: ${Math.floor(Math.random() * 101)}vh;">
        <div class="title-bar active">
            <div class="title-bar-text">Warning</div>
            <div class="title-bar-controls">
                <button aria-label="Minimize" onclick="errorDialogs()"></button>
                <button id="maximize-or-restore-button" onclick="maximizeOrRestore()" aria-label="Maximize"></button>
                <button aria-label="Close" onclick="errorDialogs()"></button>
            </div>
        </div>
        <div class="window-body has-space">
            <img src="warning.png">
            <p>A CRITICAL ERROR HAS OCCURRED
            PLEASE RESTART YOUR COMPUTER TO CONTINUE
            </p>
            <div class="button-container"><button>OK</button>
            </div>

        </div>
    </div>`;

    document.body.innerHTML += dialogHTML;

    setTimeout(() => {
        errorDialogs(n - 1);
    }, 25);
}