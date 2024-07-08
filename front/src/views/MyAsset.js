import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../src/styles/MyPages.css'

const MyPage = () => {
    const [assets, setAssets] = useState({});
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAssets = async () => {
            const token = sessionStorage.getItem('token');

            try {
                const response = await axios.get('/account/asset', {
                    headers: {
                        'authorization': `Bearer ${token}`
                    }
                });
                setAssets(response.data);
            } catch (error) {
                console.error('Error fetching user assets:', error);
                setError('로그인 해주세요.');
            }
        };

        fetchAssets();
    }, []);

    return (
        <div className="my-page">
            <h1>My Assets</h1>
            {error && <p>{error}</p>}
            <ul>
                <li><span>USD:</span> {assets.USD || 0}</li>
                <li><span>JPY:</span> {assets.JPY100 || 0}</li>
                <li><span>KRW:</span> {assets.KRW || 0}</li>
                <li><span>CNY:</span> {assets.CNH || 0}</li>
            </ul>
        </div>
    );
};

export default MyPage;
