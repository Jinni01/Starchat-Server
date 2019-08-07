const mysql = require("mysql");
const config = require("./db_info").local; //db설정 파일 컴포넌트화

const con = mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
});

con.connect((err) => {
    if(err){
        console.log("mysql connection error => error log : " + err);
        throw err;
    }
    console.log("mysql db connected");
})

module.exports = con;