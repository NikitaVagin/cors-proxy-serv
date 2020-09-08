
const express = require('express'),
    request = require('request'),
    bodyParser = require('body-parser'),
    app = express()

const myLimit = typeof(process.argv[2]) != 'undefined' ? process.argv[2] : '100kb';
console.log('Using limit: ', myLimit);


app.use(bodyParser.json({limit: myLimit}));



app.all('*', (req, res, next) => {
    // Set CORS headers: allow all origins, methods, and headers: you may want to lock this down in a production environment
    res.set({
      'Access-Control-Allow-Origin' : '*',
      'Access-Control-Allow-Methods' : 'GET, PUT, PATCH, POST, DELETE',
      'Accept' : '*/*"',
      'Access-Control-Allow-Headers' : req.header('access-control-request-headers'),
    })
    // res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
    // res.header("Accept", "*/*")
    // res.header("Access-Control-Allow-Headers", req.header('access-control-request-headers'));

if (req.method === 'OPTIONS') {
    // CORS Preflight
    res.send();
  } else {
    // var targetURL = req.header('Target-URL');
    const targetURL = req.header('Target-Endpoint');
  
    if (!targetURL) {
      res.send(500, { error: 'There is no Target-Endpoint header in the request' });
      return;
    }
    //Custom headers
    const customHeaders = {
        'Accept': '*/*'
    }
    //if headers have authorization header then add to object 
    const auth = req.header('Authorization') ? {'Authorization' : req.header('Authorization')} : null
    Object.assign(customHeaders, auth)
    
    //if the response contains redirect tg 
    request({ url: targetURL, method: req.method, json: req.body, headers: customHeaders, followRedirect: false, encoding: null },
         (error, response, body) => {
           if(response.statusCode >= 300 && response.statusCode < 400){
              request({url: response.headers.location, method: "GET", headers: { 'Accept': '*/*'}}).pipe(res);
           } else {
            res.set({'Content-Type' : response.headers["content-type"]})
    
            res.send(body);
           }

        if (error) {
          console.error('error: ' + response.statusCode)
        }
      });
  }


});


app.set('port', process.env.PORT || 5000);

app.listen(app.get('port'), () => {
    console.log('Proxy server listening on port ' + app.get('port'));
});

