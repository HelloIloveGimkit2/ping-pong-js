// global vars
var DIRECTION = {
  IDLE: 0,
  UP: 1,
  DOWN: 2,
  LEFT: 3,
  RIGHT: 4,
};

var rounds = [5, 5, 3, 3, 2];
var colors = ["#1abc9c", "#2ecc71", "#3498db", "#8c52ff", "#9b59b6"]; // Fixed spelling

// the ball object
var Ball = {
  new: function (incrementedSpeed) {
    return {
      width: 18,
      height: 18,
      x: this.canvas.width / 2 - 9,
      y: this.canvas.height / 2 - 9,
      moveX: DIRECTION.IDLE,
      moveY: DIRECTION.IDLE,
      speed: incrementedSpeed || 30,
    };
  },
};

// the ai object
var Ai = {
  new: function (side) {
    return {
      width: 18,
      height: 180,
      x: side === "left" ? 150 : this.canvas.width - 150,
      y: this.canvas.height / 2 - 35,
      score: 0,
      move: DIRECTION.IDLE,
      speed: 20,
    };
  },
};

var Game = {
  initialize: function () {
    this.canvas = document.querySelector("canvas");
    this.context = this.canvas.getContext("2d");

    this.canvas.width = 1400;
    this.canvas.height = 1000;

    this.canvas.style.width = this.canvas.width / 2 + "px";
    this.canvas.style.height = this.canvas.height / 2 + "px";

    this.player = Ai.new.call(this, "left");
    this.ai = Ai.new.call(this, "right");
    this.ball = Ball.new.call(this);

    this.ai.speed = 20;
    this.running = this.over = false;
    this.turn = this.ai;
    this.timer = this.round = 0;
    this.color = "#8c52ff";

    Pong.menu();
    Pong.listen();
  },

  endGameMenu: function (text) {
    Pong.context.font = "45px Courier New";
    Pong.context.fillStyle = this.color;

    Pong.context.fillRect(
      Pong.canvas.width / 2 - 350,
      Pong.canvas.height / 2 - 48,
      700,
      100
    );

    Pong.context.fillStyle = "#ffffff";

    // Draw the end game menu (gameover)
    Pong.context.fillText(
      text,
      Pong.canvas.width / 2,
      Pong.canvas.height / 2 + 15
    );

    setTimeout(function () {
      Pong = Object.assign({}, Game);
      Pong.initialize();
    }, 3000);
  },

  menu: function () {
    // Draw all of the pong objects in their state
    Pong.draw();

    this.context.font = "50px Courier New";
    this.context.fillStyle = this.color;

    // Draw the rectangle behind the 'press any key to begin' text.
    this.context.fillRect(
      this.canvas.width / 2 - 350,
      this.canvas.height / 2 - 48,
      700,
      100
    );

    this.context.fillStyle = "#ffffff";

    this.context.fillText(
      "Press any key to begin", // Fixed "being" to "begin"
      this.canvas.width / 2,
      this.canvas.height / 2 + 15
    );
  },

  update: function () {
    if (!this.over) {
      if (this.ball.x <= 0) Pong._resetTurn.call(this, this.ai, this.player);
      if (this.ball.x >= this.canvas.width - this.ball.width)
        Pong._resetTurn.call(this, this.player, this.ai);
      if (this.ball.y <= 0) this.ball.moveY = DIRECTION.DOWN;
      if (this.ball.y >= this.canvas.height - this.ball.height)
        this.ball.moveY = DIRECTION.UP;

      // Move player if their player.move value was updated by a key press
      if (this.player.move === DIRECTION.UP) this.player.y -= this.player.speed;
      else if (this.player.move === DIRECTION.DOWN)
        this.player.y += this.player.speed;

      if (Pong._turnDelayIsOver.call(this) && this.turn) {
        this.ball.moveX =
          this.turn === this.player ? DIRECTION.LEFT : DIRECTION.RIGHT;
        this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][
          Math.round(Math.random())
        ];
        this.ball.y =
          Math.floor(Math.random() * (this.canvas.height - 200)) + 200; // Fixed range
        this.turn = null;
      }

      // if the player collides with the bound limits update the x and y coords.
      if (this.player.y <= 0) this.player.y = 0;
      else if (this.player.y >= this.canvas.height - this.player.height)
        this.player.y = this.canvas.height - this.player.height; // Fixed bracket

      // Move ball in intended direction based on moveY and moveX value
      if (this.ball.moveY === DIRECTION.UP)
        this.ball.y -= this.ball.speed / 1.5;
      else if (this.ball.moveY === DIRECTION.DOWN)
        this.ball.y += this.ball.speed / 1.5;
      if (this.ball.moveX === DIRECTION.LEFT) this.ball.x -= this.ball.speed;
      else if (this.ball.moveX === DIRECTION.RIGHT)
        this.ball.x += this.ball.speed;

      // Handle the ai up and down movement
      if (this.ai.y > this.ball.y - this.ai.height / 2) {
        if (this.ball.moveX === DIRECTION.RIGHT)
          this.ai.y -= this.ai.speed / 1.5;
        else this.ai.y -= this.ai.speed / 4;
      }
      if (this.ai.y < this.ball.y - this.ai.height / 2) {
        if (this.ball.moveX === DIRECTION.RIGHT)
          this.ai.y += this.ai.speed / 1.5;
        else this.ai.y += this.ai.speed / 4;
      }

      // Handle ai (AI) wall collision
      if (this.ai.y >= this.canvas.height - this.ai.height)
        this.ai.y = this.canvas.height - this.ai.height; // Fixed syntax
      else if (this.ai.y <= 0) this.ai.y = 0;

      // Handle Player-Ball collisions
      if (
        this.ball.x - this.ball.width <= this.player.x &&
        this.ball.x >= this.player.x
      ) {
        // Fixed width comparison
        if (
          this.ball.y <= this.player.y + this.player.height &&
          this.ball.y + this.ball.height >= this.player.y
        ) {
          this.ball.x = this.player.x + this.ball.width;
          this.ball.moveX = DIRECTION.RIGHT;
        }
      }

      // Handle ai-ball collision
      if (
        this.ball.x - this.ball.width <= this.ai.x &&
        this.ball.x >= this.ai.x
      ) {
        if (
          this.ball.y <= this.ai.y + this.ai.height &&
          this.ball.y + this.ball.height >= this.ai.y
        ) {
          this.ball.x = this.ai.x - this.ball.width;
          this.ball.moveX = DIRECTION.LEFT;
        }
      }

      // Handle the end of the round
      if (this.player.score === rounds[this.round]) {
        if (!rounds[this.round + 1]) {
          this.over = true;
          setTimeout(function () {
            Pong.endGameMenu("Winner!");
          }, 1000);
        } else {
          this.color = this._generateRoundColor();
          this.player.score = this.ai.score = 0;
          this.player.speed += 0.5;
          this.ai.speed += 1;
          this.ball.speed += 1;
          this.round += 1;
        }
      }
      // check to see if the ai/Ai has won the round.
      else if (this.ai.score === rounds[this.round]) {
        this.over = true;
        setTimeout(function () {
          Pong.endGameMenu("Game Over!");
        }, 1000);
      }
    }
  },

  draw: function () {
    // Fixed syntax
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // set the fill style to black
    this.context.fillStyle = this.color;

    // draw the background
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // set the fill style to white
    this.context.fillStyle = "#ffffff";

    // draw the player
    this.context.fillRect(
      // Fixed method
      this.player.x,
      this.player.y,
      this.player.width,
      this.player.height
    );

    // Draw the ai
    this.context.fillRect(this.ai.x, this.ai.y, this.ai.width, this.ai.height);

    // draw the ball
    if (Pong._turnDelayIsOver.call(this))
      // Fixed syntax
      this.context.fillRect(
        this.ball.x,
        this.ball.y,
        this.ball.width,
        this.ball.height
      );

    // draw the new line in the middle
    this.context.beginPath(); // Fixed method
    this.context.setLineDash([7, 15]);
    this.context.moveTo(this.canvas.width / 2, 0); // Fixed syntax
    this.context.lineTo(this.canvas.width / 2, this.canvas.height);
    this.context.lineWidth = 10;
    this.context.strokeStyle = "#ffffff";
    this.context.stroke();

    this.context.font = "100px Courier New";
    this.context.textAlign = "center";

    this.context.fillText(
      this.player.score.toString(),
      this.canvas.width / 2 - 300,
      200
    );

    this.context.fillText(
      this.ai.score.toString(),
      this.canvas.width / 2 + 300,
      200
    );

    this.context.font = "30px Courier New";

    this.context.fillText(
      "Round " + (this.round + 1), // Fixed this.round to this.round
      this.canvas.width / 2,
      35
    );

    this.context.font = "40px Courier";

    this.context.fillText(
      rounds[this.round] ? rounds[this.round] : rounds[this.round - 1],
      this.canvas.width / 2,
      100
    );
  },

  loop: function () {
    // Fixed function declaration
    Pong.update();
    Pong.draw();

    if (!Pong.over) requestAnimationFrame(Pong.loop);
  },

  listen: function () {
    document.addEventListener("keydown", function (key) {
      if (Pong.running === false) {
        Pong.running = true;
        window.requestAnimationFrame(Pong.loop);
      }

      if (key.keyCode === 38 || key.keyCode === 87)
        Pong.player.move = DIRECTION.UP;
      if (key.keyCode === 40 || key.keyCode === 83)
        Pong.player.move = DIRECTION.DOWN;
    });

    document.addEventListener("keyup", function (key) {
      Pong.player.move = DIRECTION.IDLE;
    }); // Fixed function spelling
  },

  _resetTurn: function (victor, loser) {
    this.ball = Ball.new.call(this, this.ball.speed);
    this.turn = loser;
    this.timer = new Date().getTime();

    victor.score++;
  },

  _turnDelayIsOver: function () {
    // Fixed function spelling
    return new Date().getTime() - this.timer >= 1000;
  },

  _generateRoundColor: function () {
    var newColor = colors[Math.floor(Math.random() * colors.length)]; // Fixed variable name
    if (newColor === this.color) return Pong._generateRoundColor();
    return newColor;
  },
};

var Pong = Object.assign({}, Game);
Pong.initialize();
