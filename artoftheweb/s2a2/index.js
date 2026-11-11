const carousel = document.getElementById("carousel");

// dirty hack suggested by ChatGPT to compute the pixel value of the radius specified in units of vmin
const temp = document.createElement('div');
temp.style.width = getComputedStyle(document.documentElement).getPropertyValue('--album-carousel-radius');
document.body.appendChild(temp);
const carouselRadius = parseFloat(getComputedStyle(temp).width);
document.body.removeChild(temp);

const carouselCircumfrence = 2 * Math.PI * carouselRadius;
const carouselPixelDegrees = 360 / carouselCircumfrence;
let rot = 0;
let dragging = false;
let dragStart = 0;
let dragStartRot = 0;
let velocity = 0;
let lastRot = 0;
const friction = 0.97;

function renderRot() {
    if (window.matchMedia("(orientation: portrait)").matches) {
        carousel.style.transform = `rotateX(${rot}deg)`;
    } else {
        carousel.style.transform = `rotateY(${rot}deg)`;
    }
}

function animate() {
    if (dragging || Math.abs(velocity) < 0.01) {
        velocity = 0;
        return;
    }

    velocity *= friction;
    rot += velocity;
    renderRot();
    requestAnimationFrame(animate);
}

function handleDragStart(e) {
    if (dragging) return;
    dragging = true;
    velocity = 0;

    // check if it's a touch or mouse event
    const isTouchEvent = e.type === 'touchstart';
    const clientX = isTouchEvent ? e.touches[0].clientX : e.clientX;
    const clientY = isTouchEvent ? e.touches[0].clientY : e.clientY;

    if (window.matchMedia("(orientation: portrait)").matches) {
        dragStart = clientY;
    } else {
        dragStart = clientX;
    }
    
    dragStartRot = rot;
    lastRot = rot;
}

function handleDragMove(e) {
    if (!dragging) return;

    const isTouchEvent = e.type === 'touchmove';

    const clientX = isTouchEvent ? e.touches[0].clientX : e.clientX;
    const clientY = isTouchEvent ? e.touches[0].clientY : e.clientY;
    
    let diff;
    if (window.matchMedia("(orientation: portrait)").matches) {
        diff = clientY - dragStart;
        rot = dragStartRot - (diff * carouselPixelDegrees);
    } else {
        diff = clientX - dragStart;
        rot = dragStartRot + (diff * carouselPixelDegrees);
    }

    velocity = rot - lastRot;
    lastRot = rot;
    renderRot();
}

function handleDragEnd(e) {
    if (!dragging) return;
    dragging = false;
    requestAnimationFrame(animate);
}

// a native drag of a link or selection swallows mousemove/mouseup and freezes :hover
document.addEventListener('dragstart', (e) => e.preventDefault());

document.onmousedown = handleDragStart;
document.onmousemove = handleDragMove;
document.onmouseup = handleDragEnd;

document.addEventListener('touchstart', handleDragStart, { passive: false });
document.addEventListener('touchmove', handleDragMove, { passive: false });
document.ontouchend = handleDragEnd;
document.ontouchcancel = handleDragEnd;

document.onwheel = (e) => {
    const wasStopped = Math.abs(velocity) < 0.01;

    velocity += e.deltaY * carouselPixelDegrees / 25;

    if (wasStopped) {
        requestAnimationFrame(animate);
    }
}

// reset everything when we switch
screen.orientation.onchange = (e) => {
    rot = 0;
    dragging = false;
    dragStart = 0;
    dragStartRot = 0;
    velocity = 0;
    renderRot();
}

// or when we resize
window.onresize = (e) => {
    rot = 0;
    dragging = false;
    dragStart = 0;
    dragStartRot = 0;
    velocity = 0;
    renderRot();
}

// spin on load and coast to a stop with the first album facing front
function spinIn(initialVelocity) {
    // run the same decay as animate() ahead of time to find how far the spin will travel
    let travel = 0;
    let v = initialVelocity;
    while (Math.abs(v) >= 0.01) {
        v *= friction;
        travel += v;
    }

    rot = -travel;
    velocity = initialVelocity;
    renderRot();
    requestAnimationFrame(animate);
}

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    spinIn(-45);
}
