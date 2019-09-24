const router = require("express").Router();
const fs = require("fs");
const path = require("path")
const passport = require("passport");

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.type == 'admin') {
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

module.exports = router;