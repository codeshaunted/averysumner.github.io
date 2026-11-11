var gba;
var ws;

const WEBSOCKET_URL = 'ws://ec2-44-200-113-205.compute-1.amazonaws.com';

function websocketOpen() {
	console.log("Connected");

	ws.send(JSON.stringify({
		type: 'CreateGame',
	}));
}

function websocketClose() {
	console.error("Disconnected");
};

function websocketError(e) {
	console.error(e);
}

let leftBalloon = true;
function websocketMessage(evt) {
	try {
		const data = JSON.parse(evt.data);
		if (data.type === 'CreateGameResponse' && data.data) {
			let roomId = data.data;
			var qr = new QRCode(document.getElementById("room-qr"), {
				text: "http://codeshaunted.com/artoftheweb/s3a1/player?room=" + roomId,
			});
		}
		if (data.type === 'ButtonPress') {
			let keycode = 0;
			let button = data.data.button;
			let name = data.data.name;

			let balloonClass = leftBalloon ? "from-left" : "from-right";

			let inputList = document.getElementById("input-list");

			let input = '';
			input += `<div class="input-message ${balloonClass}">`;
			if (leftBalloon) {
				input += `<i>${name}</i>`;
			}
			input += `
					<div class="nes-balloon ${balloonClass}">
						${button}!
					</div>`;

			if (!leftBalloon) {
				input += `<i>${name}</i>`;
			}
			input += `</div>`;
			inputList.innerHTML += input;
			inputList.scrollTop = inputList.scrollHeight;

			leftBalloon = !leftBalloon;

			switch (button) {
				case 'Select':
					keycode = gba.keypad.KEYCODE_SELECT;
					break;
				case 'Start':
					keycode = gba.keypad.KEYCODE_START;
					break;
				case 'A':
					keycode = gba.keypad.KEYCODE_A;
					break;
				case 'B':
					keycode = gba.keypad.KEYCODE_B;
					break;
				case 'Left':
					keycode = gba.keypad.KEYCODE_LEFT;
					break;
				case 'Right':
					keycode = gba.keypad.KEYCODE_RIGHT;
					break;
				case 'Up':
					keycode = gba.keypad.KEYCODE_UP;
					break;
				case 'Down':
					keycode = gba.keypad.KEYCODE_DOWN;
					break;
				case 'L':
					keycode = gba.keypad.KEYCODE_L;
					break;
				case 'R':
					keycode = gba.keypad.KEYCODE_R;
					break;
			}

			if (keycode) {
				gba.keypad.fakeKeyPress(keycode);
			}
		}
	} catch (exception) {
		console.error("Error parsing message: ", evt.data, " - ", exception);
	}
};

window.onload = function () {
}

function run(file) {
	try {
		gba = new GameBoyAdvance();
		gba.keypad.eatInput = true;
	} catch (exception) {
		gba = null;
	}

	if (gba && FileReader) {
		var canvas = document.getElementById('screen');
		var context = canvas.getContext('2d');

		// Set canvas to native GBA resolution for pixelation
		canvas.setAttribute('width', '240');
		canvas.setAttribute('height', '160');

		// Disable image smoothing for pixelated rendering
		if (context.webkitImageSmoothingEnabled !== undefined) {
			context.webkitImageSmoothingEnabled = false;
		}
		if (context.mozImageSmoothingEnabled !== undefined) {
			context.mozImageSmoothingEnabled = false;
		}
		if (context.imageSmoothingEnabled !== undefined) {
			context.imageSmoothingEnabled = false;
		}

		gba.setCanvasDirect(canvas);
		gba.logLevel = gba.LOG_ERROR;

		loadRom('gbajs/bios.bin', function (bios) {
			gba.setBios(bios);
		});

		ws = new WebSocket(WEBSOCKET_URL);
		ws.onopen = websocketOpen;
		ws.onclose = websocketClose;
		ws.onerror = websocketError;
		ws.onmessage = websocketMessage;
	}

	if (gba && file) {
		gba.loadRomFromFile(file, function (result) {
			if (result) {
				gba.runStable();
			}
		});
	}
}