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

class ScoreCounter {
    node = null;
    score = null;
    constructor(player) {
        this.node = document.createElement('div');
        this.node.classList.add(`score-${player}`);
        this.node.classList.add('score');
        const up = document.createElement('i');
        up.classList.add('arrow');
        up.classList.add('up');
        this.score = document.createElement('div');
        this.score.classList.add('score-value');
        this.score.textContent = 0;
        const down = document.createElement('i');
        down.classList.add('arrow');
        down.classList.add('down');
        up.onclick = () => this.score.textContent -= -1;
        down.onclick = () => this.score.textContent -= 1;
        this.node.append(up);
        this.node.append(this.score);
        this.node.append(down);
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


bottom = document.createElement('div');
bottom.classList.add(`bottom`);
document.getElementsByTagName('body')[0].append(bottom);

bottom.append(new ScoreCounter(1).node);
bottom.append(resetButton);
bottom.append(new ScoreCounter(2).node);



