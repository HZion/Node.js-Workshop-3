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


function extractTokenFromHeader(header){
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

const secretKey = 'salt'; // JWT 시크릿 키

// 미들웨어: JWT 토큰 검증
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = extractTokenFromHeader(authHeader)

    console.log(token)

    if (!token) {
        return res.sendStatus(401);
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
};

router.get('/api', async (req, res) => {
    const apikey = process.env.EXRATE_KEY;

    const url = `https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=${apikey}&data=AP01`

    try {
        const response = await axios.get(url, {httpsAgent, maxRedirects: 0});
        const data = response.data;

        const useCase = ['JPY(100)', 'CNH', 'USD', 'KRW'];
        const useData = data.filter(d => useCase.includes(d.cur_unit));
        console.log("OK")
        res.json(useData);
    } catch (error) {
        console.error('Error fetching data from API', error);
        res.status(500).json({ error: 'Failed to fetch data from API' });
    }
});

router.post('/exchange', authenticateToken, async (req, res) => {
    let { fromCurrency, toCurrency, amount, convertedAmount } = req.body;
    console.log(req.body)
    console.log(req.user)
    const userId = req.user.id;

    if (!fromCurrency || !toCurrency || !amount || !userId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Create a new mysqldb
        const { mysqldb } = await setup()

        try {
            await mysqldb.beginTransaction();

            // // Fetch exchange rates
            // const [rateRows] = await mysqldb.query('SELECT * FROM exchange_rates WHERE id = 1');
            // const rates = rateRows[0];
            // const fromRate = parseFloat(rates[fromCurrency]);
            // const toRate = parseFloat(rates[toCurrency]);
            //
            // if (!fromRate || !toRate) {
            //     throw new Error('Invalid currency');
            // }

            // Calculate the amount in the target currency
            const fromAmount = amount
            const toAmount = convertedAmount

            if (fromCurrency === 'JPY(100)'){
                fromCurrency = 'JPY100'
            }

            if (toCurrency === 'JPY(100)'){
                toCurrency = 'JPY100'
            }

            // Fetch user's current balance
            const [walletRows] = await mysqldb.query('SELECT ?? FROM wallet WHERE id = ?', [fromCurrency, userId]);
            const currentBalance = parseFloat(walletRows[0][fromCurrency]);

            if (currentBalance < amount) {
                throw new Error('Insufficient funds');
            }

            // Update user's wallet
            await mysqldb.query('UPDATE wallet SET ?? = ?? - ? WHERE id = ?', [fromCurrency, fromCurrency, fromAmount, userId]);
            await mysqldb.query('UPDATE wallet SET ?? = ?? + ? WHERE id = ?', [toCurrency, toCurrency, toAmount, userId]);

            await mysqldb.commit();
            res.json({ success: true, amount: toAmount });
        } catch (error) {
            await mysqldb.rollback();
            console.error('Error during transaction:', error);
            res.status(500).json({ error: 'Failed to process exchange request' });
        }
    } catch (error) {
        console.error('Error connecting to database:', error);
        res.status(500).json({ error: 'Failed to connect to database' });
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

        const insertQuery = 'INSERT INTO transaction(sendUid, reciveUid, money_type, amount ) values (?, ? ,? ,?)'

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
            FROM transaction t
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
