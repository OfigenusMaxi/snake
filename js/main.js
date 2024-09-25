var game;

document.addEventListener('DOMContentLoaded', function () {
    var gameOver = document.querySelector('.gameOver');
    var gameOver_startButton = gameOver.querySelector('.gameOver_startButton');
    var gameOver_points = gameOver.querySelector('.gameMenu_box_points_number');

    var play_startButton = document.querySelector('#play');
    var menu_menuButton = document.querySelector('#menu');
    var exit_exitButton = document.querySelector('#exit');
    var score_points = document.querySelector('.score_number');
    var bestScore_points = document.querySelector('.best_score_points');
    var mode_modeButton = document.querySelector('.game_mode');

    var best_score='0';

    game = new Game({
        view: document.querySelector('.gameView')
    });

    game.events.finish = function (parameters) {
        gameOver_points.innerHTML = parameters.points;
        score_points.innerHTML = parameters.points;

        if (parameters.points > best_score) {
            best_score = parameters.points
            bestScore_points.innerHTML = best_score;
        }

        gameOver.style.display = 'block';
        setTimeout(function () {
            gameOver.style.opacity = 1;
        }, 0);
    };

    game.events.begin = function () {
        gameOver.style.opacity = 0;
        setTimeout(function () {
            gameOver.style.display = 'none';
        }, 250);
    };


    gameOver_startButton.addEventListener('click', function () {
        hideElement(gameOver);
        hideElement(menu_menuButton);
        showElement(play_startButton);
        showElement(exit_exitButton);
        showElement(mode_modeButton);
    });


    play_startButton.addEventListener('click', function () {
        hideElement(play_startButton);
        hideElement(exit_exitButton);
        hideElement(mode_modeButton);
        showElement(menu_menuButton);

        game.newGame();
        game.play();
    });

    game.newGame();
});


function hideElement(button) {
    button.style.opacity = 0;
    button.style.display = 'none';
}

function showElement(button) {
    button.style.opacity = 1;
    button.style.display = 'flex';
}