const connection = require("./db/db_connection");

module.exports = (io) => {
    var online_users = [];
    var socket_ids = [];
    var room_id;

    io.sockets.on("connection", (socket) => {
        console.log("소켓 : 유저 접속");

        socket.on("reqOnline", (data) => {
            console.log("소켓 : 온라인 연결 시도");
            console.log(data);

            connection.query("select email, id, nickname, sex, age, region, introduce, profile from user where email=?", [data.email], (err, result, fields) => {
                if (err) {
                    console.log(err);
                }
                if (result && result.length != null) {
                    online_users.push(result[0]);
                    console.log(online_users);

                    socket_ids[data.email] = socket.id;
                    console.log(socket_ids);

                    userName = result[0].nickname;

                    socket.emit("resOnline", ({
                        success: true,
                        message: "접속 성공"
                    }));
                }
            });
        });

        socket.on("reqOnlineUser", () => {
            console.log("소켓 : 온라인 유저 정보 요청받음");

            socket.emit("resOnlineUser", online_users);
        });

        socket.on("reqInviteUser", (data) => {
            console.log("소켓 : 유저 초대 요청받음")
            console.log(data);

            io.to(socket_ids[data.to]).emit("resInviteUser", {
                from: data.from,
                sid: socket_ids[data.from]
            });
        });

        socket.on("reqAcceptInvite", (data) => {
            console.log("소켓 : 초대 수락 요청받음")
            console.log(data);
            
            socket.join(data.roomname);

            io.to(data.sid).emit("resAcceptInvite", {
                roomname: data.roomname
            });
        });

        socket.on("joinRoom", (data) => {
            console.log("소켓 : 입장 요청받음");
            console.log(data);

            socket.join(data.roomname);
            io.to(data.roomname).emit("notice", {
                roomname: data.roomname
            });
        });

        socket.on("sendMessage", (data) => {
            console.log("소켓 : 채팅 전송 요청받음");
            console.log(data);
            io.to(data.roomname).emit("receiveMessage", {
                chat: data.chat,
                from: data.from
            });
        });


        socket.on("disconnect", () => {
            console.log("소켓 : 접속 종료");
        });
    });
};