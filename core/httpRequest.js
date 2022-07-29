const req = require('request')
usableProxies = [
  { "url": "amsterdam2", "tries": 0 },
  { "url": "amsterdam3", "tries": 0 },
  { "url": "amsterdam4", "tries": 0 },
  { "url": "amsterdam5", "tries": 0 },
  { "url": "basel1", "tries": 0 },
  { "url": "basel2", "tries": 0 },
//  { "url": "belgrade1", "tries": 0 }, // Went dead ~3AM 10/12/2021 - Ben
  { "url": "berlin1", "tries": 0 },
//  { "url": "bucharest1", "tries": 0 },
  { "url": "copenhagen1", "tries": 0 },
  { "url": "erfurt1", "tries": 0 },
  { "url": "frankfurt1", "tries": 0 },
  { "url": "frankfurt2", "tries": 0 },
  { "url": "hamburg1", "tries": 0 },
  { "url": "london1", "tries": 0 },
  { "url": "london2", "tries": 0 },
  { "url": "losangeles1", "tries": 0 },
  { "url": "madrid1", "tries": 0 },
  { "url": "malmoe1", "tries": 0 },
  { "url": "manchester1", "tries": 0 },
  { "url": "miami1", "tries": 0 },
  { "url": "milan1", "tries": 0 },
  { "url": "newyork1", "tries": 0 },
  { "url": "oslo1", "tries": 0 },
  { "url": "prague1", "tries": 0 },
  { "url": "riga1", "tries": 0 },
  { "url": "rotterdam1", "tries": 0 },
  { "url": "rotterdam2", "tries": 0 },
  { "url": "rotterdam3", "tries": 0 },
  { "url": "rotterdam4", "tries": 0 },
  { "url": "rotterdam5", "tries": 0 },
  { "url": "zurich1", "tries": 0 },
  { "url": "zurich2", "tries": 0 },
  { "url": "zurich3", "tries": 0 },
];

function httpRequest(params, postData) {
    return new Promise(function(resolve, reject,) {

      var selectedProxy = Math.floor(Math.random() * usableProxies.length);

      var proxyUrl = 'http://pp2183464:jd9NSov7OGHh@' + usableProxies[selectedProxy].url + '.perfect-privacy.com:3128';

      var proxiedRequest = req.defaults({/*'proxy': proxyUrl,*/ 'strictSSL': false, 'headers': 
        {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:92.0) Gecko/20100101 Firefox/92.0'}});

        var request = proxiedRequest.head(params, function(err, resp, body) {
            // reject on bad status
            if (err || !resp || resp.statusCode != 200) {
                if (err)
                  console.log(err);
                if (resp) {
                  if (resp.statusCode == 403) {
                    if (usableProxies[selectedProxy].tries < 3)
                      usableProxies[selectedProxy].tries++;
                    else {
//                      console.log(usableProxies[selectedProxy].url+' has reached 3 consecutive errors. Removing...');
//                      if (usableProxies.length > selectedProxy)
//                        usableProxies.splice(selectedProxy);
                    }
                    resolve(httpRequest(params, postData));
                  }
                  else if (resp.statusCode == 404)
                    reject(resp.statusCode);
                    //resolve(httpRequest(params, postData));
                  else
                    reject(resp.statusCode);
                }
                else {
                  console.log(err);
                  usableProxies[selectedProxy].count = 0;
                  resolve(httpRequest(params, postData));
//                reject(err);
                }
            }
            resolve(body);
        });
//        if (postData) {
//            req.write(postData);
//        }
    }).catch((error) => {throw error});
}

module.exports = httpRequest
