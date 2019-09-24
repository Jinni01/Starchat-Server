const router = require("express").Router();

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        if(req.user.type == 'admin'){
            return res.status(400).json({
                success: false,
                message: "이미 로그인되어 있습니다"
            });
        }
        else{
            return res.status(401).json({
                success: false,
                message: "관리자 권한이 없는 계정입니다"
            })
        }
    }
    next();
};

router.get("/", (req,res)=>{
    return res.status(200).json({ test : "test"});
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