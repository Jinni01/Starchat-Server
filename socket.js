const connection = require("./db/db_connection");

module.exports = (io) => {
    var online_users = [];
    var socket_ids = [];

    io.sockets.on("connection", (socket) => {
        //socket_ids['guest1'] = 1;
        console.log("유저 접속");

        socket.on("online", (data) => {
            console.log("온라인 연결 시도");
            console.log(data);
            console.log(data.email);

            connection.query("select email, nickname, sex, age, region, introduce, profile from user where email=?", [data.email], (err, result, fields) => {
                online_users.push(result[0]);
                console.log(online_users);
            });
        });

        socket.on("reqOnlineUser", ()=> {
            console.log("유저 정보 요청받음");
            
            socket.emit("resOnlineUser", online_users);
        });

        socket.on("disconnect", () => {
            console.log("접속 종료");
        });
    });
};