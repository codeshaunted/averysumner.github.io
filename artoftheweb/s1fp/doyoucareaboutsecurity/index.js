let message = `
⏦SecurityOS 19.84 LTS wopr tty1
login: ⏥⏱⏱falken
⏦password: ⏥​​​​​​​​​​​​​​​​⏦
⏱⏱
Last login: Sun Jan 1 12:00:00 UTC 1984 on tty1
Welcome to SecurityOS 19.84 (GNU/Linux 4.4.0-21-generic x86_64)

0 packages can be updated.
0 updates are security updates.

  _____________________
< Shall we play a game? >
  ---------------------
         \\   ^__^ 
          \\  (oo)\\_______
             (__)\\       )\\/\\\\
                 ||----w |
                 ||     ||

falken@wopr:~$ ⏱⏱⏱⏱⏥thermonuclearwar
⏱⏱⏱⏱⏱⏱⏱⏱⏱⏱⏱`;

let screen = document.getElementById("screen");
let delay = 25;
let clockDelay = 250;
let personDelay = 100;
let systemDelay = 1;
let delayMultEnabled = false;

let cursor = document.createElement('span');
cursor.innerHTML = '█';
cursor.className = 'cursor';

screen.appendChild(cursor);

function typeCharacter() {
    if (message != "") {
        let c = message[0]
        message = message.substring(1);

        let delayMultMin = 0.7;
        let delayMultMax = 1.5;
        let delayMult = delayMultEnabled ? delayMultMin + Math.random() * (delayMultMax - delayMultMin) : 1.0;

        if (c == "⏱") {
            setTimeout(typeCharacter, clockDelay);
            return;
        } else if (c == "⏥") {
            delay = personDelay;
            delayMultEnabled = true;
            typeCharacter();
            return;
        } else if (c == "⏦") {
            delay = systemDelay;
            delayMultEnabled = false;
            typeCharacter();
            return;
        }

        if (c == "\n") {
            c = "<br>";
        }

        if (c == " ") {
            c = "&nbsp;"
        }

        screen.removeChild(cursor);
        screen.innerHTML += c;
        screen.appendChild(cursor);

        setTimeout(typeCharacter, delay * delayMult);
    } else {
        screen.style.display = "none";
    }
}

typeCharacter();