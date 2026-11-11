// get mouse position in pixel space of the image
const img = document.getElementById('image');

const selectImg = new Image();
selectImg.src = 'render_select.webp';

var selectData;
var book = document.getElementById('book');
selectImg.onload = function () {
    const canvas = document.createElement('canvas');
    canvas.width = selectImg.naturalWidth;
    canvas.height = selectImg.naturalHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(selectImg, 0, 0);
    selectData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
}

function getSelectPixel(x, y) {
    if (!selectData) return null;
    const index = (y * selectImg.naturalWidth + x) * 4;
    return {
        r: selectData[index],
        g: selectData[index + 1],
        b: selectData[index + 2],
        a: selectData[index + 3],
    };
}

const colors = {
    "0,255,164": "/artoftheweb/s2fp",
    "0,175,86": "/artoftheweb/s3a1",
    "255,180,206": "/artoftheweb/s3fp",
    "0,222,186": "/artoftheweb/s1a1",
    "0,76,218": "/artoftheweb/s1fp",
    "0,254,244": "/artoftheweb/s1a2",
    "0,178,254": "/artoftheweb/s2a2",
    "255,224,58": "https://artofthewebfall2025.github.io/s3a2",
    "255,45,205": "#book",
};

document.onmousemove = function (e) {
    if (window.location.hash === '#book') {
    document.body.style.cursor = 'auto';
        return;
    }
    const rect = img.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (img.naturalWidth / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (img.naturalHeight / rect.height));

    const pixel = getSelectPixel(x, y);
    const pixelKey = pixel ? `${pixel.r},${pixel.g},${pixel.b}` : null;
    console.log(pixelKey);

    if (pixelKey && colors[pixelKey]) {
        document.body.style.cursor = 'pointer';
    } else {
        document.body.style.cursor = 'default';
    }
}

document.onmousedown = function (e) {
    if (window.location.hash === '#book') {
        if (!book.matches(':hover')) {
            window.location.href = '';
        }
        return;
    }

    const rect = img.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (img.naturalWidth / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (img.naturalHeight / rect.height));

    const pixel = getSelectPixel(x, y);
    const pixelKey = pixel ? `${pixel.r},${pixel.g},${pixel.b}` : null;

    if (pixelKey && colors[pixelKey]) {
        window.location.href = colors[pixelKey];
    }
}