const router = require("express").Router();
const {setup} = require("../db_setup");
const axios = require('axios');
const jwt = require("jsonwebtoken");
const fetch= require('node-fetch');
const https=  require("https")

const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
    secureOptions: require('constants').SSL_OP_LEGACY_SERVER_CONNECT
});
//
// axios.interceptors.request.use(request => {
//     console.log('Starting Request', request.url);
//     return request;
// });
//
// axios.interceptors.response.use(response => {
//     console.log('Response:', response.config.url);
//     return response;
// }, error => {
//     if (error.response) {
//         console.log('Error response:', error.response.config.url);
//     }
//     return Promise.reject(error);
// });


async function extractTokenFromHeader(header){
    const splitToken = header.split(' ')
    const token = splitToken[1]

    if(splitToken.length !== 2 || splitToken[0] === 'bearer'){
        throw new Error('잘못된 토큰')
    }

    return token;
}

function decodeToken(token){
    try {
        let payload = jwt.verify(token, 'salt')
        console.log(payload)
        return payload;
    }
    catch (e) {
        throw new Error('잘못된 토큰')
    }
}

router.get('/api', async (req, res) => {
    const apikey = process.env.EXRATE_KEY;
    const url = `https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=${apikey}&data=AP01`

    try {
        const response = await axios.get(url, {httpsAgent, maxRedirects: 0});
        const data = response.data;

        const useCase = ['JPY(100)', 'CNH', 'USD', 'KRW'];
        const useData = data.filter(d => useCase.includes(d.cur_unit));

        res.json(useData);
    } catch (error) {
        console.error('Error fetching data from API', error);
        res.status(500).json({ error: 'Failed to fetch data from API' });
    }
});

router.post('/send', async (req, res) => {
    const body = req.body
    console.log(body)

    const {mysqldb} = await setup()

    let user;

    try {
        let token = await extractTokenFromHeader(req.headers.authorization)
        console.log(token)

        user = decodeToken(token)

    } catch (e) {
        res.status(500).json( { error: 'Token error'})
    }




    // 보낼 금액이 자신의 잔액보다 높은지 확인
    let senderBalance

    try {
        const checkBalance = 'SELECT KRW FROM wallet WHERE id = ?';
        const [rows, fields] = await mysqldb.query(checkBalance, [user.id])

        senderBalance = rows[0].KRW
    } catch (e) {
        res.status(500).json({ error: 'Failed to Connect MySQL' });
    }

    const amount = Number(req.body.amount)

    if (amount > senderBalance){
        return res.status(500).json({error: '보낼 금액이 충분하지 않습니다.'})
    }

    const calQuery = 'UPDATE wallet SET KRW = KRW + ? WHERE id=?'

    try {
        // 트렌젝션 시작
        await mysqldb.beginTransaction();

        const [s_rows, s_fields] = await mysqldb.query(calQuery, [ -amount , user.id])
        const [r_rows, r_fields] = await mysqldb.query(calQuery, [ amount, req.body.receiver])

        const insertQuery = 'INSERT INTO traction(sendUid, reciveUid, money_type, amount ) values (?, ? ,? ,?)'

        const [result, fields] = await mysqldb.query(insertQuery, [user.id, req.body.receiver, 1, amount])

        await mysqldb.commit()

        res.json(result)
    } catch (e) {
        await mysqldb.rollback()
        res.status(500).json({error: '이체에 실패하였습니다.'})
    }

});

router.get('/transactions', async (req, res) => {
    try {

        const {mysqldb} = await setup()
        const query = `
            SELECT t.id, s.name AS sender_name, r.name AS receiver_name, t.amount, t.money_type, t.createdAt
            FROM traction t
            JOIN account s ON t.sendUid = s.id
            JOIN account r ON t.reciveUid = r.id
            ORDER BY t.createdAt DESC;
        `;
        const [rows] = await mysqldb.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching transaction data:', error);
        res.status(500).json({ error: 'Failed to fetch transaction data' });
    }
});


module.exports = router;
