import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CurrencyTransfer = () => {
    const [amount, setAmount] = useState('');
    const [receiver, setReceiver] = useState('');
    const [message, setMessage] = useState('');
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('/account/users');
                setUsers(response.data);
                console.log(response.data)
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
        };

        fetchUsers();
    }, []);

    const handleTransfer = async () => {
        try {
            const response = await axios.post('/banking/send', {
                amount,
                receiver
            }, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}` // Assuming the token is stored in localStorage
                }
            });
            console.log(response.data)
            setMessage(`Transfer successful`);
        } catch (error) {
            if (error.response) {
                setMessage(`Error: ${error.response.data.error}`);
            } else {
                setMessage('Error: Could not complete the transfer.');
            }
        }
    };

    return (
        <div>
            <h1>Currency Transfer</h1>
            <div>
                <label>
                    Amount:
                    <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                    />
                </label>
            </div>
            <div>
                <label>
                    Receiver:
                    <select value={receiver} onChange={e => setReceiver(e.target.value)}>
                        <option value="">Select Receiver</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.Name}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
            <button onClick={handleTransfer}>Transfer</button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default CurrencyTransfer;
