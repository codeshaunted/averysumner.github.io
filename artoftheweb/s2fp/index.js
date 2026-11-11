const BASE_PLANET_SCALE = 1.1;
const CAM_TRANSITION_TIME = 1500;
const SIZE = 800;
const BASE_PLANET_ORBIT = SIZE / 3;
const MAX_CAM_Z = 800;
const MIN_CAM_Z = 100;

let iColors;
let cam;
let pickFBO;
function setup() {
    iColors = [
        color(255, 0, 0),
        color(0, 255, 0),
        color(0, 0, 255),
        color(255, 0, 255),
        color(255, 255, 0),
    ];

    createCanvas(SIZE, SIZE, WEBGL);
    noStroke();

    pickFBO = createFramebuffer({
        format: UNSIGNED_BYTE
    });
    teapot = loadModel('teapot.obj', true);

    cam = createCamera();
    setCamera(cam);
}

// get times as a fraction of 1
// i.e. 0 seconds -> 0.0, 60 seconds -> 1.0
function getFractionalTimes() {
    const now = new Date();

    let milliseconds = now.getMilliseconds();
    let seconds = now.getSeconds() + (milliseconds / 1000);
    let minutes = now.getMinutes() + (seconds / 60);
    let hours = now.getHours() + (minutes / 60);

    return [hours / 12, minutes / 60, seconds / 60, milliseconds / 1000, 0];
}

// draw planet model at position with scale
function drawPlanetModel(x, y, s) {
    push();
    translate(x, y);
    rotate(millis() / 1000, [1, 1, 1]); // rotate based on time for smooth rotations
    scale(s);
    model(teapot);
    pop();
}

let camTarget = 0;
let transitionTarget = 0;
let transitionTimer = 0;
function drawPlanets(times, isPicker = false) {
    // if it's normal render add light, if picker reset fill
    if (!isPicker) {
        ambientLight(255, 255, 255);
        directionalLight(255, 255, 255, 0, 0, -1);
    } else {
        fill(0);
    }

    // iterate over planets and draw each
    let currentPlanetSize = BASE_PLANET_SCALE;
    let currentOrbitRadius = BASE_PLANET_ORBIT;
    let planetX = 0;
    let planetY = 0;
    let planetPositions = [];
    for (let i = 0; i < times.length; ++i) {
        // push planet positions to array for later use
        planetPositions.push({
            x: planetX,
            y: planetY,
            z: max(MAX_CAM_Z * currentPlanetSize, MIN_CAM_Z)
        });

        let angle = (times[i] * 2 * PI) - (PI / 2);

        if (isPicker) { // if it's the picker we use the color to indicate which planet it is
            fill(i + 1);
        } else { // if it's the normal render we use a material
            if (picked == i + 1) { // make it flash on hover
                let iColor = iColors[i];
                let sine = max(sin(millis() / 250));
                let r = red(iColor) * sine;
                let g = green(iColor) * sine;
                let b = blue(iColor) * sine;

                ambientMaterial(color(r * sine, g * sine, b * sine));
            } else {
                ambientMaterial(iColors[i]);
            }

        }

        drawPlanetModel(planetX, planetY, currentPlanetSize);

        planetX += (cos(angle) * currentOrbitRadius);
        planetY += (sin(angle) * currentOrbitRadius);

        currentPlanetSize /= 2;
        currentOrbitRadius /= 2;
    }

    // if we're transitioning between camera states, lerp between them
    let camPos;
    if (transitionTimer <= 0) {
        camTarget = transitionTarget;
        camPos = planetPositions[camTarget];
    } else {
        let transitionTargetPos = planetPositions[transitionTarget];
        let camTargetPos = planetPositions[camTarget];
        let progress = 1 - (transitionTimer / CAM_TRANSITION_TIME);

        camPos = {
            x: lerp(camTargetPos.x, transitionTargetPos.x, progress),
            y: lerp(camTargetPos.y, transitionTargetPos.y, progress),
            z: lerp(camTargetPos.z, transitionTargetPos.z, progress)
        }
    }

    cam.setPosition(camPos.x, camPos.y, camPos.z);
}

let mouseDown = false;
function mousePressed() {
    mouseDown = true;
}

function mouseReleased() {
    mouseDown = false;
}

let picked = 0;
let transitioning = false;
function draw() {
    cursor(ARROW); // reset cursor
    let times = getFractionalTimes();

    // we have to do SIZE - mouseY because for some reason
    // auxiliary FBOs work with a different coordinate system
    picked = pickFBO.get(mouseX, 800 - mouseY)[0];

    push();
    background(0);
    drawPlanets(times);
    pop();

    pickFBO.begin();
    setCamera(cam);
    background(0);
    drawPlanets(Array.from(times), true);
    pickFBO.end();

    // handle planet selection
    if (picked != 0) {
        cursor(HAND);

        if (mouseDown && transitionTimer <= 0 && picked - 1 != camTarget) {
            transitionTarget = picked - 1;
            transitionTimer = CAM_TRANSITION_TIME;
        }
    }

    transitionTimer -= deltaTime;
}