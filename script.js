// Global variables
let canvas, ctx;
let rotationInProgress = false;
let secondsRemaining = 60;
let isFlipped = false;
let mouseX = -1;
let mouseY = -1;
let touchActive = false;
let lastFrameTime = 0;
let frameCount = 0;
let lastParticleCreationTime = 0;

// Grid system variables
let cellSize = 12; // Increased cell size for better performance
let cols, rows;
let grid = [];
let nextGrid = [];
let velocityGrid = [];
let nextVelocityGrid = [];
let colors = [];

// Constants
const EMPTY = 0;
const SAND = 1;
const gravity = 0.3;
const baseColor = [194, 181, 158]; // RGB for #c2b59e
const PARTICLE_CREATION_INTERVAL = 80; // ms between particle batches
const PARTICLE_BATCH_SIZE = 2; // particles per batch

// DOM elements
const rotatingWorld = document.querySelector('.rotating-world');
const background = document.querySelector('.background');
const hourglassContainer = document.querySelector('.hourglass-container');
const timers = document.querySelectorAll('.timer');
const title = document.querySelector('.title');
const hourglassSandTop = document.querySelector('.hourglass-sand-top');
const hourglassSandBottom = document.querySelector('.hourglass-sand-bottom');
const crack = document.querySelector('.crack');

// Initialize the playground
function init() {
    // Set up canvas
    canvas = document.querySelector('.sand-canvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Initialize grid
    initializeGrids();
    
    // Start the countdown
    updateTimers();
    setInterval(countdown, 1000);
    
    // Start the animation loop
    requestAnimationFrame(animate);
    
    // Add event listeners for mouse/touch interaction
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Initialize hourglass sand
    updateHourglassSand();
}

// Resize canvas to match window size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Recalculate grid dimensions
    cols = Math.ceil(canvas.width / cellSize);
    rows = Math.ceil(canvas.height / cellSize);
    
    // Reinitialize grids if needed
    if (grid.length !== cols || (grid.length > 0 && grid[0].length !== rows)) {
        initializeGrids();
    }
}

// Initialize grid arrays
function initializeGrids() {
    grid = make2DArray(cols, rows);
    nextGrid = make2DArray(cols, rows);
    velocityGrid = make2DArray(cols, rows);
    nextVelocityGrid = make2DArray(cols, rows);
    colors = make2DArray(cols, rows);
}

// Create a 2D array
function make2DArray(cols, rows) {
    let arr = new Array(cols);
    for (let i = 0; i < arr.length; i++) {
        arr[i] = new Array(rows);
        for (let j = 0; j < rows; j++) {
            arr[i][j] = 0;
        }
    }
    return arr;
}

// Format time as MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Countdown function
function countdown() {
    secondsRemaining--;
    
    if (secondsRemaining <= 0) {
        rotateHourglass();
        secondsRemaining = 60;
    }
    
    updateTimers();
    updateHourglassSand();
}

// Update hourglass sand levels
function updateHourglassSand() {
    const topHeight = isFlipped 
        ? 5 + (secondsRemaining / 60) * 30 
        : 5 + ((60 - secondsRemaining) / 60) * 30;
        
    const bottomHeight = isFlipped 
        ? 5 + ((60 - secondsRemaining) / 60) * 30 
        : 5 + (secondsRemaining / 60) * 30;
        
    hourglassSandTop.style.height = `${topHeight}%`;
    hourglassSandBottom.style.height = `${bottomHeight}%`;
}

// Update all timer displays
function updateTimers() {
    const timeString = formatTime(secondsRemaining);
    timers.forEach(timer => {
        timer.textContent = timeString;
    });
}

