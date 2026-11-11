const SIZE = 600;
const FRAME_RATE = 15;

let insideSpan;
let insideSpan2;
let outsideSpan;
let piApproxSpan;
let speedIndicatorSpan;
let speedSlider;
function setup() {
    createCanvas(SIZE, SIZE);
    frameRate(FRAME_RATE);
    insideSpan = document.getElementById('insideCount');
    insideSpan2 = document.getElementById('insideCount2');
    outsideSpan = document.getElementById('outsideCount');
    piApproxSpan = document.getElementById('piApprox');
    speedIndicatorSpan = document.getElementById('speedIndicator');
    speedSlider = document.getElementById('speedSlider');

    updateSpeed(1);
}

let firstFrame = true;
let inside = 0;
let outside = 0;
let speed = 1;
function draw() {
    if (firstFrame) {
        noFill();
        background(220);
        stroke(0);
        circle(SIZE / 2, SIZE / 2, SIZE);
        noStroke();
        firstFrame = false;
    };

    for (let i = 0; i < speed; i++) {
        let x = random(width);
        let y = random(height);

        if (dist(x, y, width / 2, height / 2) < SIZE / 2) {
            fill(0, 255, 0);
            ++inside;
        } else {
            fill(255, 0, 0);
            ++outside;
        }

        circle(x, y, SIZE / 60);
    }

    let piEstimate = 4 * (inside / (inside + outside));
    insideSpan.innerHTML = inside;
    insideSpan2.innerHTML = inside;
    outsideSpan.innerHTML = outside;
    piApproxSpan.innerHTML = piEstimate.toFixed(3);
}

function updateSpeed(newSpeed) {
    speed = newSpeed;
    speedIndicatorSpan.innerHTML = speed * FRAME_RATE;
    speedSlider.value = newSpeed;
}

function resetCounts() {
    inside = 0;
    outside = 0;
    firstFrame = true;
}