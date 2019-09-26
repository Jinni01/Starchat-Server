const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const dateFormat = require("dateformat");
const crypto = require("crypto");
const passport = require("passport");
const fs = require("fs");

const connection = require("../../db/db_connection");

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
            cb(null, "routes/user/profileImage/");
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + new Date().valueOf() + ext);
            //파일이름 + 업로드날짜 + 확장자
        }
    }),
});

//login router
router.post("/login", isAuthenticated, (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.log(err);
            return res.status(401).json({
                success: false,
                message: err
            });
        } else {
            req.login(user, err => {
                if (err) {
                    console.log(err);
                }
                console.log(req.user);
                return res.status(200).json(req.user);
            })
        }
    })(req, res, next);
});
/*
router.post("/login", isAuthenticated, passport.authenticate('local', {
    failureRedirect: "/user/login-fail",
    failureFlash: true
}, (err, user) => {
    
}), (req, res) => {
    console.log(req.user);
    res.status(200).json(req.user);
});

router.get("/login-fail", (req, res) => {
    return res.status(401).json({
        success: false,
        message: req.flash("error")[0]
    });
});
*/
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

router.post("/signup", (req, res) => {

    const {
        userEmail,
        userID,
        userPW
    } = req.body;

    console.log("req.body => ");
    console.log(req.body);

    connection.query("select email from user where email=?", [userEmail], (err, result, fields) => {
        console.log(result);
        if (err) {
            return res.status(500).json({
                success: false,
                message: "DB에러"
            });
        }
        if (result && result.length != 0) {
            return res.status(400).json({
                success: false,
                message: "이미 가입된 이메일입니다"
            });
        }
        connection.query("select id from user where id=?", [userID], (err, result, fields) => {
            console.log(result);
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "DB에러"
                });
            }
            if (result && result.length != 0) {
                return res.status(400).json({
                    success: false,
                    message: "이미 가입된 ID입니다"
                });
            }

            return res.status(200).json({
                success: true,
                message: "가입할 수 있는 정보입니다"
            });
        });
    });
});

router.post("/create-profile", upload.single("userProfile"), (req, res) => {
    res.header("Access-Control-Allow-Headers", "multipart/form-data");

    const {
        userEmail,
        userID,
        userPW,
        userNickname,
        userSex,
        userAge,
        userRegion
    } = req.body;
    console.log("req.body => ");
    console.log(req.body);

    const userIntroduce = (req.body.userIntroduce == "" || req.body.userIntroduce == undefined) ? "자기소개 없음" : req.body.userIntroduce;

    console.log(userIntroduce);

    const userProfile = req.file ? req.file.filename : "sample.png";
    const userSigndate = dateFormat(new Date(), "yyyy-mm-dd'T'HH:MM:ss");
    console.log(userSigndate);

    let userPW_incrypted = undefined;
    let userSalt = undefined;

    const userType = "user";

    crypto.randomBytes(64, (err, buf) => {
        userSalt = buf.toString("base64");
        console.log("userSalt => " + userSalt);

        crypto.pbkdf2(userPW, userSalt, 52813, 64, "sha512", (err, key) => {
            userPW_incrypted = key.toString("base64");
            console.log("userPW_incrypted => " + userPW_incrypted);

            connection.query(
                "insert into user values(?,?,?,?,?,?,?,?,?,0,?,?,?)",
                [
                    userEmail,
                    userID,
                    userPW_incrypted,
                    userNickname,
                    userSex,
                    userAge,
                    userRegion,
                    userIntroduce,
                    userProfile,
                    userSigndate,
                    userSalt,
                    userType
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

    const userEmail = req.user.email;
    console.log(userEmail);
    const userProfile = req.user.profile;

    fs.unlink(path.join(__dirname, "/profileImage", userProfile), function (err) {
        if (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: "파일 삭제 에러"
            });
        }
        req.logout();
        req.session.destroy(() => {
            connection.query("delete from user where email = ?", [userEmail], (err, result, fields) => {
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
});

router.post("/star/plus", (req, res) => {
    if (!req.user) {
        return res.status(400).json({
            success: false,
            message: "로그인되어 있지 않습니다"
        });
    }

    const amount = Number(req.body.amount);
    console.log(amount);

    const userEmail = req.user.email;
    connection.query("select star from user where email = ?", [userEmail], (err, result, fields) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: "DB에러"
            });
        }
        if (result && result.length != 0) {
            console.log(result);
            const star = Number(result[0].star);
            console.log(star);

            const after = star + amount;

            connection.query("update user set star=? where email=?", [after, userEmail], (err, result, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        success: false,
                        message: "DB에러"
                    });
                }
                if (result && result.length != 0) {
                    console.log(result);
                    const msg = amount + "개의 별을 충전했습니다. 남은 별 개수 : " + after;
                    return res.status(200).json({
                        success: true,
                        message: msg
                    })
                } else {
                    return res.sendStatus(204);
                }
            });

        } else {
            return res.sendStatus(204);
        }
    });
});

router.post("/star/minus", (req, res) => {
    if (!req.user) {
        return res.status(400).json({
            success: false,
            message: "로그인되어 있지 않습니다"
        });
    }

    const amount = Number(req.body.amount);
    console.log(amount);

    const userEmail = req.user.email;
    connection.query("select star from user where email = ?", [userEmail], (err, result, fields) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: "DB에러"
            });
        }
        if (result && result.length != 0) {
            console.log(result);
            const star = Number(result[0].star);
            console.log(star);

            if (star <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "차감할 별이 없습니다"
                });
            } else {
                const after = star - amount;

                connection.query("update user set star=? where email=?", [after, userEmail], (err, result, fields) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({
                            success: false,
                            message: "DB에러"
                        });
                    }
                    if (result && result.length != 0) {
                        console.log(result);
                        const msg = amount + "개의 별을 사용했습니다. 남은 별 개수 : " + after;
                        return res.status(200).json({
                            success: true,
                            message: msg
                        })
                    } else {
                        return res.sendStatus(204);
                    }
                });
            }

        } else {
            return res.sendStatus(204);
        }
    });
});

router.post("/find", (req, res) => {
    const userEmail = req.body.userEmail;

    connection.query("select email, nickname, sex, age, region, introduce, profile from user where email=?",
        [userEmail], (err, result, fields) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: false,
                    message: "DB에러"
                });
            }
            if (result && result.length != 0) {
                return res.status(200).json(result[0]);
            } else {
                return res.sendStatus(204);
            }
        });
});

router.post("/list", (req, res) => {
    connection.query("select email, id, nickname, sex, age, region, introduce, profile, star, signdate from user", (err, result, fields) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: "DB에러"
            });
        }
        if (result && result.length != 0) {
            console.log(result);
            return res.status(200).json(result);
        } else {
            return res.sendStatus(204);
        }
    });
});

module.exports = router;