$(document).ready(function () {
    // Fetch and preload sounds from the assets folder
    fetchSounds();

    // Play the sound when a button is clicked
    $(document).on('click', '.sound-button', function () {
        let audio = $(this).data('audio-object');
        audio.currentTime = 0;
        audio.play();
    });

    // Change the active category when a tab is clicked
    $(document).on('click', '.category-tab', function () {
        let categoryId = $(this).data('category-id');
        $('.category-tab').removeClass('active');
        $(this).addClass('active');
        $('.sound-category').hide();
        $('#' + categoryId).show();
    });
});

function fetchSounds() {
    $.ajax({
        url: 'https://api.github.com/repositories/222611418/contents/soundboard/assets/',
        success: function (data) {
            // let sounds = [];
            // $(data).find('a').each(function () {
            //     let filename = $(this).attr('href');
            //     if (filename.match(/\.mp3$|\.ogg$/)) {
            //         sounds.push({ name: filename, url: 'assets/' + filename });
            //     }
            // });

            const prefix_len = 'soundboard/'.length;
            let sounds = data.filter(node => node.size > 0).map(node => {
                return {
                "url": node.path.substring(prefix_len),
                "name": node.name
                }
            });
            // Sort the sounds alphabetically and numerically
            sounds.sort((a, b) => {
                return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
            });

            // Group sounds by category
            let categories = {};
            sounds.forEach((sound) => {
                let buttonText = sound.name.replace(/\.mp3$|\.ogg$/, ''); // Remove file extension
                let [category, title] = buttonText.split('-', 2);
                if (!categories[category]) {
                    categories[category] = [];
                }
                categories[category].push({ title: title, url: sound.url });
            });

            // Add category tabs
            for (const category in categories) {
                let categoryTab = $('<button class="category-tab">' + category + '</button>');
                categoryTab.data('category-id', category);
                $('#category-list').append(categoryTab);
            }

            // Add sound buttons to the soundboard and preload the audio files
            for (const category in categories) {
                let categoryDiv = $(`<div class="sound-category" id="${category}"></div>`);
                categoryDiv.append(`<h2>${category}</h2>`);

                categories[category].forEach((sound) => {
                    let audio = new Audio(sound.url);
                    audio.preload = 'auto';
                    let button = $('<button class="sound-button">' + sound.title + '</button>');
                    button.data('audio-object', audio);
                    categoryDiv.append(button);
                });

                $('#soundboard').append(categoryDiv);
            }
            // Set the first category as the active category
            $('.category-tab').first().addClass('active');
            $('.sound-category').hide().first().show();
        },
        error: function (error) {
            console.error('Error fetching sounds:', error);
        },
    });
}