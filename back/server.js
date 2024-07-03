

// express 불러오기
const express = require('express');
//dotenv
const dotenv = require('dotenv').config();
// express 인스턴스 생성
const app = express();
// 포트 정보
const port = 8080;

// 라우트 설정
// HTTP GET 방식으로 '/' 경로를 요청하였을 때
// Hello World!라는 문자열을 결과값으로 보냄
const { setup } = require('./db_setup');

app.get('/', (req, res) => {
  res.render('index.ejs');
});

//세션
// const session = require('express-session');
// app.use(session({
//   secret: 'your-secret-key', // 세션 암호화에 사용되는 키
//   resave: false, // 세션을 언제나 저장할지 설정
//   saveUninitialized: false // 초기화되지 않은 세션을 저장할지 설정
// }));


app.listen(process.env.WEB_PORT, async () => {
  await setup();
  console.log(`App running on port ${port}...`);
});


app.use(express.json())

//cors
const cors = require('cors')
const corsOptions = {
  origin: 'http://localhost:3000',
}
app.use(cors(corsOptions))
app.use('/', require('./routes/account'));

