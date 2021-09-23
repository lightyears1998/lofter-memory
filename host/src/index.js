import express from 'express';

const app = express();
const briefMS = 3000;

app.get('/', (req, res) => {
    res.send("Hello, world!")
})

app.listen(3000)
