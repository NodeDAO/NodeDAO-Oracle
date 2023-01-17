/**
 * desc: Generic contract exception encapsulation
 * @author renshiwei
 * Date: 2023/1/17 19:30
 **/
class ContractException extends ServiceException {

    constructor(code: string, msg: string) {
        super(code, msg);
        this.name = "ServiceError";
    }

}
