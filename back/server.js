// express 불러오기
const express = require('express');
// dotenv
const dotenv = require('dotenv').config();
// express 인스턴스 생성
const app = express();

const exrateRouter = require('./routes/banking')
// 포트 정보
const port = process.env.WEB_PORT || 8080; // 환경 변수에서 포트를 가져오거나 기본값으로 8080 사용

// db_setup
const { setup } = require('./db_setup');

// 세션 (필요할 경우 사용)
// const session = require('express-session');
// app.use(session({
//   secret: 'your-secret-key', // 세션 암호화에 사용되는 키
//   resave: false, // 세션을 언제나 저장할지 설정
//   saveUninitialized: false // 초기화되지 않은 세션을 저장할지 설정
// }));

// 서버 시작
app.listen(port, async () => {
  await setup();
  console.log(`App running on port ${port}...`);
});

// JSON 요청을 처리하기 위한 미들웨어
app.use(express.json());

// CORS 설정
const cors = require('cors');
const corsOptions = {
  origin: 'http://localhost:3000',
}
app.use(cors(corsOptions))



// 라우터 설정
app.use('/', require('./routes/account'));
app.use('/maps', require('./routes/maps'));
app.use('/post', require('./routes/post'));
app.use('/banking', exrateRouter);