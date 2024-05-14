// implement processImage
function processImage(event) {
    // get file
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = document.getElementById('image');
        img.src = e.target.result;
        img.onload = function() {
            // get image data
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // process image
            const out = process(imageData);
            const out1 = out[0];
            const out2 = out[1];

            // display out1 and out2
            const out1Img = document.getElementById('out1');
            const out2Img = document.getElementById('out2');
            
            out1Img.src = getImageSource(out1);
            out2Img.src = getImageSource(out2);
        }
    }
    reader.readAsDataURL(file);
}

function randBool() {
    return Math.random() < 0.5;
}

function isBlack(pixel) {
    return pixel[3] == 255 && (pixel[0] + pixel[1] + pixel[2] < 80);
}

const permsOpacity = [
    [255, 0, 255, 0],
    [0, 255, 0, 255]
]


// We will create 2 images from the input image
// each pixel in imageData will become a 2x2 pixel in out1 and out2
// example: orig(0,0) is out1(0,0), out1(0,1), out1(1,0), out1(1,1)
// example: orig(0,1) is out1(0,2), out1(0,3), out1(1,2), out1(1,3)
// example: orig(1,0) is out1(2,0), out1(2,1), out1(3,0), out1(3,1)
// example: orig(1,1) is out1(2,2), out1(2,3), out1(3,2), out1(3,3)
// out1 will be the same as the input image
// out2 will be the same as the input image, but with the red channel inverted
function process(imageData) {
    // Process image data
    const out1 = new ImageData(imageData.width * 2, imageData.height * 2);
    const out2 = new ImageData(imageData.width * 2, imageData.height * 2);

    // Loop through each pixel in the original image
    for (let y = 0; y < imageData.height; y++) {
        for (let x = 0; x < imageData.width; x++) {
            // Calculate coordinates in out1 and out2 for the current pixel
            const outX = x * 2;
            const outY = y * 2;
            
            // Get the index of the current pixel in the original image
            const originalIndex = (y * imageData.width + x) * 4;

            const blackPixel = isBlack(imageData.data.slice(originalIndex, originalIndex + 4));

            const orientation = randBool();

            // Copy the pixel to out1
            let permi = orientation ? 1 : 0;
            let permi2 = permi;
            if (blackPixel) {
                permi2 = (permi + 1) % 2;
            }
            let permj = 0;
            for (let offsetY = 0; offsetY < 2; offsetY++) {
                for (let offsetX = 0; offsetX < 2; offsetX++) {
                    const outIndex = ((outY + offsetY) * out1.width + (outX + offsetX)) * 4;
                    for (let i = 0; i < 3; i++) {
                        out1.data[outIndex + i] = 0;
                        out2.data[outIndex + i] = 0;
                    }
                    out1.data[outIndex + 3] = permsOpacity[permi][permj];
                    out2.data[outIndex + 3] = permsOpacity[permi2][permj];
                    permj++;
                }
            }

        }
    }

    return [out1, out2];
}



// Helper function to convert ImageData to image source
function getImageSource(imageData) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
}