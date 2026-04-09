import mongoose from 'mongoose';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    try {
        console.log("Testing cart API...");
        const loginRes = await axios.post('http://localhost:4000/api/user/login', {
            email: "test_for_cart@example.com",
            password: "password123"
        });
        
        let token = loginRes.data.token;
        if (!token) {
           console.log("User not found or incorrect, logging response:", loginRes.data);
           const regRes = await axios.post('http://localhost:4000/api/user/register', {
                name: "Cart Tester",
                email: "test_for_cart@example.com",
                password: "password123"
           });
           console.log("Register response:", regRes.data);
           token = regRes.data.token;
        }

        console.log("Logged in. Token:", token);

        console.log("Calling /api/cart/add...");
        const addRes = await axios.post('http://localhost:4000/api/cart/add', {
            itemId: "testitem",
            size: "M"
        }, { headers: { token } });
        console.log("Add response:", addRes.data);

        console.log("Calling /api/cart/get...");
        const getRes = await axios.post('http://localhost:4000/api/cart/get', {}, { headers: { token } });
        console.log("Get response:", getRes.data);

        process.exit(0);
    } catch (e) {
        console.error("Test failed, error details:");
        console.error(e.response ? e.response.data : e);
        process.exit(1);
    }
}
run();
