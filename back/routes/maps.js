// routes/maps.js

const express = require('express');
const router = express.Router();
const { setup } = require('../db_setup');

router.post('/insertmap', async function (req, res) {
 
   
    const { mysqldb } = await setup();
 
    console.log(req.body     );
    console.log(req.body.price);
    const title = req.body.name;

    // 예시: 부동산 정보를 데이터베이스에 삽입하는 쿼리
    const insertMapQuery = 'INSERT INTO property (Uid, title , asset,  lat, log, address) VALUES (?, ?, ?, ?, ?,?)';

    mysqldb.query(insertMapQuery, [" ", title, req.body.price, req.body.lat, req.body.lng, req.body.address], (err, results) => {
        if (err) {
            console.error('Database error during property insertion: ' + err.stack);
            return res.status(500).json({ error: 'Database error' });
        }

        res.json({ msg: "부동산 정보가 성공적으로 저장되었습니다" });
    });
});

router.post('/loadmap', async function (req, res) {
 
  
        const { mysqldb } = await setup();
        console.log("db접속");
        const selectQuery = 'SELECT * FROM property'; // 적절한 SELECT 쿼리를 작성합니다.
        mysqldb.query(selectQuery, (err, results) => {
          if (err) {
            console.error('Database error during map data retrieval: ' + err.stack);
            return res.status(500).json({ error: 'Database error' });
          }
          console.log('Loaded map data:', results);
          res.json(results); // 결과를 JSON 형식으로 응답합니다.
        });
      
});

module.exports = router;
