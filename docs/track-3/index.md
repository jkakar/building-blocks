# Track 3 — Object-oriented

You finished Track 1. You finished Track 2. The same game has been
written two different ways. Time for a third.

Open `main.ts` from Track 1's Unit 6 and scan the variables at the
top:

```ts
let x = 100;
let y = 100;
let vx = 200;
let vy = 150;

let paddleX = 400;
let paddleY = 560;
let paddleWidth = 80;
let paddleHeight = 12;
```

Eight loose variables. Four describe the ball. Four describe the
paddle. They have nothing in common, but they all live in the same
flat list at the top of the file. To add a second ball you'd copy
four lines and pick new names: `x2`, `y2`, `vx2`, `vy2`. To add a
third, four more. The duplication adds up fast.

In Track 3 you'll rewrite the simpler version of the game — paddle,
ball, lives, score, sound, no bricks — using **classes**. A class
is a blueprint for a kind of thing in the game. A `Ball` class
bundles all four ball fields and the ball's `update` and `draw`
code into one unit. The paddle becomes a `Paddle`. Adding a second
ball becomes one line.

You'll also meet **inheritance** — a way for one class to start
from another and change *just the parts that differ*. A
`ToughBrick` is a `Brick` that takes two hits instead of one. You
write the differences; the rest comes for free.

## Who this track is for

You finished Track 1. (Track 2 is a bonus; you can do Track 3
without it.) You're comfortable with `let`, `function`, `if`,
arrays, and writing your own helpers.

## What you'll build

A working paddle-and-ball game — paddle, bouncing ball, lives,
score, sound, Game Over — same as where you were at the end of
Track 1's Unit 6. Plus one brand-new thing only Track 3 has: a
**multi-ball power-up**. Every few paddle hits, an extra ball
appears. Five balls bouncing around at once.

Under the hood:

- A `Ball` class with its own position, velocity, and `update`
  method.
- A `Paddle` class that knows how to read the keyboard and
  collide with rectangles.
- A `Brick` class, plus a `ToughBrick` that **extends** it —
  same shape, different behavior.
- An array of balls in `main.ts`. Adding a ball is
  `balls.push(new Ball(...))`. One line.

## What you'll learn

- **Class** — a blueprint that bundles state and behavior.
- **Instance** — a real thing made from a blueprint.
- **Constructor** — the recipe that runs when you make an
  instance.
- **Method** — a function attached to a class.
- **`this`** — the instance the method is running on.
- **Field** — a variable that lives on an instance.
- **Inheritance** / **`extends`** — one class building on another.

## What you keep from Track 1

The engine (`game.ts`) doesn't change. `index.html`,
`package.json`, and `tsconfig.json` don't change. Your Track 1
project still works — leave it alone and start fresh in a new
folder.

Ready? Open [Unit 1 — Ball as a class](/track-3/unit-1).
