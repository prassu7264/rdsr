export class URL {

    static CURRENT_VERSION(): String {
        return "v1.0.0"
    }

    static RELEASE_DATE(): String {
        return "Monday, 18 August 2025";
    }

    static WEB_URL(): String {
        return "http://192.168.1.235";
        // return "https://ds.iqtv.in";
    }
    static AUTH_URL(): String {
        return 'http://192.168.1.105:8081/api/auth';
        // return 'https://ds.iqtv.in:8080/iqworld/api/auth';
    }

    static BASE_URL(): String {
        return 'http://192.168.1.105:8081/api/v1';
        // return 'https://ds.iqtv.in:8080/iqworld';
    }

}