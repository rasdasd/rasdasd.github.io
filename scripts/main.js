class Person {
    node = null;
    constructor(id) {
        this.id = id;
        this.node = document.createElement('div');
        this.node.classList.add('person');
        frame = document.createElement('img');
        frame.src = '/assets/frame.png'
        frame.classList.add('frame')
        photo = document.createElement('img');
        photo.src = `/assets/${id}`;
        photo.classList.add('photo')
        this.node.append(frame);
        frame.append(photo);
    }
}

class Tray {
    node = null;
    constructor(player) {
        this.player = player;
        this.node = document.createElement('div');
        this.node.classList.add('tray');
        this.node.classList.add(`tray-${player}`);
    }

    reset() {

    }
}

player1 = new Tray(1);
player2 = new Tray(2);

const root = document.getElementById('root');
root.append(player1.node);
root.append(player2.node);

const resetButton = document.createElement('button');
resetButton.onclick(() => {
    player1.reset();
    player2.reset();
});
resetButton.classList.add('reset-button');

root.append(resetButton);

