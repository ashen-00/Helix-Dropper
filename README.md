# Helix

## Project Introduction

Helix Dropper is an endless dropper game, inspired by the iPhone game Helix Jump. The goal is to guide a bouncing ball down through a series of circular platforms, scoring points for each layer that it drops through. As the ball bounces down to lower layers, the camera will follow it to keep the ball centered. The player attempts to guide the ball through the gaps on each level by rotating the platforms with the `v` and `b` keys. To avoid losing a life on an opposite color platform, the player can navigate around it by rotating the platforms, or change the color of the ball with the `c` key.

### 1. Starting the game

![Starting screen](assets/startscreen.gif)
Press `Shift` to start the game. Once the player starts the game, they will have 3 seconds to prepare before the ball starts falling. Once the ball starts falling, they can interact with the game using the following controls:

| Control | Description                        |
| ------- | ---------------------------------- |
| v       | Rotate platforms clockwise         |
| b       | Rotate platforms counter-clockwise |
| c       | Change color of the ball           |
| Shift   | Start Game                         |

Each platform they successfully drop through will give 1 point. The points are tracked in a scoreboard on the upper left corner.

### 2. End game

![Game Over](assets/gameover.gif)
The game ends when the ball collides with a platform of a different color. If it collides with a platform of the same color, it will instead bounce. Upon game over, the game will remember the score and display the high score of the current play session. At this point, the player can try again if they wish. 

### 3. Powerups

![Starting screen](assets/powerup.gif)
Sometimes during the game, a yellow cube will spawn. This powerup grants the player an extra life. The scoreboard in the upper left corner tells the player how many extra lives they have. An example of a powerup is displayed in the gif above.

## Advanced features

### 1. Collision Detection

Helix Dropper uses a dynamically sized list to keep track of the y-coordinates of each layer of platforms and the angle of both the powerups and the platforms. For each frame, we check if the y-coordinates and angle of the ball overlap any given powerup or platform. If the ball collides with a powerup, we delete the powerup and increment the lives in the scoreboard by 1. If the ball collides with a platform, we check if the color of the ball matches the color of the platform and either bounce, or lose a life/game over. 

### 2. Physics Simulation

The ball follows a basic physics simulation. It experiences a constant downward acceleration to model gravity, and changes the its velocity accordingly. When it impacts a platform of the same color, we model a "bounce" by flipping the ball's velocity to point upwards, and begin a squish animation via a matrix transformation that models a sinusoidal function. 
