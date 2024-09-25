var SnakeGame = {};

SnakeGame.Game = function (parameters) {
    this.app = parameters.app;
    this.gameMode = 'classic';

    this.width = 20 * 20;  // 20 blocks, each 20 pixels wide
    this.height = 20 * 20; // 20 blocks, each 20 pixels wide
    this.meal_color = {r: 255, g: 255, b: 255}; // Color for meals
    this.snake = null;
    this.meals = [];
    this.walls = [];
};

SnakeGame.Game.prototype.setGameMode = function (mode) {
    this.gameMode = mode;
};

SnakeGame.Game.prototype.setSnake = function (snake) {
    this.snake = snake;
    this.snake.game = this;
};

SnakeGame.Game.prototype.step = function (parameters) {
    var t_Game = this;

    // Update meals on the game board
    t_Game.meals.forEach(function (m, mi) {
        m.meal.clear();
        m.meal.beginFill(rgbToHex(t_Game.meal_color.r, t_Game.meal_color.g, t_Game.meal_color.b));
        m.meal.drawRect(m.x, m.y, t_Game.snake.length, t_Game.snake.length);
    });
};

SnakeGame.Game.prototype.placeMeals = function () {
    if (this.meals.length < 1) {
        var meal = new PIXI.Graphics();
        this.app.stage.addChild(meal); // Add meal graphic to the stage

        let placed = false;
        while (!placed) {
            var mealX = randomInt(1, 18) * 20; // Random X position for the meal
            var mealY = randomInt(1, 18) * 20; // Random Y position for the meal

            // Check if the meal overlaps with the snake or walls
            if (
                !this.snakeOccupies(mealX, mealY) &&
                !this.wallOccupies(mealX, mealY)
            ) {
                this.meals.push({
                    x: mealX,
                    y: mealY,
                    meal: meal
                });

                placed = true; // Meal has been successfully placed
            }
        }
    }
};

SnakeGame.Snake = function () {
    var t_Snake = this;

    t_Snake.x = 0; // Initial X position
    t_Snake.y = 0; // Initial Y position
    t_Snake.length = 20; // Length of the snake's body segments
    t_Snake.game = null; // Reference to the game instance
    t_Snake.piece_size = 1; // Size of each segment
    t_Snake.ep = null; // Endpoint of the snake
    t_Snake.addition = 0.1; // Speed increment
    t_Snake.wa = 0; // Wall interaction counter
    t_Snake.d = null; // Current direction
    t_Snake.rds = { // Reverse directions
        'l': 'r',
        'r': 'l',
        'd': 'u',
        'u': 'd'
    };
    t_Snake.ss = [ // Snake's movement segments
        ['r', 0],
        ['d', 0],
        ['l', 0],
        ['d', 0],
        ['r', 3]
    ];
    t_Snake.points_factor = 20; // Points per segment length
    t_Snake.points = 0;

    // Calculate initial points
    t_Snake.ss.forEach(function (s, i) {
        t_Snake.points += s[1] * t_Snake.points_factor;
    });

    this.default_color = {
        r: 55,
        g: 130,
        b: 57
    };
    this.color = {
        r: this.default_color.r,
        g: this.default_color.g,
        b: this.default_color.b
    };
};

SnakeGame.Snake.prototype.init = function () {
    this.snline = new PIXI.Graphics();
    this.game.app.stage.addChild(this.snline); // Add snake graphic to the stage

    this.x = 30;
    this.y = 30;
};

SnakeGame.Snake.prototype.rotate = function (rotation) {
    // Prevent invalid rotations (180-degree turns)
    if (
        (this.d == rotation)
        ||
        ((this.d == 'l') && (rotation == 'r'))
        ||
        ((this.d == 'r') && (rotation == 'l'))
        ||
        ((this.d == 'u') && (rotation == 'd'))
        ||
        ((this.d == 'd') && (rotation == 'u'))
    ) {
        return false;
    }

    // Prevent backtracking if the last two segments are in opposite directions
    if (this.ss.length > 1) {
        if (
            (this.rds[this.ss[this.ss.length - 2][0]] == rotation)
            &&
            (this.ss[this.ss.length - 1][1] < 1)
        ) {
            return false;
        }
    }

    this.ss.push([rotation, 0]);

    return true;
};

