const express = require('express');
const { readFile } = require('fs').promises;
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
var vkbeautify = require('vkbeautify');
const JSONDisplay = require('json-display');
const app = express();

app.get('/', async (req, res) => {
    res.send( await readFile('./home.html', 'utf-8') );
});

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Access the parse results as request.body
app.get('/lookup', async (request, response) => {
    let params = parseURLParams(request.url);
    let kjennemerke = params.kjennemerke;
    let kjoretoy = await oppslag(kjennemerke);

    //response.header("Content-Type",'application/json');
    response.send(JSON.stringify(kjoretoy, null, 4));
});



async function oppslag(kjennemerke) {
    let kjoretoy = null;
    let url = 'https://www.vegvesen.no/ws/no/vegvesen/kjoretoy/felles/datautlevering/enkeltoppslag/kjoretoydata?kjennemerke=' + kjennemerke;

    let api_key = await readFile('./api.key');
    let headers = {
            "SVV-Authorization": "Apikey " + api_key
        };

    console.log('Kaller REST-tjeneste: ' + url);
    let response = await fetch(url, { method: "GET", headers: headers });

    console.log('HTTP Status: ' + response.status + ' (' + response.statusText + ')');

    if (response.status === 200) {
        kjoretoy = await response.json();
    }

    return kjoretoy;
}

function parseURLParams(url) {
    let queryStart = url.indexOf("?") + 1,
        queryEnd   = url.indexOf("#") + 1 || url.length + 1,
        query = url.slice(queryStart, queryEnd - 1),
        pairs = query.replace(/\+/g, " ").split("&"),
        parms = {}, i, n, v, nv;

    if (query === url || query === "") return;

    for (i = 0; i < pairs.length; i++) {
        nv = pairs[i].split("=", 2);
        n = decodeURIComponent(nv[0]);
        v = decodeURIComponent(nv[1]);

        if (!parms.hasOwnProperty(n)) parms[n] = [];
        parms[n].push(nv.length === 2 ? v : null);
    }
    return parms;
}

app.listen(process.env.PORT || 4000, () => console.log('App available at http://localhost:4000'));
