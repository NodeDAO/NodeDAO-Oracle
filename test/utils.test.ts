/**
 * desc:util test
 * @author renshiwei
 * Date: 2023/1/11 19:21
 **/
import {describe, test} from "@jest/globals"
import {splitIntoGroups} from "../src/lib/utils/array"

describe("array test", () => {
    const largeArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    test("splitIntoGroups test", () => {
        const smallArrays = splitIntoGroups(largeArray, 3);
        console.log(smallArrays);
    });
    
});
