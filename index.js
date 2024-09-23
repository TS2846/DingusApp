const express = require('express')
const app = express()
const port = 3000

app.listen(port, ()=> console.log(`Message app listening on port ${port}!`))

app.use(express.static(__dirname));

app.get('/', function(req, res){
    res.sendFile(__dirname + '\\index.html');
  });
  