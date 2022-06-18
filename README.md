# Helix

## Group Members

- Matthew Wang (504984273)
- Nicholas Cerdan (904906315)
- Alexandria Shen (605018233)

## Project Introduction

Helix Dropper is an endless dropper game, inspired by the iPhone game Helix Jump. The goal is to guide a bouncing ball down through a series of circular platforms, scoring points for each layer that it drops through. As the ball bounces down to lower layers, the camera will follow it to keep the ball centered. The user attempts to guide the ball through the gaps on each level by rotating the platforms with the `v` and `b` keys.

### 1. Starting the game

![Starting screen](assets/startscreen.gif)
Press `Shift` to start the game. Once you start the game, you will have 3 seconds to get ready before the ball starts falling. Once the ball starts falling, you can interact with the game with the following controls:

| Control | Description                        |
| ------- | ---------------------------------- |
| v       | Rotate platforms clockwise         |
| b       | Rotate platforms counter-clockwise |
| c       | Change color of the ball           |
| Shift   | Start Game                         |

Each platform you successfully drop through will give you 1 point. The points are tracked in a scoreboard on the upper left corner.

### 2. End game

![Game Over](assets/gameover.gif)
The game ends when your ball collides with a platform of a different color. If it collides with a platform of the same color, it will just bounce. Once the game ends, the game will keep track of your high score and you will be able to try again from the beginning if you wish.

Users may also change the color of the ball with the `c` key.

### 3. Powerups

![Starting screen](assets/powerup.gif)
Sometimes during the game, you will see yellow cube powerups that will grant you an extra life. The scoreboard in the upper left corner tells you how many extra lives you have. An example of a powerup is displayed in the gif above.

## Advanced features

### 1. Collision Detection

We implemented collision detection to detect when the ball collided with the platforms and the powerups.

To do this, we kept track of both the powerup angles and platform gap angles and checked to see if the ball's current angle collided with the angles of the gaps and/or the powerups. We also kept track of the y-coordinate of the platforms and powerups to know when the ball was at the same height.

### 2. Physics Simulation

We also simulated basics physics movement for our ball. We created a constant downward acceleration for the ball to model gravity, and changed the ball's velocity accordingly. We also modeled real world "bouncing" by flipping the ball's velocity in the other direction after hitting a platform.

## How does our game differ from the iOS game?

- Our game has powerups that grant you extra lives
- You can change the color of the ball as you move

## References

- Scoreboard: https://webglfundamentals.org/webgl/lessons/webgl-text-html.html
- Tinygraphics: https://github.com/encyclopedia-of-code/tiny-graphics-js
- Other smaller references (snippets from stack overflow, etc) are cited as comments in our code
