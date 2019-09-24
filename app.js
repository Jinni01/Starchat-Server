const express = require("express");
const http = require("http");
const socket = require("socket.io");
const socketEvents = require("./socket");
const morgan = require("morgan"); //REST 로깅
const path = require("path");
const session = require("express-session");
//const cookie = require("cookie-parser");
const passport = require("passport");
const passportConfig = require("./passport");
//const flash = require("connect-flash");
const bodyParser = require("body-parser");

//*Region Router Components
const userRouter = require("./routes/user/user");
const adminRouter = require("./routes/admin/admin");
//*EndRegion

const app = express();
const server = http.createServer(app);
const io = socket(server);
socketEvents(io);

app.set("port", process.env.PORT || 80);
app.use(morgan("dev"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

//app.use(cookie('12kld@@!3'));
app.use(session({
    secret: '12kld@@!3',
    resave: true,
    saveUninitialized: false
}));
//app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passportConfig();

//*Region Static Router 
app.use(express.static(path.join(__dirname, "static")));
app.use("/profileImage", express.static(path.join(__dirname, "routes/user/profileImage")));
//*EndRegion

//*Region Router
app.use("/user", userRouter);
app.use("/admin", adminRouter);
//*EndRegion

/*
app.use((req, res, next) => {
    
    next();
}); 
*/ // Custom Middleware
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "static/html/test.html"));
});

app.get("/privacypolicy", (req, res) => {
    res.sendFile(path.join(__dirname, "static/html/etc/privacypolicy.html"));
});

app.get("/tos", (req, res) => {
    res.sendFile(path.join(__dirname, "static/html/etc/tos.html"));
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

server.listen(app.get("port"), () => {
    console.log(app.get("port"), "번 포트 열림");
});