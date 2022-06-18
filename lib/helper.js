// random helper functions

export function split_range_into_intervals(start, end, slice_shapes) {
    // randomly splits [start, start+1, ... end-1, end] into intervals
    // ie. split_range_into_intervals(1,6,2) could return [[1,3],[3,6]] or even [[1,6]]
    //
    // NOTE: All intervals will meet the following condition:
    //          min <= interval_end - interval start < max;

    // This is used to generate good and bad platforms for our game!

    let intervals = [];

    let i = start;
    while (true) {
        let rand = Math.round(random_number(0, slice_shapes.length-1));
        let interval_size = slice_shapes[rand].size;
        let no_space_left_for_another_interval = i + interval_size > end;
        if (no_space_left_for_another_interval) {
            break;
        }

        intervals.push([i, i+interval_size]);
        i += interval_size;
    }
    return intervals;
}

// src: https://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript
export function random_number(min, max) {
    return Math.random() * (max - min) + min;
  }

export function rad_to_angle(rad) {
    return rad*180/Math.PI;
}

// checks if ball collides with platform
export function collides(ball, platform, user_rot) {
    // extract vars
    let gap_angle = platform.gap_angle;
    let rand_rot = platform.random_rotation;

    // compute normalized angle values
    let adjusted_gap_angle = [gap_angle[0] + rand_rot - user_rot, gap_angle[1] + rand_rot - user_rot];
    while (adjusted_gap_angle[0] < 0) {
        adjusted_gap_angle[0] = adjusted_gap_angle[0] + 2*Math.PI;
    }
    while (adjusted_gap_angle[1] < 0) {
        adjusted_gap_angle[1] = adjusted_gap_angle[1] + 2*Math.PI;
    }
    adjusted_gap_angle[0] = adjusted_gap_angle[0] % (2*Math.PI);
    adjusted_gap_angle[1] = adjusted_gap_angle[1] % (2*Math.PI);

    if (adjusted_gap_angle[0] < adjusted_gap_angle[1]) {
        // gap doesn't cross angle=0 mark, so platform will
        return true;
    } else {
        // inverted case of when ball goes through gap
        let delta = ball.radius - 0.4;
        return !(adjusted_gap_angle[0] < (2*Math.PI - delta) && adjusted_gap_angle[1] > delta);
    }
}

// checks if slice is good or bad (assumes user has collided)
export function sliceIsGood(ball, platform, user_rot) {
    for (var i = 0; i < platform.slices.length; i = i + 1) {
        let slice = platform.slices[i];

        // compute normalized start and end angles for the slice
        let start_angle = slice.start_angle + platform.random_rotation - user_rot;
        let end_angle   = slice.end_angle   + platform.random_rotation - user_rot;
        while (start_angle < 0) {
            start_angle = start_angle + 2*Math.PI;
        }
        while (end_angle < 0) {
            end_angle = end_angle + 2*Math.PI;
        }
        start_angle = start_angle % (2*Math.PI);
        end_angle   = end_angle   % (2*Math.PI);

        // if this is the slice we hit, check its info
        let delta = ball.radius - 0.4;
        if (start_angle > end_angle || start_angle < delta || end_angle > (2*Math.PI - delta)) {
            if(ball.color_index == 0) {
                return slice.isGood;
            }
            else return !slice.isGood
        }
    }

    // should never happen, just here for safety
    return true;
}