SnakeGame.Snake.prototype.selfCollision = function () {
    var t_Snake = this;

    var collision = false;

    var stx = this.x; // Start X
    var sty = this.y; // Start Y

    var sbx = stx; // Segment base X
    var sby = sty; // Segment base Y

    // Check for collisions with itself
    this.ss.slice(0, this.ss.length - 2).forEach(function (s, i) {
        if (s[0] == 'l') {
            stx += (t_Snake.length * s[1]) * -1;
        } else if (s[0] == 'r') {
            stx += t_Snake.length * s[1];
        } else if (s[0] == 'u') {
            sty += (t_Snake.length * s[1]) * -1;
        } else if (s[0] == 'd') {
            sty += t_Snake.length * s[1];
        }

        var diff_x = parseInt(Math.abs(t_Snake.ep.x - stx));
        var diff_y = parseInt(Math.abs(t_Snake.ep.y - sty));

        // Check for collisions based on direction
        if ((s[0] == 'u') || (s[0] == 'd')) {
            if (diff_x < (t_Snake.length / 2)) {
                if (s[0] == 'u') {
                    if ((t_Snake.ep.y >= sty) && (t_Snake.ep.y <= sby)) {
                        collision = true;
                        return false;
                    }
                } else if (s[0] == 'd') {
                    if ((t_Snake.ep.y >= sby) && (t_Snake.ep.y <= sty)) {
                        collision = true;
                        return false;
                    }
                }
            }
        } else if ((s[0] == 'l') || (s[0] == 'r')) {
            if (diff_y < (t_Snake.length / 2)) {
                if (s[0] == 'l') {
                    if ((t_Snake.ep.x >= stx) && (t_Snake.ep.x <= sbx)) {
                        collision = true;
                        return false;
                    }
                } else if (s[0] == 'r') {
                    if ((t_Snake.ep.x >= sbx) && (t_Snake.ep.x <= stx)) {
                        collision = true;
                        return false;
                    }
                }
            }
        }

        sbx = stx;
        sby = sty;
    });

    return collision;
};

SnakeGame.Snake.prototype.borderCollision = function () {
    var t_Snake = this;

    // Check if the snake has collided with the borders
    if (
        (t_Snake.ep.x <= 22)
        ||
        (t_Snake.ep.x >= t_Snake.game.app.renderer.view.width - 20)
        ||
        (t_Snake.ep.y <= 22)
        ||
        (t_Snake.ep.y >= t_Snake.game.app.renderer.view.height - 20)
    ) {
        return true;
    }

    // Check for collisions with walls
    for (let wall of t_Snake.game.walls) {
        if (
            t_Snake.ep.x >= wall.x &&
            t_Snake.ep.x <= wall.x + 20 &&
            t_Snake.ep.y >= wall.y &&
            t_Snake.ep.y <= wall.y + 40
        ) {
            return true;
        }
    }

    return false;
};

SnakeGame.Snake.prototype.mealCollision = function (parameters) {
    // Check for collision with meals
    var t_Snake = this;

    var collision = false;

    // Loop through each meal in the game
    t_Snake.game.meals.forEach(function (m, mi) {
        var mx = m.x + t_Snake.length / 2; // Calculate the center x position of the meal
        var my = m.y + t_Snake.length / 2; // Calculate the center y position of the meal

        // Calculate the distance from the snake's endpoint to the meal
        var dx = Math.abs(mx - t_Snake.ep.x); // Horizontal distance
        var dy = Math.abs(my - t_Snake.ep.y); // Vertical distance

        // Check if the snake's endpoint is within collision range of the meal
        if (dx < (t_Snake.length / 2) && dy < (t_Snake.length / 2)) {
            t_Snake.game.meals.splice(mi, 1); // Remove the meal from the game
            m.meal.clear();
            t_Snake.game.app.stage.removeChild(m.meal);

            var ls = t_Snake.ss[0];
            if (ls[1] <= 0) {
                t_Snake.ss.splice(0, 1);
                ls = t_Snake.ss[0];
            }

            if (t_Snake.game.gameMode === 'speed') {
                t_Snake.addition += 0.01;
            }

            t_Snake.wa += 1;

            t_Snake.points += t_Snake.length;

            if (t_Snake.game.gameMode === 'walls') {
                t_Snake.game.placeWall();
            }

            collision = true;
            return false;
        }
    });

    return collision;
};

