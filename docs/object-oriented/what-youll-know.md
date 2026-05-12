# What you'll know after Course 3

A short tour of what this course adds to what you learned in
Course 1. Useful before you start and after you finish.

By the end of Course 3 you'll have rewritten the simpler v0
brick-breaker as classes — `Ball`, `Paddle`, `Brick`,
`ToughBrick extends Brick` — and watched the OO architecture
pay off when one ball becomes five with a few lines.

## What you'll add to your toolkit

- **`class`** declarations with **fields**, a **constructor**,
  and **methods**.
- **`this`** — the keyword meaning "the instance the method was
  called on."
- **`new`** to make an **instance** from a class.
- **`extends`** for **inheritance** — `class B extends A` makes
  B "a kind of A."
- **`super`** for calling the parent class's version of a
  method.
- **Method override** — a subclass replacing a parent's method.
- **Polymorphism** — calling the same method on a list of mixed
  subclasses and getting different behavior per instance.
- **`for ... of`** — the cleaner loop over arrays of instances.

## Patterns and principles

- **Nouns are classes, verbs are methods.** Ask "what kinds of
  thing are in my game?" Each becomes a class.
- **Encapsulation.** A brick *owns* its own state; you change
  it via methods, not by reaching in.
- **"Is-a" inheritance.** If a ToughBrick *is* a Brick, `extends`
  makes that explicit. If two things just share fields but
  aren't kinds of each other, don't use inheritance.
- **Arrays of instances scale linearly.** Multi-ball is one
  `for ... of balls` loop. A thousand balls is the same loop.
- **Mutate-while-iterating is a trap.** Build a "survivors"
  array instead of splicing inside the loop.
- **Sub-call the parent with `super`.** When a subclass extends
  behavior, `super.method()` runs the original — no need to
  retype it.

## What this course deliberately doesn't teach

- **Access modifiers** (`private`, `public`, `protected`,
  `readonly`).
- **Static methods and fields.**
- **Abstract classes** and `abstract` methods.
- **Interfaces** as a separate concept from classes.
- **Generics** — classes that parameterize over types.
- **Getters and setters.**
- **Composition vs inheritance** debates — we use inheritance
  in the one obvious case (`ToughBrick extends Brick`) and
  don't weigh the trade-offs in depth.

## How it fits with the other courses

- **Course 1 (procedural)** keeps state and behavior in
  separate places — module-level variables plus standalone
  functions. OO bundles them.
- **Course 2 (event-driven)** complements OO well — classes
  often emit events. Combining them is the norm in big apps.
- **Course 4 (functional)** is the *opposite* of OO in spirit:
  data without methods, transformations without mutation. A
  good contrast to study.
- **Course 6 (ECS)** is OO with the methods stripped out. The
  Ball isn't a `Ball`-class instance with methods; it's an
  entity ID with Position, Velocity, and Sprite components,
  and standalone systems do the work.

OO is the dominant paradigm in industry codebases. After this
course you'll be able to read most code you encounter and at
least follow what's happening.
