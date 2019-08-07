module.exports = (() => {
    return {
        local: { //로컬호스트
            host: "localhost",
            port: "3306",
            user: "root",
            password: "1234",
            database: "ranchat",
        },
        service: { //서비스
            host: "",
            port: "",
            user: "",
            password: "",
            database: "",
        }
    }
})();