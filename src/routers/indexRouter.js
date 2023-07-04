// Load Environment variables
require('dotenv').config();

const express = require("express");
const {Router} = express;
const router = new Router(); // express.Router()
var paystack = require('paystack')(process.env.PAYSTACK_SECRET_KEY);
var uuid = require('node-uuid');

const users = [];

router.route("/users").get((req, res) => {
    res.json(users);
}).post((req, res) => {
    const { user } = req.body; // instead of req.body.user

    users.push({ username: user.username, password: user.password});

    console.log(users);

    res.json({loggedIn: true, status: "Everything went well"});
})

// this is an api, also know as an endpoint, an api gets requests and sends back a response according to that request

//on post man since it's a query, use a question mark: http://localhost:3000?user=lester
router.get("/", (req, res) => {
    const user = req.query.user;
    
    res.send(user + "!")
});

// AKA REST endpoint
                    // callback function
router.get("/ruby", (req, res) => {
    res.send("<h1>Hello Ruby</h1>")
    //res.status(200).send(***whatever you want to send***)
});

// post requests is when a client wants to create data on the back end

router.post("/create_user", (req, res) => {
    const { user } = req.body; // instead of req.body.user

    users.push({ username: user.username, password: user.password});

    console.log(users);

    res.json({loggedIn: true, status: "Everything went well"});
});

// let's create an endpoint where someone can get all the users of our application

/*router.get("/users", (_, res) => {
    res.json(users);
});*/

router.put("/update_old", (req, res) => {

}); 

router.delete("/delete", (req, res) => {
    const { username, password } = req.body;

    const existingUser = users.find( u => u.username === username && u.password === password);
    console.log("Existing user:" + existingUser)

    if (!existingUser) {
        res.json({ errorStatus: "Credentials did not match"});
        //res.status(401).json({ errorStatus: "Credentials did not match"});
    }

    users.splice(users.indexOf(existingUser, 1));

    res.json(users)
}); 

router.get('/verify/:reference', function(req, res) {
    var reference = req.params.reference;

    paystack.transaction.verify(reference,
        function(error, body) {
        if(error){
            res.send({error:error});
            return;
        }
        if(body.data.success){
            // save authorization
            var auth = body.authorization;
        }
        res.send(body.data);
    });
});

router.post('/recharge', function(req, res) {
    var authCode = req.body.authCode;
    var customerEmail = req.body.email;
    var chargeAmount = req.body.amount;
    chargeAmount = parseFloat(String(chargeAmount).replace(",", "."));

    const https = require('https');

    const params = JSON.stringify({
        "authorization_code" : authCode,
        "email" : customerEmail,
        "amount" : chargeAmount
    });

    const options = {
          hostname: 'api.paystack.co',
          port: 443,
          path: '/transaction/charge_authorization',
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + process.env.PAYSTACK_SECRET_KEY,
            'Content-Type': 'application/json'
          }
        }
        
        const httpsReq = https.request(options, response => {
        let data = ''
        
        response.on('data', (chunk) => {
            data += chunk
        });
        
        response.on('end', () => {
            console.log(JSON.parse(data))
            res.send(JSON.parse(data))
        })
    }).on('error', error => {
        console.error(error)
        res.send(400)
    })
    
    httpsReq.write(params)
    httpsReq.end()
});

///
///

router.post('/refund', function(req, res) {
    var transactionId = req.body.transactionId;
    var refundAmount = req.body.amount;
    refundAmount = parseFloat(String(refundAmount).replace(",", "."));

    const https = require('https');

    const params = JSON.stringify({
        "transaction" : transactionId,
        "amount" : refundAmount
    });

    const options = {
          hostname: 'api.paystack.co',
          port: 443,
          path: '/refund',
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + process.env.PAYSTACK_SECRET_KEY,
            'Content-Type': 'application/json'
          }
        }
        
        const httpsReq = https.request(options, response => {
        let data = ''
        
        response.on('data', (chunk) => {
            data += chunk
        });
        
        response.on('end', () => {
            console.log(JSON.parse(data))
            res.send(JSON.parse(data))
        })
    }).on('error', error => {
        console.error(error)
        res.send(400)
    })
    
    httpsReq.write(params)
    httpsReq.end()
});
///

var crypto = require('crypto');
const secret = "sk_test_54e3d98a6feed158dea288f9319be51d01e24537"

router.post("/paystack", function(req, res) {
    //validate event
    const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
    if (hash == req.headers['x-paystack-signature']) {
    // Retrieve the request's body
    const event = req.body;
    // Do something with event  
    }
    res.status(200).send(req.body);
});

module.exports = router;