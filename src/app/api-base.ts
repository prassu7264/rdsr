export class URL {

    static CURRENT_VERSION(): String {
        return "v1.0.1"
    }

    static RELEASE_DATE(): String {
        return "Saturday, 20 December 2025";
    }

    static AUTH_URL(): String {
        return 'http://192.168.1.105:8081/api/auth'; // local raj babu
        // return 'http://192.168.70.55:8282/dsr/api/auth'; //dsr
    }

    static BASE_URL(): String {
        return 'http://192.168.1.105:8081/api/v1';  // local raj babu
        // return 'http://192.168.70.55:8282/dsr/api/v1'; //dsr
    }

}