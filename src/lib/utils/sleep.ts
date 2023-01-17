/**
 * desc: sleep
 * @author renshiwei
 * Date: 2023/1/17 18:36
 **/

export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
