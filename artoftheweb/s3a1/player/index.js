// fix :active on iOS
document.addEventListener('touchstart', function() {}, true);

var ws;
const WEBSOCKET_URL = 'ws://ec2-44-200-113-205.compute-1.amazonaws.com';

let playerName = '';

function setName(newName) {
    if (newName.trim() === '') return;
    playerName = newName;
    setStatusState(null);
}

function setStatusState(state) {
    document.querySelectorAll('.status-screen').forEach(screen => {
        screen.style.visibility = 'hidden';
    });
    if (state) {
        document.querySelector(`.status-screen.${state}`).style.visibility = 'visible';
    }
}

function websocketOpen() {
	console.log("Connected");
    setStatusState('connecting');
	let roomId = new URLSearchParams(window.location.search).get('room');

    if (!roomId) {
        console.error("No room ID provided");
        setStatusState('lost-connection');
        document.querySelector('.status-screen.lost-connection').style.visibility = 'visible';
        return;
    }

	ws.send(JSON.stringify({
		type: 'JoinGame',
		data: roomId,
	}));
}

function websocketClose() {
    setStatusState('lost-connection');
	console.error("Disconnected");
}

function websocketError(e) {
    // close the connection screen and show the lost connection screen
    setStatusState('lost-connection');
	console.error(e);
}

function websocketMessage(evt) {
    try {
        const data = JSON.parse(evt.data);
        console.log(data);

        if (data.type === 'AssignButtons') {
            const buttons = data.data;
            setStatusState(null);
            
            if (playerName === '') {
                setStatusState('name-prompt');
            }

            document.querySelectorAll('.game-button-container').forEach(container => {
                container.innerHTML = ''; // clear existing buttons
                buttons.forEach(button => {
                    const buttonElement = document.createElement('button');
                    buttonElement.className = `game-button ${button.toLowerCase()}`;
                    container.appendChild(buttonElement);
                    buttonElement.addEventListener('click', function () {
                        sendInput(button);
                    });
                });
            });
        }

        if (data.type === 'GameEnded') {
            setStatusState('game-ended');
        }
    } catch (e) {
        console.error("Error parsing message:", e);
    }
}

function sendInput(button) {
    console.log(`Sending button press: ${button}`);

	ws.send(JSON.stringify({
		type: 'ButtonPress',
		data: {
            name: playerName,
            button: button,
        },
	}));
}

window.onload = function () {
	roomId = new URLSearchParams(window.location.search).get('room');
	
	ws = new WebSocket(WEBSOCKET_URL);
	ws.onopen = websocketOpen;
	ws.onclose = websocketClose;
	ws.onerror = websocketError;
    ws.onmessage = websocketMessage;
    setStatusState('connecting');

    document.querySelectorAll('.game-button').forEach(button => {
		button.addEventListener('click', function () {
            // make first letter uppercase to match protocol
			sendInput(button.classList[1].charAt(0).toUpperCase() + button.classList[1].slice(1));
		});
	});
}

