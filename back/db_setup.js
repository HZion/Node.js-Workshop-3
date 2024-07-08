const dotenv = require('dotenv').config();
const mysql = require('mysql2');

let mysqldb;

const setup = async () => {
    if (mysqldb) {
        return {mysqldb};
    }

    try {        
        mysqldb = mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_ID,
            password: process.env.MYSQL_PW,
            database: process.env.MYSQL_DB,
             charset: 'utf8mb4'
        });
        mysqldb.connect();
        console.log("MySQL 접속 성공.");
        return { mysqldb };
    } catch (err) {
        console.error('DB 접속 실패', err);
        throw err;  // 접속에 실패한다면 서버 가동을 할 수 없게 함
    }
};

module.exports = { setup };