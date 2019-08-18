const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const dateFormat = require("dateformat");
const crypto = require("crypto");
const passport = require("passport");

const connection = require("../db/db_connection");

const isAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()){
        return res.status(400).send("이미 로그인되어 있습니다.");
    }
    next();
};

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, "user/profileImage/");
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + new Date().valueOf() + ext);
            //파일이름 + 업로드날짜 + 확장자
        }
    }),
});

//login router
router.post("/login", isAuthenticated, passport.authenticate('local', {
    failureRedirect: "/user/login_fail"
}), (req, res) => {
    res.status(200).json(req.user);
});

router.get("/login_fail", (req, res) => {
    return res.sendStatus(204);
});

router.get("/logout", (req, res) => {
    if(!req.user){
        return res.status(400).send("로그인되어 있지 않습니다.");
    }
    req.logout();
    req.session.destroy(() => {
        return res.status(200).send("로그아웃");
    });
});

router.post("/signup", upload.single("userImage"), (req, res) => {
    res.header("Access-Control-Allow-Headers", "multipart/form-data");

    const {
        userNickname,
        userID,
        userPW,
        userSex,
        userAge,
        userRegion,
        userIntroduce
    } = req.body;
    console.log(req.body);

    const userProfileimage = req.file.filename;
    const userSigndate = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");

    let userPW_incrypted = undefined;
    let userSalt = undefined;

    crypto.randomBytes(64, (err, buf) => {
        userSalt = buf.toString("base64");
        console.log("userSalt => " + userSalt);

        crypto.pbkdf2(userPW, userSalt, 52813, 64, "sha512", (err, key) => {
            userPW_incrypted = key.toString("base64");
            console.log("userPW_incrypted => " + userPW_incrypted);

            connection.query(
                "select * from user where nickname=?",
                [userNickname], (err, result, fields) => {
                    if (result && result.length != 0) {
                        return res.status(400).send("이미 가입되어 있는 회원입니다.");
                    }
                    connection.query(
                        "insert into user values(?,?,?,?,?,?,?,?,0,?,?)",
                        [
                            userNickname,
                            userID,
                            userPW_incrypted,
                            userSex,
                            userAge,
                            userRegion,
                            userProfileimage,
                            userIntroduce,
                            userSigndate,
                            userSalt
                        ],
                        (err, result, fields) => {
                            if (err) {
                                console.log(err);
                                return res.status(400).send("잘못된 값을 삽입하였습니다.");
                            }

                            if (result && result.length != 0) {
                                console.log(result);
                                return res.status(201).send("회원 가입 성공");
                                //return res.status(201).send("회원 가입 성공");
                            } else {
                                return res.sendStatus(204);
                            }
                        }
                    );
                }
            );
        });
    });
});

router.delete("/leave", (req, res) => {

    if(!req.user){
        return res.status(400).send("잘못된 접근입니다.");
    }

    const userName = req.user.nickname;
    console.log(userName);

    req.logout();
    req.session.destroy(() => {
        connection.query("delete from user where nickname = ?", [userName], (err, result, fields) => {
            if(err){
                console.log(err);
                return res.status(500).send("삭제 실패");
            }
            if(!(result && result.length !=0)){
                return res.sendStatus(204);
            } else{
                return res.status(200).send("삭제 성공");
            }
        }); 
    });
});

module.exports = router;