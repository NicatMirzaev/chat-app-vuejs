const express = require('express')
const path = require('path')
const app = express()
const port = 3000

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.sendFile('index.html')
})

app.get('/chat', (req, res) => {
  console.log(req.query);
  res.send('test');
})

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
