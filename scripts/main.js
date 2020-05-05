class Person {
    node = null;
    constructor(id, player) {
        this.id = id;
        this.node = document.createElement('div');
        this.node.classList.add('person');
        this.node.classList.add(`person-${player}`);
        let photo = document.createElement('img');
        photo.src = `assets/${id}.jpg`;
        photo.classList.add('photo')
        this.node.append(photo);
        photo.onclick = () => this.toggle();
    }

    reset() {
        this.toggle(true);
    }

    toggle(forced) {
        if (forced) {
            this.node.classList.remove('face-down');
        } else {
            this.node.classList.toggle('face-down');
        }
    }

}

class Tray {
    node = null;
    constructor(player) {
        this.player = player;
        this.node = document.createElement('div');
        this.node.classList.add('tray');
        this.node.classList.add(`tray-${player}`);
        this.persons = [];
        for (let i = 0; i < 24; i++) {
            const person = new Person(i, player);
            this.persons.push(person);
            this.node.append(person.node);
        }
    }

    reset() {
        this.persons.forEach( p => p.reset());
    }
}

const player1 = new Tray(1);
const player2 = new Tray(2);

const root = document.getElementById('root');
root.append(player1.node);
root.append(player2.node);

const resetButton = document.createElement('button');
resetButton.textContent = 'Restart Game'
resetButton.onclick = () => {
    player1.reset();
    player2.reset();
};
resetButton.classList.add('reset-button');

document.getElementsByTagName('body')[0].append(resetButton);

