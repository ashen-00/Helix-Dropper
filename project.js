import {defs, tiny} from './examples/common.js';
import {create_platform, Slice} from "./lib/platform.js";
import {Cylinder} from "./lib/cylinder.js";
import {colors} from "./lib/colors.js";
import {collides, rad_to_angle, random_number, sliceIsGood} from "./lib/helper.js";
const {Triangle, Square, Tetrahedron, Windmill, Cube, Subdivision_Sphere} = defs;

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

export class Project extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        // Pre-declares Slice shapes so we don't overload GPU and lag/crash
        this.slice_shapes = [
            {
                size: 0.5,
                shape: new Slice(0.5),
            },
            {
                size: 0.8,
                shape: new Slice(0.8),
            },
            {
                size: 1.0,
                shape: new Slice(1.0),
            },
            {
                size: 1.3,
                shape: new Slice(1.3),
            },
            {
                size: 1.5,
                shape: new Slice(1.5),
            }
        ]

        // Define Ball data
        this.ball = {
            shape: new defs.Subdivision_Sphere(4),
            material: new Material(new defs.Phong_Shader(), {
                color: colors.ballBlue,
                ambient: 0.7,
                diffusivity: 0.8,
                specularity: 0.8
            }),
            radius: 0.5,
            y_position: 5,
            z_position: 7,
            velocity: 0,
            bounce_velocity: 0.3,
            acceleration: -0.01,
            x_squish: 1,
            y_squish: 1,
            color_index: 0
        }

        this.platform = {
            good_material: new Material(new defs.Phong_Shader(), {
                color: colors.goodPlatform,
                ambient: 0.5,
                diffusivity: 0.8,
                specularity: 1,
            }),
            bad_material: new Material(new defs.Phong_Shader(), {
                color: colors.badPlatform,
                ambient: 0.5,
                diffusivity: 0.8,
                specularity: 1,
            }),
            radius: 7,
            height: 1.5,      // thickness
            num: 5,          // number of platforms to start w along y axis
            space_between: 9, // space between each consecutive platform on the y axis
        }

        this.powerup = {
            shape: new defs.Cube(),
            material: new Material(new defs.Phong_Shader(), {
                color: colors.slomoPowerup,
                ambient: 0.5,
                diffusivity: 0.8,
                specularity: 0.8
            }),
            side_length: 0.4,
            frequency: 5
        }

        this.skybox = {
            shape: new Subdivision_Sphere(4),
            material: new Material(new defs.Textured_Phong(), {
                ambient: 1,
                diffusivity: 0.1,
                specularity: 0.2,
                texture: new Texture("assets/blue_black_square.png"),
                color: hex_color("#000000")
            }),
        }

        // increasing this will make the platforms spin faster
        this.rotation_sensitivity = 0.05;

        // Define cylinder data
        this.cylinder = {
            shape: new Cylinder(),
            material: new Material( new defs.Phong_Shader(), {
                color: colors.cylinderGray,
                ambient: 0.5,
            }),
            radius: 2,
        }

        this.initial_camera_location = Mat4.look_at(vec3(0, 7, 20), vec3(0, 0, 0), vec3(0, 1, 0));

        this.score = 0;
        this.high_score = 0;

        // Setup HTML Scoreboard
        this.scoreElement     = document.querySelector("#score");
        this.highScoreElement = document.querySelector("#high-score");
        this.livesElement     = document.querySelector("#lives");
        this.scoreNode     = document.createTextNode("");
        this.highScoreNode = document.createTextNode("");
        this.livesNode     = document.createTextNode("");
        this.scoreElement.appendChild(this.scoreNode);
        this.highScoreElement.appendChild(this.highScoreNode);

        // Setup starting message
        this.startMessage = document.querySelector("#startmessage");
        this.startTimerLength = 3; //start timer starts at 3 seconds

        // Setup countdown timer
        this.countdownElement = document.querySelector("#countdown");
        this.countdownNode = document.createTextNode("");
        this.countdownElement.appendChild(this.countdownNode)
        this.countdown = false;
        this.currentCountdown = 0;

        // Smooth movement
        this.control = {
            cw: false,
            ccw: false
        };

        // reset game state
        this.reset_game();
        this.livesElement.appendChild(this.livesNode);
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("Rotate CW", ["v"],
            () => this.control.cw = true, '#6E6460',
            () => this.control.cw = false);
        this.key_triggered_button("Rotate CCW", ["b"],
            () => this.control.ccw = true, '#6E6460',
            () => this.control.ccw = false);
        this.key_triggered_button("Change ball color", ["c"], () => this.ball.color_index ^= 1);
        this.key_triggered_button("Start game", ["Shift"], () => {
            this.startMessage.style.visibility = "hidden";
            this.countdown = true;
            this.currentCountdown = this.startTimerLength;
        });
    }

    display(context, program_state) {
        // display():  Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.initial_camera_location);
        }

        if (this.ball_transform != null) {
            let desired_eye = vec3(0, this.ball.y_position,   this.ball.z_position + 30);
            let desired_at  = vec3(0, this.ball.y_position-5, this.ball.z_position);
            let desired_up  = vec3(0, 1, 0);
            let desired = Mat4.look_at(desired_eye, desired_at, desired_up);

            // sweep camera up to ball if starting new game
            if (this.starting) {
                desired = desired.map((x, i) => Vector.from(program_state.camera_inverse[i]).mix(x, 0.1));
            }

            program_state.set_camera(desired);
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);

        // Lighting
        program_state.lights = [new Light(vec4(0, 15 + this.ball.y_position, 5, 1), color(1, 1, 1, 1), 1000)];

        // matrix operations and drawing code to draw the solar system scene
        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        this.t = t;
        let model_transform = Mat4.identity();

        // update this.rotate
        this.update_rotate();

        // give user a countdown before starting game
        if (this.countdown) {
            this.currentCountdown -= dt;
            this.countdownNode.nodeValue = Math.ceil(this.currentCountdown);
            if (this.currentCountdown <= 0) {
                this.starting = false;
                this.countdown = false;
                this.countdownNode.nodeValue = "";
            }
        }

        // Ball Physics Logic
        if (!this.starting) {
            this.ball.velocity += this.ball.acceleration;
            this.ball.y_position += this.ball.velocity;
        }

        // Collision Detection
        let ball_bot_y = this.ball.y_position - this.ball.radius;
        let top_platform = this.platform_info[0];
        let top_platform_top_y = top_platform.y + this.platform.height/2;
        const eps = 0.001;
        if (ball_bot_y - top_platform_top_y <= eps) {
            // if ball is hitting/passing top platform

            // check if player hit a powerup. increment lives if it did
            let powerup = top_platform.powerup
            if (powerup != null && !powerup.collected) {
                let powerup_angle = -(powerup.angle + this.rotate);
                while (powerup_angle < 0) { powerup_angle += 2*Math.PI; }
                powerup_angle = powerup_angle % (2*Math.PI);

                let delta = 0.12;
                if (powerup_angle < delta || 2*Math.PI-powerup_angle < delta) {
                    top_platform.powerup = null;
                    this.lives += 1;
                }
            }

            // check if player collided with the platform
            if (collides(this.ball, top_platform, this.rotate)) {
                // if it collides, check the slice

                if (sliceIsGood(this.ball, top_platform, this.rotate)) {
                    // bounce
                    this.bounce(top_platform_top_y + this.ball.radius);
                } else {
                    // this prevents multiple deaths being registered
                    if (this.t - this.last_lost_life_time > 0.3) {
                        this.lives -= 1;
                        this.last_lost_life_time = this.t;
                    }

                    if (this.lives == 0) {
                        // end game if out of lives
                        this.reset_game();
                    } else {
                        // just bounce if still alive
                        this.bounce(top_platform_top_y + this.ball.radius);
                    }
                }
            } else {
                // otherwise, fall through and increment score
                this.score += 1;

                // update platform data structure
                this.add_platform();
                top_platform.time_done = this.t;
                this.remove_platform();
            }
        }

        // Draw the Ball
        this.update_squish();
        this.ball_transform = model_transform.times(
                                Mat4.translation(0, this.ball.y_position, this.ball.z_position)).times(
                                Mat4.scale(this.ball.x_squish, this.ball.y_squish, 1)).times(
                                Mat4.scale(this.ball.radius, this.ball.radius, this.ball.radius));
        if(this.ball.color_index == 0){
            this.ball.shape.draw(context, program_state, this.ball_transform, this.ball.material);
        }
        else {
            this.ball.shape.draw(context, program_state, this.ball_transform, this.ball.material.override({color: colors.ballPink}));
        }

        // Draw Platforms
        for(let i=0; i<this.platform_info.length; i++) {
            let platform = this.platform_info[i];

            // draw each slice in platform
            for(let j=0; j<platform.slices.length; j++) {
                let slice = platform.slices[j];
                let rotated_slice_transform = Mat4.rotation(this.rotate, 0, 1, 0).times(slice.transform);
                if (slice.isGood) {
                    slice.shape.draw(context, program_state, rotated_slice_transform, this.platform.good_material);
                } else {
                    slice.shape.draw(context, program_state, rotated_slice_transform, this.platform.bad_material);
                }
            }

            // potentially draw powerup on platform
            let powerup = platform.powerup;
            if (powerup != null) {
                let powerup_transform = Mat4.rotation(powerup.angle + this.rotate, 0, 1, 0).times(
                    Mat4.translation(0, powerup.y + this.platform.height + 0.4, this.ball.z_position-1)).times(
                    Mat4.scale(this.powerup.side_length, this.powerup.side_length, this.powerup.side_length)).times(
                    Mat4.scale(this.powerup_pulse(), this.powerup_pulse(), this.powerup_pulse())).times(
                    Mat4.rotation(powerup.rotation + this.powerup_rotation(), 0, 1, 0));

                this.powerup.shape.draw(context, program_state, powerup_transform, this.powerup.material);
            }
        }

        // Draw Done Platforms
        for (let i = 0; i < this.done_platforms.length; i++) {
            let platform = this.done_platforms[i];

            // draw each slice in done platform
            for (let j = 0; j < platform.slices.length; j++) {
                let slice = platform.slices[j];
                let rotated_slice_transform = Mat4.translation(0, this.calculate_done_delta(platform.time_done), 0).times(
                    Mat4.rotation(this.rotate, 0, 1, 0)).times(slice.transform);
                if (slice.isGood) {
                    slice.shape.draw(context, program_state, rotated_slice_transform, this.platform.good_material);
                } else {
                    slice.shape.draw(context, program_state, rotated_slice_transform, this.platform.bad_material);
                }
            }

            // potentially draw powerup on platform
            let powerup = platform.powerup;
            if (powerup != null) {
                let powerup_transform = Mat4.rotation(powerup.angle + this.rotate, 0, 1, 0).times(
                    Mat4.translation(0, powerup.y + this.platform.height + 0.4 + this.calculate_done_delta(platform.time_done), this.ball.z_position-1)).times(
                    Mat4.scale(this.powerup.side_length, this.powerup.side_length, this.powerup.side_length)).times(
                    Mat4.scale(this.powerup_pulse(), this.powerup_pulse(), this.powerup_pulse())).times(
                    Mat4.rotation(powerup.rotation + this.powerup_rotation(), 0, 1, 0));

                this.powerup.shape.draw(context, program_state, powerup_transform, this.powerup.material);
            }
        }

        // Draw the center cylinder
        model_transform = Mat4.identity();
        let cylinder_transform = model_transform.times(
                                Mat4.rotation(Math.PI, 1, 1, 0)).times(
                                Mat4.rotation(Math.PI / 2, 0, 1, 0)).times(
                                Mat4.translation(0, 0, this.ball.y_position - 30)).times(
                                Mat4.scale(2.4, 2.4, 150));
        this.cylinder.shape.draw(context, program_state, cylinder_transform, this.cylinder.material);

        // Draw skybox
        model_transform = Mat4.identity();
        let skybox_transform = model_transform.times(
                                Mat4.translation(0, this.ball.y_position, 0)).times(
                                Mat4.scale(50, 50, 50));
        this.skybox.shape.draw(context, program_state, skybox_transform, this.skybox.material);

        // Set Scoreboard Values
        this.scoreNode.nodeValue     = this.score;
        this.highScoreNode.nodeValue = this.high_score;
        this.livesNode.nodeValue     = this.lives;
    }

    // *** Helper Functions
    create_platform_info(num_platforms) {
        let platform_info = []
        for (let i=0; i<num_platforms; i++) {
            platform_info.push(create_platform(this.platform.radius, this.platform.height, -i*this.platform.space_between, this.slice_shapes, 0.2));
        }
        return platform_info;
    }

    // bounce the ball
    bounce(ball_new_y) {
        this.ball.y_position = ball_new_y;
        this.ball.velocity = this.ball.bounce_velocity;
        this.squish_start = this.t;
    }

    // calculates new this.rotate
    update_rotate(){
        if(this.control.cw) {
            this.rotate = (this.rotate - this.rotation_sensitivity)%(Math.PI*2)
        }
        if(this.control.ccw) {
            this.rotate = (this.rotate + this.rotation_sensitivity)%(Math.PI*2)
        }
    }

    // calculates ball squishing
    update_squish() {
        const A = 0.3;
        const b = 0.7;
        const w = 8;
        const threshhold = 0.2;
        let tdelta = this.t - this.squish_start;

        if (tdelta < threshhold) {
            this.ball.y_squish = A * Math.sin(w * tdelta) + b;
            this.ball.x_squish = 2 - (A * Math.sin(w * tdelta) + b);
        } else {
            this.ball.y_squish = 1;
            this.ball.x_squish = 1;
        }
    }

    // calculates rotation value of powerups
    powerup_rotation() { return this.t % (2*Math.PI); }

    // caculates pulsing of powerups
    powerup_pulse() {
        const A = 0.2;
        const b = 0.8;
        const T = 1;
        const w = 2*Math.PI/T;
        return A * Math.sin(this.t * w) + b;;
    }

    // calculates done objects moving up displacement once done
    calculate_done_delta(time_done) {
        const threshhold = 4;
        const m = 10;
        let tdelta = this.t - time_done;

        if (tdelta < threshhold) {
            return tdelta * m;
        } else {
            this.done_platforms.shift();
            return 20;
        }
    }

    reset_game() {
        // reset vars
        this.ball.y_position = 11;
        this.ball.velocity = 0;
        this.high_score = Math.max(this.score, this.high_score);
        this.score = 0;
        this.rotate = 0; // keeps track of user rotation input with left/right arrow keys
        this.starting = true;
        this.lives = 1;
        this.last_lost_life_time = 0;

        // generate new platforms
        this.platform_info = [];
        this.platform_info = this.create_platform_info(this.platform.num);
        this.done_platforms = [];

        // display start message
        this.startMessage.style.visibility = "visible";
    }

    add_platform() {
        let difficulty = Math.min(0.2 + 0.05 * Math.floor(this.score / 4), 0.5);
        this.platform_info.push(create_platform(this.platform.radius, this.platform.height, -(this.platform.num - 1 + this.score)*this.platform.space_between, this.slice_shapes, difficulty));

        // potentially add powerup on this platform
        if (this.score % this.powerup.frequency == 0) {
            this.platform_info[this.platform_info.length-1].powerup = {
                y: this.platform_info[this.platform_info.length-1].y,
                angle: random_number(0, 2*Math.PI),
                rotation: random_number(0, 2*Math.PI)
            };
        }
    }

    remove_platform() {
        this.done_platforms.push(this.platform_info.shift());
    }
}
