// Define the path to the sounds directory
const soundsPath = 'sounds/';

// Load the config file
fetch('config.json')
    .then(response => response.json())
    .then(config => {
        // Get the ambient music source from the config file
        const ambientMusicSource = config.ambientMusic.source;
        const ambientMusicLoop = config.ambientMusic.loop;

        // Populate the ambient music selector with the source
        const ambientMusicSelector = document.querySelector('#ambient-music-source');
        const ambientMusicOption = document.createElement('option');
        ambientMusicOption.textContent = 'Ambient Music';
        ambientMusicOption.value = ambientMusicSource;
        ambientMusicSelector.appendChild(ambientMusicOption);

        // Create a new Audio object for the ambient music
        const ambientMusic = new Audio(ambientMusicSource);
        ambientMusic.loop = ambientMusicLoop;
        ambientMusic.play();

        // Get the sounds from the sounds directory
        fetch(soundsPath)
            .then(response => response.text())
            .then(text => {
                // Split the response text into an array of filenames
                const soundFilenames = text.split('\n');

                // Remove any empty filenames
                const sounds = soundFilenames.filter(filename => filename.trim() !== '');

                // Populate the sound buttons with the filenames
                const soundButtons = sounds.map(filename => {
                    const soundButton = document.createElement('button');
                    soundButton.textContent = filename;
                    soundButton.addEventListener('click', () => {
                        const sound = new Audio(`${soundsPath}${filename}`);
                        sound.play();
                    });
                    return soundButton;
                });

                // Add the sound buttons to the page
                const soundsDiv = document.querySelector('#sounds');
                soundButtons.forEach(soundButton => {
                    soundsDiv.appendChild(soundButton);
                });
            })
            .catch(error => {
                console.error(`Error loading sounds: ${error}`);
            });
    })
    .catch(error => {
        console.error(`Error loading config: ${error}`);
    });
