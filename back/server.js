
// express 불러오기
const express = require('express');
// express 인스턴스 생성
const app = express();
// 포트 정보
const port = 8080;
const jwt = require('jsonwebtoken');
// 라우트 설정
// HTTP GET 방식으로 '/' 경로를 요청하였을 때
// Hello World!라는 문자열을 결과값으로 보냄
app.get('/', (req, res) => {
  res.send('Hello World!');
});

const session = require('express-session');
app.use(session({
  secret: 'your-secret-key', // 세션 암호화에 사용되는 키
  resave: false, // 세션을 언제나 저장할지 설정
  saveUninitialized: false // 초기화되지 않은 세션을 저장할지 설정
}));

// MongoDB접속
const mongoclient = require('mongodb').MongoClient

const url = 'mongodb+srv://admin:1234@cluster0.jewz3uu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
let mydb;
mongoclient
    .connect(url)
    .then(client => {
        console.log('몽고 DB 접속 성공')
        mydb = client.db('mybank')        

        // 서버 실행
        app.listen(port, () => {
            console.log(`App running on port ${port}...`);
        });
    })
    .catch(err => {
        console.log(err)
    })



app.use(express.json())

const cors = require('cors')
const corsOptions = {
  origin: 'http://localhost:3000',
}
app.use(cors(corsOptions))

app.post('/insertMember', function (req, res) {
    console.log(req.body)
    mydb.collection('member')
        .insertOne({id:req.body.id, pw:req.body.pw, name:req.body.name, register_date:new Date()})
        .then(result => {
            //console.log(result)
            console.log('회원 가입 성공')
            res.json({msg:"회원 가입 되셨습니다"})
        })
        .catch(err => {
            console.log(err)
            res.json({msg:"회원 가입 실패"})
    })
    
})

app.post("/login", function (req, res) {
    console.log(req.body);
  
    mydb
      .collection("member")
      .findOne({ id: req.body.id, pw: req.body.pw })
      .then((result) => {
        if (result) {
            const token = jwt.sign({ userid: req.body.id }, 'salt', { expiresIn: '1m' });        
            req.session.user = req.body;
          res.json({ msg: "login ok", token });
        } else {
          res.json({ msg: "로그인 실패 : ID와 PW를 확인해 주세요" });
        }
      })
      .catch((err) => {
        res.json({ msg: "회원 가입 실패 : 서버 오류" });
      });
  });
  
  app.get('/session-test', (req, res) => {
    // console.log(req.session);
    // if (req.session.user) {
    //   res.json({msg:'이미 로그인 되어 있습니다'})
    // } else {
    //   res.json({msg:'로그인 해주세요'})
    // }  
    console.log(req.headers.authorization);
    const token = req.headers.authorization;
    if (token) {
      jwt.verify(token, 'salt', (err, decoded) => {
        if (err) {
          return res.json({msg:'로그인 해주세요'})
        }
        console.log(decoded);
        res.json({msg:`${decoded.userid}님 이미 로그인 되어 있습니다`})
      })
    } else {
      res.json({msg:'로그인 해주세요'})
    }
  });