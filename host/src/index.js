import express from 'express';

const PORT = 7670;

const app = express();
app.use(express.json())

app.post('/', (req, res) => {
    console.log(req.headers, req.body)
    res.send("Hello, world!")
})

app.listen(PORT, () => {
    console.log(`Server is ready at ${PORT}.`)
})
