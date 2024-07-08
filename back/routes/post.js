
const express = require('express');
const router = express.Router();
const { setup } = require('../db_setup');

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
ㄴ
*/

router.post('/insertpost', async (req, res)=>{
    console.log('server연결');

    const { mysqldb } = await setup();
    console.log(req.body);
    const insertMapQuery = 'INSERT INTO post (Uid, title , body,  img_url) VALUES (?, ?, ?, ?)';
    try {
      await mysqldb.query(insertMapQuery, [req.body.author, req.body.title, req.body.content, " "]);
      console.log('저장완료');
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
