/**
 * Linear Interpolation
 * @param min number to start
 * @param max number to end
 * @param a ratio
 * @example lerp(20, 60, .5)) = 40
 * @example lerp(-20, 60, .5)) = 20
 * @example lerp(20, 60, .75)) = 50
 * @example lerp(-20, -10, .1)) = -.19
 */
export function lerp(min: number, max: number, a: number): number {
	return (1 - a) * min + a * max;
}
