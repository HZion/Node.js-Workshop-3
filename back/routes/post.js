
/*Q&A 게시판 기능 
1.게시물 db에서 읽고 출력
1.1 
sever> db 
제목
유저
내용
만든날 

2.게시물 생성
2.1 내용 받기
clinet > server
제목
유저 // jwt 토큰이 있으면 해당 uid에  아니면 guess로 
내용
2.2 sql에 저장 


3.게시물 삭제 (주인, admin만?)
?admin 보안을 강화시킬 방법이 무엇이 있을까?
지금 만드는 방식으론 같은 유저 지위에서 해당 UID가 admin인경우에만 허락해주는 방식인데 이게 맞을까?
4.수정 

모달에 들어갈 내용 정리
새로운 게시판 만드는 창
사진을 받는데 원본이름 그대로 받는다.

5.이미지 받기
1. 외부에서 url로 가져오기
2. 로컬 public 디렉터리에서 가져오기 : 성능이 별로
3. 로컬 src 디렉터리에서 가져오기 : 성능이 더 좋다
이미지 추가 횟수 제한 하지않음 / 
*/

const express = require('express');
const router = express.Router();
const { setup } = require('../db_setup');
const path = require('path');
let multer = require('multer');
const jwt = require('jsonwebtoken');

let storage = multer.diskStorage({
  destination: function(req, file, done){
    done(null, './public/image')
  },
  filename: function(req, file, done)
{
  done(null, Date.now() + path.extname(file.originalname));
}});

let upload = multer ({storage: storage});

router.post('/insertpost',upload.single('image'), async (req, res)=>{

    console.log('server연결');
    console.log(req.body);
    let img_path ='';
    if(req.file){
      img_path = `/image/${req.file.filename}`;
    }
    

    const { mysqldb } = await setup();
    let author = 'guest';
    const token = req.headers.authorization;
    // 
    if (token) {
      jwt.verify(token, 'salt', (err, decoded) => {
        if (err) {
          console.log('에러1');
          author = 'guest';
        }else{
          console.log('복호화 정보');
          console.log(decoded);
          author = decoded.userid;
        }             
      })
    } else {
      author = 'guest';
    }

    const insertMapQuery = 'INSERT INTO posts (Uid, title , body,  img_url) VALUES (?, ?, ?, ?)';
    try {
      await mysqldb.query(insertMapQuery, [author, req.body.title, req.body.content, img_path]);
      console.log('저장완료');
      console.log('입력된 값 :'+ img_path);
      res.json({ msg: "게시판 정보가 성공적으로 저장되었습니다" });
    } catch (error) {
      console.error('Database error during property insertion: ' + error.stack);
      return res.status(500).json({ error: 'Database error' });
    }
    
});

router.post('/loadpost' , async (req, res)=>{
    console.log('server연결');
    const { mysqldb } = await setup();

    const insertMapQuery = 'SELECT * FROM posts';

    try {
        const [result] = await mysqldb.query(insertMapQuery);
        console.log('Loaded map data:', result);
        res.json(result);
    } catch (error) {
      console.error('Database error during property insertion: ' + error.stack);
      return res.status(500).json({ error: 'Database error' });
    }
})


module.exports = router;
