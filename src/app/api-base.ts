export class URL {

    static CURRENT_VERSION(): String {
        return "v1.0.2"
    }

    static RELEASE_DATE(): String {
        return "Thursday, 25 December 2025";
    }

    static AUTH_URL(): String {
        // return 'http://192.168.1.105:8081/api/auth'; // local raj babu
        return 'http://dsr.ridsys.in:8282/dsr/api/auth'; //dsr
    }

    static BASE_URL(): String {
        // return 'http://192.168.1.105:8081/api/v1';  // local raj babu
        return 'http://dsr.ridsys.in:8282/dsr/api/v1'; //dsr
    }

}