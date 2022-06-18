import {defs, tiny} from '../examples/common.js';
// Pull these names into this module's scope for convenience:
const {
    Vector, Vector3, vec, vec3, vec4, color, Matrix, Mat4,
    Light, Shape, Material, Shader, Texture, Scene
} = tiny;

//export class Cylinder extends defs.Cylindrical_Tube {
export class Cylinder extends defs.Capped_Cylinder {
    // Is also an extension of Surface_Of_Revolution
    constructor() {
        const texture_range = [[0,2],[0,1]];
        //super(150, 150, points, texture_coord, 2*Math.PI - gap_size);
        //super(4, 4, texture_range);
        super(5, 10, texture_range);
    }

     
//     // From common js code
//     constructor(rows, columns, texture_range) {
//            super(rows, columns, [vec3(0, 0, .5), vec3(1, 0, .5), vec3(1, 0, -.5), vec3(0, 0, -.5)], texture_range)
//        }

//     // PLatform version 
//     constructor(gap_size) {
//         const texture_coord = [[0, 50], [0, 50]];
//         const points = [vec3(0, 0, .5), vec3(1, 0, .5), vec3(1, 0, -.5), vec3(0, 0, -.5)];
//         super(150,150, points, texture_coord, 2*Math.PI - gap_size);
//     }

//     // For commonjs code
//     constructor(rows, columns, points, texture_coord_range, total_curvature_angle = 2 * Math.PI) {
//             const row_operation = i => Grid_Patch.sample_array(points, i),
//                 column_operation = (j, p) => Mat4.rotation(total_curvature_angle / columns, 0, 0, 1).times(p.to4(1)).to3();

//             super(rows, columns, row_operation, column_operation, texture_coord_range);
}