function loopify(uri,cb,doLoop) {

    var context = new (window.AudioContext || window.webkitAudioContext)(),
        request = new XMLHttpRequest();

    request.responseType = "arraybuffer";
    request.open("GET", uri, true);

    // XHR failed
    request.onerror = function() {
      cb(new Error("Couldn't load audio from " + uri));
    };

    // XHR complete
    request.onload = function() {
      context.decodeAudioData(request.response,success,function(err){
        // Audio was bad
        cb(new Error("Couldn't decode audio from " + uri));
      });
    };

    request.send();

    function success(buffer) {

      var source;

      function play() {

        console.log(`playing ${uri}`);

        // Stop if it's already playing
        stop();

        // Create a new source (can't replay an existing source)
        source = context.createBufferSource();
        source.connect(context.destination);

        // Set the buffer
        source.buffer = buffer;
        source.loop = false;

        // Play it
        source.start(0);

        source.onended = () => {
            if (doLoop()) {
                play();
            } else {
                stop();
            }
        }

      }

      function stop() {

        // Stop and clear if it's playing
        if (source) {
          source.stop();
          source = null;
        }

      }

      cb(null,{
        play: play,
        stop: stop
      });

    }

  }


function button(parent, text, onclick) {
    let btn = document.createElement('BUTTON');
    btn.innerHTML = text;
    parent.appendChild(btn);
    btn.onclick = onclick
    return btn;
}

function load_audio(i, name) {
    loopify(`./assets/tracks/${name}.mp3`, (err, loop) => tracks[i] = loop, () => doLoop(i))
}

function load_name(parent, name) {
    let div = document.createElement('div');
    div.classList.add('track_name');
    div.innerText = name;
    parent.appendChild(div);
    return div;
}

const track_names = [
    'start',
    'loop1',
    '1_2',
    'loop2',
    'NOTloop3',
    '3_4',
    'loop4',
    'loop5',
    '5_6',
    'loop6',
    '6_7',
    'loop7',
    '7_8',
    'loop8',
    '8_9',
    'loop9',
    '9_10',
    'loop10',
    'end',
]

const tracks = [];
for (let i = 0; i < track_names.length; i++) {
    tracks.push(null)
    load_audio(i, track_names[i]);
}
const loops = track_names.map((track_name) => track_name.startsWith('loop'));

const root = document.getElementById('root');
const track_display = document.getElementById('track_display');

const name_divs = track_names.map((track_name) => load_name(track_display, track_name));

let idx = 0;
let current_track = null;
let current_track_idx = 0;
let override = false;

button(root, 'play', () => {
    console.log(idx);
    tracks[idx].play();
    current_track = tracks[idx];
    current_track_idx = idx;
    updateState();
});
button(root, 'pause', () => {
    override = true;
    current_track.stop()
    setTimeout(() => override = false, 1000);
    updateState();
});
button(root, 'restart', () => {
    override = true;
    current_track.stop()
    idx = 0;
    console.log(idx);
    setTimeout(() => override = false, 1000);
    updateState();
});
button(root, 'prev', () => {
    idx -= 1;
    updateState();
})
button(root, 'next', () => {
    idx += 1;
    updateState();
})

function updateState() {
    name_divs.forEach((div, i, _) => {
        if (i == idx) {
            div.classList.add('idx');
        } else {
            div.classList.remove('idx');
        }
        if (i == current_track_idx) {
            div.classList.add('playing');
        } else {
            div.classList.remove('playing');
        }
    })
}

function doLoop(i) {
    if (override) {
        console.log('override stop');
        updateState();
        return false;
    }
    console.log('doLoop check');
    if (idx > i) {
        console.log('play next', i + 1);
        tracks[i + 1].play();
        current_track = tracks[i + 1];
        current_track_idx = i + 1;
        updateState();
        return false;
    } else if (idx < i) {
        console.log('play idx', idx);
        tracks[idx].play();
        current_track = tracks[idx];
        current_track_idx = idx;
        updateState();
        return false;
    } else if (loops[i]) {
        console.log('loop');
        updateState();
        return true;
    } else if (i < tracks.length - 1) {
        console.log('play next', idx + 1);
        idx += 1;
        tracks[idx].play();
        current_track = tracks[idx];
        current_track_idx = idx;
        updateState();
        return false;
    } else {
        console.log('last one');
        updateState();
        return false;
    }
}