// Replace the rotateHourglass function with this version
function rotateHourglass() {
    rotationInProgress = true;
    
    // Rotate hourglass container along a path
    isFlipped = !isFlipped;
    
    if (isFlipped) {
        hourglassContainer.style.transform = 'translate(0, 70vh) rotate(180deg)';
        rotatingWorld.style.transform = 'rotate(-180deg)';
        background.style.transform = 'scale(0.95)';
        
        // Counter-rotate timers and title
        timers.forEach(timer => {
            timer.style.transform = 'rotate(180deg)';
        });
        title.style.transform = 'translateY(-50%) rotate(180deg)';
    } else {
        hourglassContainer.style.transform = 'translate(0, 0) rotate(0deg)';
        rotatingWorld.style.transform = 'rotate(0deg)';
        background.style.transform = 'scale(0.95)';
        
        // Reset timers and title rotation
        timers.forEach(timer => {
            timer.style.transform = 'rotate(0deg)';
        });
        title.style.transform = 'translateY(-50%) rotate(0deg)';
    }
    
    // Wait for rotation to complete visually, then apply physics
    setTimeout(() => {
        rotationInProgress = false;
        
        // Give all particles a boost in the new gravity direction
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                if (grid[i][j] === SAND) {
                    // Apply a strong initial velocity in the new direction
                    velocityGrid[i][j] = isFlipped ? -2 : 2;
                }
            }
        }
        
    }, 3000); // Match the transition duration
}
        
function createSandAtCrack() {
    const now = Date.now();
    if (now - lastParticleCreationTime < PARTICLE_CREATION_INTERVAL) return;
    lastParticleCreationTime = now;
    
    // Hardcode positions instead of detecting them
    let col, row;
    
    if (isFlipped) {
        // When flipped, sand comes from bottom of screen
        col = Math.floor(canvas.width / 2 / cellSize);
        row = Math.floor((canvas.height - canvas.height * 0.1) / cellSize);
    } else {
        // When not flipped, sand comes from top of screen
        col = Math.floor(canvas.width / 2 / cellSize);
        row = Math.floor(canvas.height * 0.1 / cellSize);
    }
    
    // Create sand particles
    const extent = 1;
    for (let i = -extent; i <= extent; i++) {
        for (let j = -extent; j <= extent; j++) {
            if (Math.random() < 0.3 && PARTICLE_BATCH_SIZE > 0) {
                const newCol = col + i;
                const newRow = row + j;
                
                if (withinGrid(newCol, newRow) && grid[newCol][newRow] === EMPTY) {
                    grid[newCol][newRow] = SAND;
                    velocityGrid[newCol][newRow] = isFlipped ? -1 : 1;
                    
                    // Random color variation
                    const colorVariation = Math.floor(Math.random() * 20 - 10);
                    colors[newCol][newRow] = [
                        Math.max(0, Math.min(255, baseColor[0] + colorVariation)),
                        Math.max(0, Math.min(255, baseColor[1] + colorVariation)),
                        Math.max(0, Math.min(255, baseColor[2] + colorVariation))
                    ];
                }
            }
        }
    }
}

// Check if coordinates are within grid bounds
function withinGrid(col, row) {
    return col >= 0 && col < cols && row >= 0 && row < rows;
}

// Animation loop
function animate(timestamp) {
    // Calculate delta time for consistent animations
    const deltaTime = timestamp - lastFrameTime;
    lastFrameTime = timestamp;
    
    // Throttle updates for better performance
    frameCount++;
    if (frameCount % 2 === 0) { // Only update every other frame
        // Create new sand particles
        if (!rotationInProgress) {
            createSandAtCrack();
        }
        
        // Update grid
        updateGrid();
    }
    
    // Always draw
    drawGrid();
    
    // Continue animation
    requestAnimationFrame(animate);
}

// Update the grid state
function updateGrid() {
    // Reset next grid
    nextGrid = make2DArray(cols, rows);
    nextVelocityGrid = make2DArray(cols, rows);
    
    // Process each cell - optimize by only checking cells that might have sand
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (grid[i][j] === SAND) {
                updateSandCell(i, j);
            }
        }
    }
    
    // Swap grids
    grid = nextGrid;
    velocityGrid = nextVelocityGrid;
}