SnakeGame.Game.prototype.placeWall = function () {
    var wall = new PIXI.Graphics();
    this.app.stage.addChild(wall); // Add the wall to the game stage for rendering

    let placed = false;
    while (!placed) {
        // Randomly generate x and y positions for the wall within the game bounds
        let wallX = randomInt(1, 18) * 20;
        let wallY = randomInt(1, 18) * 20;

        // Check if the generated position does not overlap with the snake, meals, or other walls
        if (!this.snakeOccupies(wallX, wallY) && !this.mealOccupies(wallX, wallY) && !this.wallOccupies(wallX, wallY)) {
            this.walls.push({x: wallX, y: wallY, graphics: wall});
            wall.beginFill(0xff0000); // Цвет стены
            wall.drawRect(wallX, wallY, 20, 40); // Draw a rectangle for the wall 20px x 40px
            wall.endFill();
            placed = true;
        }
    }
};

SnakeGame.Game.prototype.snakeOccupies = function (x, y) {
    // Check if the snake occupies the given position (x, y)
    return this.snake.ss.some(segment => {
        let segmentX = this.snake.x + (segment[0] === 'r' ? segment[1] * this.snake.length : (segment[0] === 'l' ? -segment[1] * this.snake.length : 0));
        let segmentY = this.snake.y + (segment[0] === 'd' ? segment[1] * this.snake.length : (segment[0] === 'u' ? -segment[1] * this.snake.length : 0));
        return segmentX === x && segmentY === y;
    });
};

SnakeGame.Game.prototype.mealOccupies = function (x, y) {
    // Check if there is a meal occupying the given position (x, y)
    return this.meals.some(meal => meal.x === x && meal.y === y);
};

SnakeGame.Game.prototype.wallOccupies = function (x, y) {
    // Check if there is a wall occupying the given position (x, y)
    return this.walls.some(wall => wall.x === x && wall.y === y);
};

SnakeGame.Game.prototype.isSnakeOccupying = function (x, y) {
    var t_Snake = this.snake;

    var stx = t_Snake.x; // Current x coordinate of the snake
    var sty = t_Snake.y; // Current y coordinate of the snake

    for (var i = 0; i < t_Snake.ss.length; i++) {
        var direction = t_Snake.ss[i][0]; // Direction of the segment
        var length = t_Snake.length * t_Snake.ss[i][1];

        // Update coordinates based on direction
        if (direction === 'l') {
            stx -= length;
        } else if (direction === 'r') {
            stx += length;
        } else if (direction === 'u') {
            sty -= length;
        } else if (direction === 'd') {
            sty += length;
        }

        // Check if the point (x, y) is within the segment bounds
        if (
            x >= stx && x < stx + t_Snake.length &&
            y >= sty && y < sty + t_Snake.length
        ) {
            return true;
        }
    }

    return false;
};

