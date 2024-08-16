const express = require('express')
const { FieldValue } = require('firebase-admin/firestore')
const app = express()
const port = 3001
const { db } = require('./firebase.js')

const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const helmet = require('helmet');
const morgan = require('morgan');
const which = require('which');
const { spawn } = require('child_process');
const { REFUSED } = require('dns');
const upload = require('express-fileupload');
var count = 0;

app.use(express.json())



// Set the limit to 50MB for JSON payloads
app.use(bodyParser.json({ limit: '50mb' }));

// Set the limit to 50MB for URL-encoded payloads
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));


// Security best practices
app.use(helmet());
app.use(upload());

// CORS configuration
app.use(cors());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

var corsOptions = {
    origin: ['http://localhost:3001', 'https://localhost:3001'],
    optionsSuccessStatus: 200,
};

// Set the limit to 50MB for JSON payloads
app.use(bodyParser.json({ limit: '50mb' }));

// Set the limit to 50MB for URL-encoded payloads
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Use the JWT key
const pinataSDK = require('@pinata/sdk');
const pinata = new pinataSDK({ pinataJWTKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIwOGYyMjVmNi01ZjVmLTQ1MmEtYWIzNS1kNWNhMmE4ZjBhMjUiLCJlbWFpbCI6ImNyb3Nza2l0dGllc25mdHNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjIyYTc5N2RlOGQ0MDc5M2U4ZjNjIiwic2NvcGVkS2V5U2VjcmV0IjoiMDdjNDUwY2IxMTQ4MWRiZjA3YjI4ZTU3NGFlYzZjOTlmYTQwZGIxMzBiZGQxYTczNmUxMGRmYWRiODcyYjQ4OSIsImV4cCI6MTc1MzIwMDU1NX0.VpcgwYgOUj8by3J57ew6GFCf0HXOGSq-31r0JbLqisE' });


// Body parsing middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Logging middleware
app.use(morgan('combined'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});


// Create an express Router
const router = express.Router();

// Mount the router at a specific path
app.use('/api', router);

const friends = {
    'james': 'friend',
    'larry': 'friend',
    'lucy': 'friend',
    'banana': 'enemy',
}

app.get('/friends', async (req, res) => {
    const peopleRef = db.collection('people').doc('associates')
    const doc = await peopleRef.get()
    if (!doc.exists) {
        return res.sendStatus(400)
    }

    res.status(200).send(doc.data())
})

app.get('/friends/:name', (req, res) => {
    const { name } = req.params
    if (!name || !(name in friends)) {
        return res.sendStatus(404)
    }
    res.status(200).send({ [name]: friends[name] })
})

app.get('/count', async (req, res) => {
    try {
        const peopleRef = db.collection('people');
        const snapshot = await peopleRef.get();
        count = snapshot.size; // This gives the count of documents

        res.status(200).send({ count: count });
    } catch (error) {
        console.error("Error counting documents: ", error);
        res.status(500).send('Something went wrong!');
    }
});

// ............................. routers ............................. //

router.post('/addfriend', cors(corsOptions), async (req, res) => {

    try {
        if (req.body && req.body.file) {

            const peopleRef1 = db.collection('people');
            const snapshot = await peopleRef1.get();
            count = snapshot.size; // This gives the count of documents
            console.log("Count :" + count);
            if (count != null) {
                count;
            } else {
                count = 0;
            }

            console.log(req.body.file);

            var fileBase64 = req.body.file;
            //console.log("base64 String : " + fileBase64);

            // Decode the Base64 string back into a Buffer and save it as an image
            const buffer = Buffer.from(fileBase64, 'base64');
            const imagePath = path.join(__dirname, '/uploads/' + req.body.fileName);
            fs.writeFileSync(imagePath, buffer);

            let NAME = req.body.name;
            console.log("NAME : " + NAME);

            let MEMETICKER = req.body.memeTicker;
            console.log("MEMETICKER : " + MEMETICKER);

            let DESCRIPTION = req.body.description;
            console.log("DESCRIPTION : " + DESCRIPTION);

            let WEBSITE = req.body.website;
            console.log("WEBSITE : " + WEBSITE);

            let TWITTER = req.body.twitter;
            console.log("TWITTER : " + TWITTER);

            let TELEGRAM = req.body.telegram;
            console.log("TELEGRAM : " + TELEGRAM);

            let PUMP = req.body.pump;
            console.log("PUMP : " + PUMP);

            let MOONSHOT = req.body.moonshot;
            console.log("MOONSHOT : " + MOONSHOT);

            let SOLSCAN = req.body.solScan;
            console.log("SOLSCAN : " + SOLSCAN);

            let WALLET = req.body.wallet;
            console.log("WALLET : " + WALLET);

            let STATUS = req.body.status;
            console.log("STATUS : " + STATUS);

            //pinata section


            const readableStreamForFile = fs.createReadStream(imagePath);
            const options = {
                pinataMetadata: {
                    name: req.body.fileName,
                    keyvalues: {
                        NAME: NAME,
                        DESCRIPTION: DESCRIPTION,
                        MEMETICKER: MEMETICKER,
                        WEBSITE: WEBSITE,
                        TWITTER: TWITTER,
                        TELEGRAM: TELEGRAM,
                        PUMP: PUMP,
                        MOONSHOT: MOONSHOT,
                        WALLET: WALLET,
                        STATUS: STATUS
                    }
                },
                pinataOptions: {
                    cidVersion: 0
                }
            };

            //**********Image Upload to ipfs***********

            const result = await pinata.pinFileToIPFS(readableStreamForFile, options);
            console.log("File pinned to IPFS:", result);

            const fileUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
            console.log("File URL:", fileUrl);

///////////////////////////////////////////










            //  const { name, status } = req.body
            const peopleRef = db.collection('people').doc(count.toString())
            const res2 = await peopleRef.set({
                NAME: NAME,
                DESCRIPTION: DESCRIPTION,
                MEMETICKER: MEMETICKER,
                IMAGE: fileUrl,
                WEBSITE: WEBSITE,
                TWITTER: TWITTER,
                TELEGRAM: TELEGRAM,
                PUMP: PUMP,
                MOONSHOT: MOONSHOT,
                WALLET: WALLET,
                STATUS: STATUS

            }, { merge: true })
            // friends[name] = status
            res.status(200).send(friends);
        } else {
            console.log("No file received.");
        }
    } catch (err) {
        console.log(err);
    }

});


// Route to fetch all people data in descending order by document name
router.get('/getallfriends', async (req, res) => {
    try {
        const peopleRef = db.collection('people');
        const snapshot = await peopleRef.orderBy(admin.firestore.FieldPath.documentId(), 'desc').get();

        if (snapshot.empty) {
            res.status(200).send({ message: 'No documents found' });
            return;
        }

        const peopleData = [];
        snapshot.forEach(doc => {
            peopleData.push({ id: doc.id, ...doc.data() });
        });

        res.status(200).send(peopleData);
    } catch (err) {
        console.log(err);
        res.status(500).send({ error: 'Failed to fetch data' });
    }
});




// ............................. routers ............................. //


app.patch('/changestatus', async (req, res) => {
    const { name, newStatus } = req.body
    const peopleRef = db.collection('people').doc(count.toString())
    const res2 = await peopleRef.set({
        [name]: newStatus
    }, { merge: true })
    // friends[name] = newStatus
    res.status(200).send(friends)
})

app.delete('/friends', async (req, res) => {
    const { name } = req.body
    const peopleRef = db.collection('people').doc('associates')
    const res2 = await peopleRef.update({
        [name]: FieldValue.delete()
    })
    res.status(200).send(friends)
})

app.listen(port, () => console.log(`Server has started on port: ${port}`))