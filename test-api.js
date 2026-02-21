const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Explicitly load from the server/.env
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const test = async () => {
    const apiKey = process.env.RAPID_API_KEY;
    console.log('Using Key:', apiKey ? (apiKey.substring(0, 5) + '...' + apiKey.slice(-5)) : 'MISSING');

    try {
        const params = {
            query: 'Node.js in gurugram',
            page: '1',
            num_pages: '1',
            date_posted: 'month',
        };

        const options = {
            method: 'GET',
            url: 'https://jsearch.p.rapidapi.com/search',
            params,
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
            }
        };

        const response = await axios.request(options);
        console.log('Status:', response.status);
        console.log('Results Count:', response.data.data?.length);
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.log('Response Error Body:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

test();
