/**
 * desc: array util
 * @author renshiwei
 * Date: 2023/1/11 19:18
 **/

/**
 * Split an array into multiple arrays and place them in a two-dimensional array
 * @param arr Primitive array
 * @param {number} groupSize Grouping reference
 * @returns A grouped two-dimensional array
 */
export function splitIntoGroups<T>(arr: T[], groupSize: number): T[][] {
    let result: T[][] = [];
    for (let i = 0; i < arr.length; i += groupSize) {
        result.push(arr.slice(i, i + groupSize));
    }
    return result;
}
