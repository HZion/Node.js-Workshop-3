const router = require("express").Router();
const {setup} = require("../db_setup");
const axios = require('axios');

async function getOpenApiData(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error: ${error}`);
        return null;
    }
}
router.get('/api', async (req, res) => {
    const apikey = process.env.EXRATE_KEY;
    const url = `https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=${apikey}&data=AP01`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        const useCase = ['JPY(100)', 'CNH', 'USD', 'KRW'];
        const useData = data.filter(d => useCase.includes(d.cur_unit));

        res.json(useData);
    } catch (error) {
        console.error('Error fetching data from API', error);
        res.status(500).json({ error: 'Failed to fetch data from API' });
    }
});


module.exports = router;
