const express = require("express");
const morgan = require("morgan"); //REST 로깅
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const passportConfig = require("./passport");
const flash = require("connect-flash");
const bodyParser = require("body-parser");

//*Region Router Components
const userRouter = require("./user/user");
//*EndRegion

const app = express();

app.set("port", process.env.PORT || 80);

app.use(morgan("dev"));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended : true
}));

app.use(session({ secret: '213jkdjsk21', resave: true, saveUninitialized: false })); 
app.use(passport.initialize()); 
app.use(passport.session()); 
passportConfig();

app.use(flash());

//*Region Static Router 
app.use("profileImage", express.static(path.join(__dirname, "user/profileImage")));
//*EndRegionpassportUserConfig();

//*Region Router
app.use("/user", userRouter);
//*EndRegion

app.use((req, res, next) => {
    
    next();
}); 

app.use((req, res, next) => {
    const err = new Error("Not Found");
    err.status = 404;
    return res.status(404).send("일치하는 주소가 없습니다.");
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("서버 에러");
});

app.listen(app.get("port"), ()=> {
    console.log(app.get("port"), "번 포트에서 대기 중");
});