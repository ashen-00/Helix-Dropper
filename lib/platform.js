import {defs, tiny} from '../examples/common.js';
import {split_range_into_intervals, random_number} from './helper.js';
// Pull these names into this module's scope for convenience:
const {
    Vector, Vector3, vec, vec3, vec4, color, Matrix, Mat4,
    Light, Shape, Material, Shader, Texture, Scene
} = tiny;

export class Slice extends Shape {
    // NOTE: angle is in radians
    constructor(angle) {
        super("position", "normal", "texture_coord");

        // draw top and bottom of slice
        const texture_coord = [[0, 50], [0, 50]];
        const points = [vec3(0, 0, .5), vec3(1, 0, .5), vec3(1, 0, -.5), vec3(0, 0, -.5)]
        const rows = 75;
        const columns = 75;
        defs.Surface_Of_Revolution.insert_transformed_copy_into(this, [rows, columns, points, texture_coord, angle]);

        // draw slides of slice
        defs.Square.insert_transformed_copy_into(this, [], 
            Mat4.translation(0.5, 0, 0).times(
            Mat4.scale(0.5, 1, 0.5)).times(
            Mat4.rotation(Math.PI/2, 1, 0, 0)));

        defs.Square.insert_transformed_copy_into(this, [], 
            Mat4.rotation(angle, 0, 0, 1).times(
            Mat4.translation(0.5, 0, 0)).times(
            Mat4.scale(0.5, 1, 0.5)).times(
            Mat4.rotation(Math.PI/2, 1, 0, 0)));
    }
}

export function create_platform(radius, height, y_coord, slice_shapes, difficulty) {
    /*
    Returns a dictionary representing one platform .
    Each platform consists of multiple "slices".
    Slices can be either good (bounce) or bad (game over).
    The returned dictionary will have the following format:

    This function returns:
    {
        slices: an array of each slice in the platform
        gap_angle: start, end angle of gap BEFORE platform is randomly rotated
        random_rotation: platform is randomly rotated CW this much
        y: y coordinate of the platform
    }


    Each slice has:
    {
        isGood: whether is a good slice or bad slice of the platform
        shape: contains the shape to be drawn for this slice (Slice() object)
        transform: contains the slice's transform
    }
    */

    let slices = []
    let gap_max = Math.PI*4/3;
    let gap_min = Math.PI/5;
    let max_platform_size = 2*Math.PI - random_number(gap_min, gap_max);

    // randomly rotate platform between 1 and 2pi to randomize gap
    const random_rotation = Math.random()*2*Math.PI;

    // this transform is applied to all slices in the platform
    let transform = Mat4.identity().times(
        Mat4.translation(0, y_coord, 0)).times(
        Mat4.rotation(-random_rotation, 0, 1, 0)).times(
        Mat4.scale(radius, height, radius)).times(
        Mat4.rotation(-Math.PI/2, 0, 1, 0)).times(
        Mat4.rotation(Math.PI/2, 1, 0, 0)
    );

    // randomly split platform into good and bad slices
    let angles = split_range_into_intervals(0, max_platform_size, slice_shapes);
    for (let i=0; i<angles.length; i++) {
        let isGood = Math.random() > difficulty;
        let size = Math.round((angles[i][1] - angles[i][0]) * 10) / 10;

        // extract the pre-defined shape for the given slice size
        let shape = null;
        if      (size == 0.5) { shape = slice_shapes[0].shape; }
        else if (size == 0.8) { shape = slice_shapes[1].shape; }
        else if (size == 1.0) { shape = slice_shapes[2].shape; }
        else if (size == 1.3) { shape = slice_shapes[3].shape; }
        else if (size == 1.5) { shape = slice_shapes[4].shape; }
        else                  { console.log('ERROR CREATING SLICES!!!'); }

        slices.push({
            isGood,
            shape: shape,
            start_angle: angles[i][0],
            end_angle: angles[i][1],
            transform: Mat4.rotation(-angles[i][0], 0, 1, 0).times(transform),
        });
    }

    let platform_size = angles.slice(-1)[0][1];
    let gap_angle = [platform_size, 2*Math.PI]; //gap is from the end of the last slice to 2pi

    return {
        slices,
        gap_angle,          // [start, end] angle of gap BEFORE platform is randomly rotated
        random_rotation,    // platform is randomly rotated this much when drawn
        y: y_coord,         //height
        time_done: null,    // set to time when player falls through it
        powerup: null       // set to powerup dict if the platform has a powerup
    }
}

