/**
 * desc: Generic service exception encapsulation
 * @author renshiwei
 * Date: 2023/1/17 19:30
 **/
class ServiceException extends Error {
    code: string;

    constructor(code: string, msg: string) {
        super(msg);
        this.name = "ServiceException";
        this.code = code;
    }

}
