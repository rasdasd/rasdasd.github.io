const { Engine, Render, Runner, World, Bodies, Body, Mouse, MouseConstraint, Events, Composite } = Matter;

const engine = Engine.create();
engine.world.gravity.y = 0; // Set gravity to zero for microgravity effect
const world = engine.world;

const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: '#FFF'
    }
});

Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);

// Function to create a new image body
const createImage = (x, y) => {
    const angleRad = Math.random() * 2 * Math.PI;
    const image = Bodies.rectangle(x, y, 50, 50, {
        render: {
            sprite: {
                texture: 'banana.png',
                xScale: 0.25,
                yScale: 0.25
            }
        },
        restitution: 1,
        friction: 0,
        frictionAir: 0, // Increase friction air to slow down movement
        angle: angleRad
    });

    Body.setAngularVelocity(image, Math.random() * 0.02 - 0.01); // Reduce angular velocity for slower rotation
    const forceMagnitude = 0.001 * image.mass; // Adjust force magnitude for slower reaction
    const angle = angleRad;
    Body.applyForce(image, image.position, {
        x: forceMagnitude * Math.cos(angle),
        y: forceMagnitude * Math.sin(angle)
    });
    World.add(world, image);
    return image;
};

// Add initial images
for (let i = 0; i < 5; i++) {
    createImage(Math.random() * window.innerWidth, Math.random() * window.innerHeight);
}

// Add screen boundary walls
const addBoundaryWalls = () => {
    const thickness = 50; // Make the boundary walls thick enough to avoid clipping issues
    const walls = [
        Bodies.rectangle(window.innerWidth / 2, -thickness / 2, window.innerWidth, thickness, { isStatic: true }),
        Bodies.rectangle(window.innerWidth / 2, window.innerHeight + thickness / 2, window.innerWidth, thickness, { isStatic: true }),
        Bodies.rectangle(-thickness / 2, window.innerHeight / 2, thickness, window.innerHeight, { isStatic: true }),
        Bodies.rectangle(window.innerWidth + thickness / 2, window.innerHeight / 2, thickness, window.innerHeight, { isStatic: true })
    ];
    World.add(world, walls);
};

addBoundaryWalls();

// Mouse control
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        stiffness: 0.2,
        render: {
            visible: false
        }
    }
});

World.add(world, mouseConstraint);

// Add image on click or touch
const addImage = (event) => {
    const posX = event.clientX || event.touches[0].clientX;
    const posY = event.clientY || event.touches[0].clientY;
    createImage(posX, posY);
    pushAwayImages(posX, posY);
};

// Push images away from the point of interaction
const pushAwayImages = (x, y) => {
    const bodies = Composite.allBodies(world);
    bodies.forEach(body => {
        const forceMagnitude = 0.001 * body.mass; // Adjust force magnitude for slower reaction
        const angle = Math.atan2(body.position.y - y, body.position.x - x);
        Body.applyForce(body, body.position, {
            x: forceMagnitude * Math.cos(angle),
            y: forceMagnitude * Math.sin(angle)
        });
    });
};

render.canvas.addEventListener('mousedown', addImage);
render.canvas.addEventListener('touchstart', addImage);

// Keep images bouncing and rotating
Events.on(engine, 'beforeUpdate', () => {
    const bodies = Composite.allBodies(world);
    bodies.forEach(body => {
        Body.setAngularVelocity(body, body.angularVelocity * 0.99); // Dampen angular velocity
        Body.applyForce(body, body.position, {
            x: (Math.random() - 0.5) * 0.0001, // Reduce random forces for slower movement
            y: (Math.random() - 0.5) * 0.0001
        });
    });
});
