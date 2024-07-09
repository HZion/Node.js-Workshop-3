import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/TransactionList.css'
const moment = require('moment')
function dateFormat(date) {
    return moment(date).format('YYYY-MM-DD HH:mm:ss')
}

const TransactionList = () => {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        axios.get('/banking/transactions')
            .then(response => {
                setTransactions(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the transaction data!', error);
            });
    }, []);

    return (
        <div className="transaction-list">
            <h1>Transaction List</h1>
            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Sender</th>
                    <th>Receiver</th>
                    <th>Amount</th>
                    <th>Currency</th>
                    <th>Date</th>
                </tr>
                </thead>
                <tbody>
                {transactions.map(transaction => (
                    <tr key={transaction.id}>
                        <td>{transaction.id}</td>
                        <td>{transaction.sender_name}</td>
                        <td>{transaction.receiver_name}</td>
                        <td>{transaction.amount}</td>
                        <td>{transaction.money_type}</td>
                        <td>{dateFormat(transaction.created_at)}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default TransactionList;
