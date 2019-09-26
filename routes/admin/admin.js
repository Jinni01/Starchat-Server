const router = require("express").Router();
const fs = require("fs");
const path = require("path")
const passport = require("passport");
const connection = require("../../db/db_connection");

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.type == "admin") {
            return res.status(400).json({
                success: false,
                message: "이미 로그인되어 있습니다"
            });
        } else {
            return res.status(401).json({
                success: false,
                message: "관리자 권한이 없는 계정입니다"
            })
        }
    }
    next();
};

router.get("/", (req, res) => {

    if (req.user) {
        if (req.user.type == "admin") {
            res.redirect("/admin/tool");
        }
    } else {
        res.redirect("/admin/logintab");
    }
});

router.get("/logintab", (req, res) => {
    if (!req.user) {
        fs.readFile(path.join("static/html/admin/login.html"), (err, data) => {
            if (err) {
                return res.status(500).json({
                    message: "페이지를 로딩하는 동안 오류가 발생하였습니다",
                    err: err
                });
            } else {
                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                res.end(data);
            }
        });
    } else {
        return res.redirect("/admin/tool");
    }
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

                if (user.type == "admin") {
                    return res.status(200).json({
                        success: true,
                        message: "관리자 인증이 완료되었습니다"
                    });
                } else {
                    req.logout();
                    req.session.destroy(() => {
                        return res.status(401).json({
                            success: false,
                            message: "관리자 권한이 없는 계정입니다"
                        });
                    });
                }
            })
        }
    })(req, res, next);
});

router.get("/tool", (req, res) => {
    if (req.user) {
        fs.readFile(path.join("static/html/admin/tool.html"), (err, data) => {
            if (err) {
                return res.status(500).json({
                    message: "페이지를 로딩하는 동안 오류가 발생하였습니다",
                    err: err
                });
            } else {
                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                res.end(data);
            }

        });
    } else {
        return res.redirect("/admin");
    }
});

router.post("/noti/list", (req, res) => {
    connection.query("select `index`, `title` from notice", (err, result, fields) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: "DB에러"
            });
        }
        if (result && result.length != 0) {
            return res.status(200).json(result);
        } else {
            return res.sendStatus(204);
        }
    });
});

router.get("/noti/new", (req, res) => {
    if (req.user) {
        fs.readFile(path.join("static/html/admin/new_noti.html"), (err, data) => {
            if (err) {
                return res.status(500).json({
                    message: "페이지를 로딩하는 동안 오류가 발생하였습니다",
                    err: err
                });
            } else {
                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                res.end(data);
            }

        });
    } else {
        return res.redirect("/admin");
    }
});

router.post("/noti/new", (req, res) => {
    const {
        noticeTitle,
        noticeText
    } = req.body;

    connection.query("insert into notice(`title`, `contents`) values(?, ?)",
        [noticeTitle, noticeText], (err, result, fields) => {
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
                    message: "공지사항을 작성했습니다"
                });
            } else {
                return res.sendStatus(204);
            }
        });
});

router.get("/noti/view/:idx", (req, res) => {
    if (req.user) {
        fs.readFile(path.join("static/html/admin/view_noti.html"), (err, data) => {
            if (err) {
                return res.status(500).json({
                    message: "페이지를 로딩하는 동안 오류가 발생하였습니다",
                    err: err
                });
            } else {
                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                res.end(data);
            }
        });
    } else {
        return res.redirect("/admin");
    }
});

router.post("/noti/view/:idx", (req, res) => {
    connection.query("select `title`, `contents` from notice where `index`=?", [req.params.idx], (err, result, fields) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: "DB에러"
            });
        }
        if (result && result.length != 0) {
            res.status(200).json(result[0]);
        } else {
            return res.sendStatus(204);
        }
    });
});

router.delete("/noti/view/:idx", (req, res) => {
    connection.query("delete from notice where `index`=?", [req.params.idx], (err, result, fields) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: "DB에러"
            });
        }
        if (result && result.length != 0) {
            res.status(200).json({
                success: true,
                message: "공지사항이 삭제되었습니다"
            });
        } else {
            return res.sendStatus(204);
        }
    });
});

router.get("/noti/edit/:idx", (req, res) => {
    if (req.user) {
        fs.readFile(path.join("static/html/admin/edit_noti.html"), (err, data) => {
            if (err) {
                return res.status(500).json({
                    message: "페이지를 로딩하는 동안 오류가 발생하였습니다",
                    err: err
                });
            } else {
                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                res.end(data);
            }
        });
    } else {
        return res.redirect("/admin");
    }
});

router.post("/noti/edit/:idx", (req, res) => {
    const {
        noticeTitle,
        noticeText,
    } = req.body;

    const noticeIndex = Number(req.body.noticeIndex);

    connection.query("update notice set `title`=?, `contents`=? where `index`=?", [noticeTitle, noticeText, noticeIndex], (err, result, fields) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: "DB에러"
            });
        }
        if (result && result.length != 0) {
            res.status(200).json({
                success: true,
                message: "공지사항이 수정되었습니다"
            });
        } else {
            return res.sendStatus(204);
        }
    });
});

module.exports = router;