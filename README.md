# 🏺 Dusty

Welcome to **Dusty**, the web-based hourglass simulation that does nothing of value.

Feel free to take my code and make it better, more visually appealing, or do the opposite and fuck it all up. Either way, I'd love to see your versions. Please reach out to me with your creations so I can see it take on a life of its own.

## What is This Sorcery?

Dusty is an interactive hourglass simulation that combines beautiful visuals with realistic sand particle physics.

Every 60 seconds, the entire world rotates, flipping the hourglass and starting the cycle anew. It's like watching your deadlines approach, except a lil bit prettier.

## Features

- **Physics-Based Sand Simulation**: Each grain of sand is an individual particle with its own velocity, movement patterns, and slight color variation
- **Realistic Particle Interactions**: Sand piles up naturally, flows around obstacles, and responds to gravity
- **Interactive Sand Manipulation**: Disrupt the natural flow by moving your cursor through the sand (touch-enabled for mobile devices!)
- **Automatic Hourglass Rotation**: Every minute, the entire simulation rotates 180°, flipping the hourglass
- **Responsive Design**: Works on desktops, tablets, and mobile devices
- **Aesthetic Visual Design**: Subtle color gradients and smooth animations create a calming experience
- **Performance Optimized**: Efficient grid-based algorithm allows thousands of particles to be simulated simultaneously

## The Science Behind the Sand

### Grid-Based Particle System

Dusty uses a cellular automaton approach to simulate sand physics. The entire screen is divided into a grid of cells (each 12px in size), and each cell can either be empty or contain a sand particle.

```
"But wait," you say, "isn't that just a fancy way of saying you made a bunch of tiny squares?"

Well, yes, but when you put thousands of tiny squares together and give them rules, it looks kind of cool.
```

### The Sand Algorithm (Or: How to Make Your Browser Pretend It's a Beach)

Each frame, every sand particle:

1. Falls downward (or upward when flipped) due to gravity
2. Increases in velocity as it falls (just like real physics!)
3. If blocked, attempts to slide diagonally left or right (randomly chosen)
4. If still blocked, stays put until it can move again
5. Interacts with nearby particles, creating natural-looking piles
6. Responds to user interaction by moving away from the cursor/touch

The simulation uses double-buffering (maintaining current and next-state grids) to ensure all particles are updated based on the same initial state, preventing update order dependencies.

### The Great Rotation

When the timer hits zero, the entire world rotates 180 degrees in a smooth animation. The physics engine reverses gravity direction, giving all particles a velocity boost in the new direction.

## User Interaction: Become the Sand Whisperer

Move your cursor (or finger on touch devices) through the sand to create swirls, pathways, and patterns. The sand particles are repelled from your cursor based on proximity, with closer particles experiencing stronger forces.

The interaction uses an inverse-square force model:
- Particles within 8 cells of your cursor are affected
- Force strength decreases with the square of distance (just like gravity!)
- Both vertical and horizontal forces are applied, creating swirling effects

## Getting Started

1. Clone this repository
2. Open `index.html` in your browser
3. Watch sand fall
4. Question your life choices as you spend the next hour mesmerized by falling pixels
5. (Optional) Poke the sand and feel like a digital deity

## Technical Implementation Details

### The Hourglass Visualization

The hourglass is constructed using CSS clip-paths to create the iconic shape, with separate elements for the top, middle, and bottom sections. The sand levels inside the hourglass are animated using CSS transitions that match the 60-second timer.

### Performance Optimizations

Dusty employs several optimizations to maintain smooth performance even with thousands of particles:

- **Grid-based collision detection**: No need to check every particle against every other particle
- **Frame throttling**: Physics updates happen every other frame to reduce CPU load
- **Limited movement checks**: Particles only check a limited number of cells in their path
- **Batched particle creation**: New particles are created in small batches to prevent sudden performance drops
- **Cell size optimization**: 12px cell size balances visual quality with performance

### The Sand Canvas

All sand particles are rendered on a full-screen HTML5 Canvas element. The canvas is cleared and redrawn each frame, with each particle colored based on its unique color value (a slight variation of the base sand color).

## Final Thoughts

Whether you're using Dusty as a relaxation tool, a physics demonstration, or just something pretty to look at while you contemplate the passage of time, I hope you enjoy watching the sand fall as much as I enjoyed making it fall.

Remember: Time, like sand, flows in only one direction... until you flip the hourglass.
