const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const dateFormat = require("dateformat");
const crypto = require("crypto");
const passport = require("passport");

const connection = require("../db/db_connection");

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.status(400).json({
            success: false,
            message: "이미 로그인되어 있습니다"
        });
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
    failureRedirect: "/user/login-fail",
    failureFlash: true
}), (req, res) => {
    res.status(200).json(req.user);
});

router.get("/login-fail", (req, res) => {
    return res.status(401).json({
        success: false,
        message: req.flash("error")[0]
    });
});

router.post("/logout", (req, res) => {
    if (!req.user) {
        return res.status(400).json({
            success: false,
            message: "로그인되어 있지 않습니다"
        });
    }
    req.logout();
    req.session.destroy(() => {
        return res.status(200).json({
            success: true,
            message: "로그아웃 성공"
        });
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
                "select nickname from user where nickname=?",
                [userNickname], (err, result, fields) => {
                    if (result && result.length != 0) {
                        return res.status(400).json({
                            success: false,
                            message: "중복된 닉네임을 사용하였습니다"
                        });
                    }
                    connection.query(
                        "select id from user where id=?",
                        [userID], (err, result, fields) => {
                            if (result && result.length != 0) {
                                return res.status(400).json({
                                    success: false,
                                    message: "중복된 ID를 사용하였습니다"
                                });
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
                                        return res.status(500).json({
                                            success: false,
                                            message: "DB에러"
                                        });
                                    }
                                    if (result && result.length != 0) {
                                        console.log(result);
                                        return res.status(201).json({
                                            success: true,
                                            message: "회원 가입 성공"
                                        });
                                    } else {
                                        return res.sendStatus(204);
                                    }
                                }
                            );
                        }
                    )
                }
            );
        });
    });
});

router.post("/leave", (req, res) => {

    if (!req.user) {
        return res.status(400).json({
            success: false,
            message: "잘못된 접근입니다"
        })
    }

    const userID = req.user.id;
    console.log(userID);

    req.logout();
    req.session.destroy(() => {
        connection.query("delete from user where nickname = ?", [userID], (err, result, fields) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: false,
                    message: "DB에러"
                });
            }
            if (result && result.length != 0) {
                return res.status(200).json({
                    success: true,
                    message: "유저 정보 삭제 성공"
                });
            } else {
                return res.sendStatus(204);
            }
        });
    });
});

module.exports = router;