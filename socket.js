const connection = require("./db/db_connection");
const parser = require("./JsonParser");
const fs = require("fs");
const path = require("path");

module.exports = (io) => {
    var online_users_list = [];
    var online_users_data = {};
    var socket_ids = [];
    var on_chat_users_list = [];

    io.sockets.on("connection", (socket) => {
        console.log("소켓 : 유저 접속");

        socket.on("reqOnline", (data) => {
            console.log("소켓 : 온라인 연결 시도");
            console.log(typeof (data));

            data = parser.discriminateParse(data);
            console.log("=== request_data ===");
            console.log(data);

            connection.query("select email, nickname, sex, age, region, introduce, profile from user where email=?", [data.email], (err, result, fields) => {
                if (err) {
                    console.log(err);
                }
                if (result && result.length != null) {
                    console.log(result);

                    online_users_list.push(data.email);
                    console.log("=== online_users_list ===");
                    console.log(online_users_list);
                    online_users_data[data.email] = result[0];
                    console.log("=== online_users_data ===");
                    console.log(online_users_data);

                    socket_ids[data.email] = socket.id;
                    console.log("=== socket_ids ===");
                    console.log(socket_ids);

                    userName = result[0].nickname;

                    socket.emit("resOnline", ({
                        success: true,
                        message: "접속 성공"
                    }));
                }
            });
        });

        socket.on("reqOffline", (data) => {
            console.log("소켓 : 연결 해제 시도");
            data = parser.discriminateParse(data);
            console.log("=== request_data ===");
            console.log(data);

            delete online_users_list.splice(online_users_list.indexOf(data.email), 1);
            delete online_users_data[data.email];
            delete socket_ids[data.email];

            console.log("=== online_users_list ===");
            console.log(online_users_list);
            console.log("=== online_users_data ===");
            console.log(online_users_data);
            console.log("=== socket_ids ===");
            console.log(socket_ids);

            socket.emit("resOffline", {
                success: true,
                message: "접속 해제"
            });
        });

        socket.on("reqOnlineUser", () => {
            console.log("소켓 : 온라인 유저 정보 요청받음");

            //socket.emit("resOnlineUser", online_users);
            socket.emit("resOnlineUser", {
                list: online_users_list,
                data: online_users_data
            });
        });

        socket.on("reqInviteUser", (data) => {
            console.log("소켓 : 유저 초대 요청받음")

            data = parser.discriminateParse(data);
            console.log("=== request_data ===");
            console.log(data);

            if (socket_ids[data.to]) {
                if (on_chat_users_list.some((arrayValue) => {
                        return data.to === arrayValue
                    })) {
                    socket.emit("resFailInviteUser", {
                        message: "다른 유저와 채팅 중입니다"
                    });
                } else {
                    io.to(socket_ids[data.to]).emit("resInviteUser", {
                        from: data.from,
                        sid: socket_ids[data.from]
                    });
                }
            } else {
                socket.emit("resFailInviteUser", {
                    message: "상대방이 접속 중이 아닙니다"
                });
            }

        });

        socket.on("reqAcceptInvite", (data) => {
            console.log("소켓 : 초대 수락 요청받음")

            data = parser.discriminateParse(data);
            console.log("=== request_data ===");
            console.log(data);

            var roomname = data.roomname;
            socket.join(roomname);
            on_chat_users_list.push(roomname.substring(roomname.indexOf("-") + 1));
            console.log("=== on_chat_users_list ===");
            console.log(on_chat_users_list);

            io.to(data.sid).emit("resAcceptInvite", {
                roomname: data.roomname
            });
        });

        socket.on("reqRejectInvite", (data) => {
            console.log("소켓 : 초대 거부 요청받음");
            data = parser.discriminateParse(data);
            console.log("=== request_data ===");
            console.log(data);

            io.to(data.sid).emit("resRejectInvite", {
                message: "상대방이 초대를 거부하였습니다"
            });
        });

        socket.on("joinRoom", (data) => {
            console.log("소켓 : 입장 요청받음");

            data = parser.discriminateParse(data);
            console.log("=== request_data ===");
            console.log(data);

            var roomname = data.roomname;
            socket.join(roomname);
            on_chat_users_list.push(roomname.substring(0, roomname.indexOf("-")));
            console.log("=== on_chat_users_list ===");
            console.log(on_chat_users_list);
            io.to(data.roomname).emit("notice", {
                message: data.roomname + " 채팅방에 입장하였습니다.",
            });
        });

        socket.on("sendMessage", (data) => {
            console.log("소켓 : 채팅(텍스트) 전송 요청받음");

            data = parser.discriminateParse(data);
            console.log("=== request_data ===");
            console.log(data);

            io.to(data.roomname).emit("receiveMessage", {
                contents: data.contents,
                from: data.from
            });
        });

        socket.on("sendImage", (data) => {
            console.log("소켓 : 채팅(이미지) 전송 요청받음");

            data = parser.discriminateParse(data);
            console.log("=== request_data ===");
            console.log(data);

            io.to(data.roomname).emit("receiveImage", {
                contents: data.contents,
                from: data.from
            });
        });

        socket.on("reqExitRoom", (data) => {
            console.log("소켓 : 채팅방 나가기 요청받음")

            data = parser.discriminateParse(data);
            console.log("=== request_data ===");
            console.log(data);

            delete on_chat_users_list.splice(on_chat_users_list.indexOf(data.email), 1);
            console.log("=== on_chat_users_list ===");
            console.log(on_chat_users_list);

            socket.leave(data.roomname);

            console.log(io.sockets.adapter.rooms);
            socket.emit("resExitRoom", {
                message: "채팅방에서 나왔습니다"
            });

            io.to(socket_ids[data.other]).emit("resOtherExitRoom", {
                message: "상대방이 채팅방에서 나갔습니다"
            });
        });

        socket.on("disconnect", () => {
            console.log("소켓 : 접속 종료");
        });
    });
};