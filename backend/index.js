const fs = require('fs');
const express = require('express');
const app = express(); // Express APP: creates different URL endpoints that a user can navigate to

app.get('/', (request, response) => { // read data from server, without modifying data

  fs.readFile('./home.html', 'utf8', (err, html) => {
      if (err) {
        response.status(500).send('sorry, out of order')
      }

      response.send (html);
    })

});

app.listen(process.env.PORT || 3000, () => console.log('App available on http://localhost:3000'));