// Update a single sand cell
function updateSandCell(i, j) {
    let velocity = velocityGrid[i][j];
    
    // Apply gravity (direction based on isFlipped)
    velocity += isFlipped ? -gravity : gravity;
    
    // Calculate new position based on velocity
    let newRow = Math.floor(j + velocity);
    let moved = false;
    
    // Check mouse influence
    if (mouseX >= 0 && mouseY >= 0) {
        const mouseCol = Math.floor(mouseX / cellSize);
        const mouseRow = Math.floor(mouseY / cellSize);
        
        const dx = i - mouseCol;
        const dy = j - mouseRow;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 8) { // Influence radius
            const force = 5 / Math.max(1, distance);
            const angle = Math.atan2(dy, dx);
            
            // Add velocity away from mouse
            velocity += (isFlipped ? -1 : 1) * Math.sin(angle) * force * 0.2;
            
            // Add horizontal movement
            const horizontalForce = Math.cos(angle) * force * 0.5;
            if (Math.abs(horizontalForce) > 0.1) {
                const targetCol = i + Math.sign(horizontalForce);
                if (withinGrid(targetCol, j) && grid[targetCol][j] === EMPTY) {
                    nextGrid[targetCol][j] = SAND;
                    nextVelocityGrid[targetCol][j] = velocity;
                    colors[targetCol][j] = colors[i][j];
                    moved = true;
                }
            }
        }
    }
    
    if (!moved) {
        // Optimize by checking only a limited number of cells
        const direction = Math.sign(velocity);
        const maxCheck = Math.min(Math.abs(Math.floor(velocity)) + 1, 5); // Limit check distance
        const startRow = j + direction;
        const endRow = j + direction * maxCheck;
        
        // Loop through potential positions
        for (let y = startRow; y !== endRow + direction; y += direction) {
            if (!withinGrid(i, y)) continue;
            
            // Check if the cell below is empty
            if (grid[i][y] === EMPTY) {
                nextGrid[i][y] = SAND;
                nextVelocityGrid[i][y] = velocity;
                colors[i][y] = colors[i][j];
                moved = true;
                break;
            }
            
            // Try to move diagonally if blocked
            const leftCol = i - 1;
            const rightCol = i + 1;
            
            // Randomly choose left or right first
            const goLeftFirst = Math.random() < 0.5;
            const diagCols = goLeftFirst ? [leftCol, rightCol] : [rightCol, leftCol];
            
            for (const diagCol of diagCols) {
                if (withinGrid(diagCol, y) && grid[diagCol][y] === EMPTY) {
                    nextGrid[diagCol][y] = SAND;
                    nextVelocityGrid[diagCol][y] = velocity * 0.8; // Reduce velocity when moving diagonally
                    colors[diagCol][y] = colors[i][j];
                    moved = true;
                    break;
                }
            }
            
            if (moved) break;
        }
    }
    
    // If still not moved, keep in place
    if (!moved) {
        nextGrid[i][j] = SAND;
        nextVelocityGrid[i][j] = velocity * 0.5; // Reduce velocity when stuck
        
        // Add small random movement to prevent complete stagnation
        // but do it less frequently for better performance
        if (Math.random() < 0.02) {
            const randomDir = Math.random() < 0.5 ? -1 : 1;
            const targetCol = i + randomDir;
            
            if (withinGrid(targetCol, j) && grid[targetCol][j] === EMPTY) {
                nextGrid[targetCol][j] = SAND;
                nextVelocityGrid[targetCol][j] = velocity * 0.3;
                nextGrid[i][j] = EMPTY;
                colors[targetCol][j] = colors[i][j];
            }
        }
    }
}

// Draw the grid on canvas
function drawGrid() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw sand particles
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (grid[i][j] === SAND) {
                const color = colors[i][j];
                ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
                ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
            }
        }
    }
}

// Handle mouse movement
function handleMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
}

// Handle touch start
function handleTouchStart(e) {
    e.preventDefault();
    touchActive = true;
    if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
    }
}

// Handle touch movement
function handleTouchMove(e) {
    e.preventDefault();
    if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
    }
}

// Handle touch end
function handleTouchEnd(e) {
    e.preventDefault();
    touchActive = false;
    mouseX = -1;
    mouseY = -1;
}

// Start the playground
window.addEventListener('load', init);
