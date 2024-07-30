document.addEventListener('DOMContentLoaded', () => {
const { Engine, Render, Runner, World, Bodies, Body, Events, Composite } = Matter;

const engine = Engine.create();
engine.world.gravity.y = 0; // Set gravity to zero for microgravity effect
const world = engine.world;
const parent = document.body;
const render = Render.create({
    element: parent,
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: 'transparent'

    }
});

Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);


// Function to create a new image body
const createImage = (x, y) => {
    const angleRad = Math.random() * 2 * Math.PI;
    const image = Bodies.rectangle(x, y, 70, 40, {
        render: {
            sprite: {
                texture: 'banana.png',
                xScale: 1,
                yScale: 1
            }
        },
        restitution: 1,
        friction: 0,
        frictionAir: 0, // Increase friction air to slow down movement
        frictionStatic: 0,
        angle: angleRad
    });

    Body.setAngularVelocity(image, Math.random() * 0.02 - 0.01); // Reduce angular velocity for slower rotation
    const forceMagnitude = 0.01 * image.mass; // Adjust force magnitude for slower reaction
    const angle = angleRad;
    Body.applyForce(image, image.position, {
        x: forceMagnitude * Math.cos(angle),
        y: forceMagnitude * Math.sin(angle)
    });
    World.add(world, image);
    return image;
};

// Add initial images
for (let i = 0; i < 7; i++) {
    createImage(Math.random() * window.innerWidth, Math.random() * window.innerHeight);
}

// Add screen boundary walls
const addBoundaryWalls = () => {
    // clear old walls
    world.bodies = world.bodies.filter(body => !body.isStatic);
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

// Resize canvas on window resize
window.addEventListener('resize', () => {
    render.canvas.width = window.innerWidth;
    render.canvas.height = window.innerHeight;
    render.bounds.max.x = window.innerWidth;
    render.bounds.max.y = window.innerHeight;
    render.options.clientWidth = window.innerWidth;
    render.options.clientHeight = window.innerHeight;
    addBoundaryWalls();
});
});