SnakeGame.Snake.prototype.step = function (parameters) {
    var t_Snake = this;

    t_Snake.snline.clear(); // Clear previous snake lines

    // Set the starting position for drawing the snake
    t_Snake.snline.x = t_Snake.x;
    t_Snake.snline.y = t_Snake.y;

    t_Snake.snline.moveTo(0, 0);
    t_Snake.snline.lineStyle(t_Snake.length, rgbToHex(t_Snake.color.r, t_Snake.color.g, t_Snake.color.b), 1);

    var rx = 0;
    var ry = 0;

    // Loop through snake segments to draw the line
    t_Snake.ss.forEach(function (s, i) {
        if (s[0] === 'l') {
            rx -= t_Snake.length * s[1];
        } else if (s[0] === 'r') {
            rx += t_Snake.length * s[1];
        } else if (s[0] === 'u') {
            ry -= t_Snake.length * s[1];
        } else if (s[0] === 'd') {
            ry += t_Snake.length * s[1];
        }
        t_Snake.snline.lineTo(rx, ry); // Draw line to new position
    });

    // Update the end position of the snake
    t_Snake.ep = {
        x: t_Snake.x + rx,
        y: t_Snake.y + ry
    };

    t_Snake.d = t_Snake.ss[t_Snake.ss.length - 1][0];  // Set the current direction

    var a = t_Snake.addition * parameters.delta; // Calculate adjustment

    var decr = function (i, d) {
        if (t_Snake.wa > 0) {
            t_Snake.color.r = parseInt(((Math.sin(Math.PI * 2 * (new Date).getTime() / 1000) + 1) / 2) * 255);
            t_Snake.color.g = parseInt(((Math.cos(Math.PI * 2 * (new Date).getTime() / 1000) + 1) / 2) * 255);
            t_Snake.color.b = parseInt((Math.cos(Math.PI * 2 * (new Date).getTime() / 1000) + 0.5) * 255);

            t_Snake.wa -= d; // Decrease animation counter
            return;
        } else {
            // Reset color if animation ends
            t_Snake.color = {
                r: t_Snake.default_color.r,
                g: t_Snake.default_color.g,
                b: t_Snake.default_color.b
            };
            t_Snake.wa = 0;
        }

        if (i > t_Snake.ss.length - 1) {
            return;
        }

        var s0 = t_Snake.ss[i][1] - d;
        t_Snake.ss[i][1] = s0;

        var cd = t_Snake.length; // Calculate change in position

        // Adjust position based on direction and length

        if (s0 < 0) {
            cd *= d + s0
        } else {
            cd *= d;
        }

        if (t_Snake.ss[i][0] == 'l') {
            t_Snake.x -= cd;
        } else if (t_Snake.ss[i][0] == 'r') {
            t_Snake.x += cd;
        } else if (t_Snake.ss[i][0] == 'u') {
            t_Snake.y -= cd;
        } else if (t_Snake.ss[i][0] == 'd') {
            t_Snake.y += cd;
        }

        // Remove segment if length is zero or less
        if (t_Snake.ss[i][1] <= 0) {
            t_Snake.ss.splice(i, 1);
        }

        // Recursive call if segment length is negative
        if (s0 < 0) {
            decr(i, s0 * -1);
        }
    };

    decr(0, a); // Start decreasing from the first segment

    t_Snake.ss[t_Snake.ss.length - 1][1] += a;
};

