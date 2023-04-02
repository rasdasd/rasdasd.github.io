// Load ambient data
fetch('ambient.json')
    .then(response => response.json())
    .then(ambientData => initAmbientPlayer(ambientData))
    .catch(error => console.error('Error loading ambient data:', error));

// Initialize ambient player
function initAmbientPlayer(ambientData) {
    const player = document.getElementById('ambientPlayer');

    ambientData.forEach((data) => {
        const iframe = document.createElement('iframe');
        iframe.width = '100%';
        iframe.height = '166';
        iframe.frameBorder = 'no';
        iframe.allow = 'autoplay';

        switch (data.type) {
            case 'youtube':
                if (data.loop) {
                    iframe.src = `${data.source}?autoplay=1&loop=1&playlist=${data.source.split('/').pop()}`;
                } else {
                    iframe.src = `${data.source}?autoplay=1`;
                }
                break;
            case 'spotify':
                if (data.loop) {
                    iframe.src = `${data.source}?autoplay=1&loop=1`;
                } else {
                    iframe.src = `${data.source}?autoplay=1`;
                }
                break;
            default:
                console.error(`Unsupported type: ${data.type}`);
                return;
        }

        // Add a container for each player and make it initially hidden
        const playerContainer = document.createElement('div');
        playerContainer.style.display = 'none';
        playerContainer.appendChild(iframe);
        player.appendChild(playerContainer);

        // Add a button to control the visibility and playback of each player
        const button = document.createElement('button');
        button.textContent = data.description;
        button.onclick = () => {
            const isActive = playerContainer.style.display === 'block';
            // Hide all player containers
            player.childNodes.forEach((child) => {
                if (child.nodeType === Node.ELEMENT_NODE) {
                    child.style.display = 'none';
                }
            });

            if (isActive) {
                playerContainer.style.display = 'none';
            } else {
                playerContainer.style.display = 'block';
            }
        };

        player.appendChild(button);
    });
}


// Load sounds
const sounds = ['bell.mp3', 'gong.mp3'];
const soundButtons = document.getElementById('soundButtons');

sounds.forEach(sound => {
    const button = document.createElement('button');
    button.textContent = sound.split('.')[0];
    button.onclick = () => playSound(sound);
    soundButtons.appendChild(button);
});

// Play sound
function playSound(sound) {
    const audio = new Audio(`sounds/${sound}`);
    audio.play();
}