var Game = function (parameters) {
    var t_Game = this;

    t_Game.parameters = parameters;

    t_Game.events = {};
    t_Game.events.finish = function () {
    }; // Event for finishing the game
    t_Game.events.begin = function () {
    }; // Event for starting the game
    t_Game.events.pause = function () {
    }; // Event for pausing the game
    t_Game.events.continue = function () {
    }; // Event for continuing the game
    t_Game.events.mode = function () {
    }; // Event for changing game mode

    t_Game.playing = false;

    // Create a new PIXI application for rendering
    t_Game.app = new PIXI.Application(460, 460, {
        view: t_Game.parameters.view
    });

    // Style the PIXI canvas
    t_Game.app.renderer.view.style.position = "relative";
    t_Game.app.renderer.view.style.display = "block";
    t_Game.app.renderer.view.style.left = "0px";
    t_Game.app.renderer.view.style.top = "0px";

    // Create background texture and sprite
    var bg_texture = PIXI.Texture.fromImage('');
    var bg_sprite = new PIXI.TilingSprite(bg_texture, t_Game.app.renderer.width, t_Game.app.renderer.height);

    // Create background layer
    var bgLayer = new PIXI.Graphics();
    bgLayer.beginFill(0x575757, 1);
    bgLayer.drawRect(0, 0, t_Game.app.renderer.width, t_Game.app.renderer.height);

    // Add background and layer to the stage
    t_Game.app.stage.addChild(bg_sprite);
    t_Game.app.stage.addChild(bgLayer);

    // Create a border for the game area
    var border = new PIXI.Graphics();
    border.lineStyle(40, 0xa96a0e);
    border.drawRect(0, 0, t_Game.app.renderer.width, t_Game.app.renderer.height);
    border.endFill();
    t_Game.app.stage.addChild(border);


    // Function to start a new game
    t_Game.newGame = function () {
        if (t_Game.game !== undefined) {
            t_Game.snake.snline.clear();
            t_Game.game.meals.forEach(function (m, mi) {
                m.meal.clear();
            });
        }

        // Initialize a new game instance
        t_Game.game = new SnakeGame.Game({
            app: t_Game.app
        });

        t_Game.snake = new SnakeGame.Snake(); // Create a new snake instance

        t_Game.game.setSnake(t_Game.snake); // Set the snake for the game
        t_Game.snake.init(); // Initialize the snake

        t_Game.ticker = new PIXI.ticker.Ticker(); // Create a new ticker for updates

        // Add game update logic to the ticker
        t_Game.ticker.add(function (delta) {
            t_Game.game.placeMeals(); // Place meals in the game
            t_Game.game.step({delta: delta}); // Update game state
            t_Game.snake.step({delta: delta}); // Update snake state
            t_Game.snake.mealCollision({delta: delta}); // Check for meal collisions

            // Check for collisions based on game mode
            if (t_Game.game.gameMode !== 'immortal') {
                if (t_Game.snake.selfCollision() || t_Game.snake.borderCollision()) {
                    t_Game.finish();
                }
            } else {
                if (t_Game.snake.borderCollision()) {
                    t_Game.finish();
                }
            }
        });
    };

    // Function to finish the game
    t_Game.finish = function () {
        t_Game.playing = false; // Set playing status to false
        t_Game.ticker.stop(); // Stop the ticker

        // Clear walls from the game
        t_Game.game.walls.forEach(function (wall) {
            wall.graphics.clear();
            t_Game.game.app.stage.removeChild(wall.graphics);
        });
        t_Game.game.walls = [];

        t_Game.events.finish({
            points: t_Game.snake.points
        });
    };

    // Function to stop the game
    t_Game.stop = function () {
        t_Game.playing = false;
        t_Game.ticker.stop();
    };

    // Function to pause the game
    t_Game.pause = function () {
        t_Game.playing = false;
        t_Game.ticker.stop();
        t_Game.events.pause({
            points: t_Game.snake.points
        });
    };

    // Function to continue the game
    t_Game.continue = function () {
        t_Game.play();
        t_Game.events.continue();
    };

    // Function to start playing the game
    t_Game.play = function () {
        var selectedMode = document.querySelector('input[name="gameMode"]:checked').value;
        t_Game.playing = true; // Set playing status to true
        t_Game.ticker.start(); // Start the ticker
        t_Game.events.begin(); // Trigger begin event
        t_Game.game.setGameMode(selectedMode); // Set the game mode
    };

    // Keyboard event handler for controlling the game
    var handler = function (event) {
        if ([32, 37, 38, 39, 40].indexOf(event.keyCode) > -1) {
            event.preventDefault();
        }

        if (event.keyCode == 37) { // LEFT
            t_Game.snake.rotate('l');
        } else if (event.keyCode == 39) { // RIGHT
            t_Game.snake.rotate('r');
        } else if (event.keyCode == 38) { // UP
            t_Game.snake.rotate('u');
        } else if (event.keyCode == 40) { // DOWN
            t_Game.snake.rotate('d');
        } else if (event.keyCode == 13) { // ENTER
            if (!t_Game.playing) {
                t_Game.newGame();
                t_Game.play();
            }
        } else if (event.keyCode == 80) { // P
            if (t_Game.playing) {
                t_Game.pause();
            } else {
                t_Game.continue();
            }
        } else if (event.keyCode == 78) { // N
            t_Game.stop();
            t_Game.newGame();
            t_Game.play();
        }


    };

    // Add keyboard event listener
    window.addEventListener('keydown', handler);
    if (parent && inIframe()) {
        parent.window.addEventListener('keydown', handler);
    }

    // Touch event handler for mobile controls
    t_Game.app.renderer.view.addEventListener('touchstart', function (event) {
        if (t_Game.snake.d == 'l') {
            t_Game.snake.rotate('u');
        } else if (t_Game.snake.d == 'r') {
            t_Game.snake.rotate('d');
        } else if (t_Game.snake.d == 'd') {
            t_Game.snake.rotate('l');
        } else if (t_Game.snake.d == 'u') {
            t_Game.snake.rotate('r');
        }
    }, false);
};

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function inIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

function rgbToHex(r, g, b) {
    return parseInt("0x" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1));
}