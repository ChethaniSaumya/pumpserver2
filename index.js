const express = require('express');
const { FieldValue, FieldPath } = require('firebase-admin/firestore');
const app = express();
const port = 3001;
const { db } = require('./firebase.js');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const upload = require('express-fileupload');

// Set the limit to 50MB for JSON payloads and URL-encoded payloads
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Set the limit to 50MB for file uploads
app.use(upload({
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
}));

const pinataSDK = require('@pinata/sdk');
const pinata = new pinataSDK({ pinataJWTKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIwOGYyMjVmNi01ZjVmLTQ1MmEtYWIzNS1kNWNhMmE4ZjBhMjUiLCJlbWFpbCI6ImNyb3Nza2l0dGllc25mdHNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjIyYTc5N2RlOGQ0MDc5M2U4ZjNjIiwic2NvcGVkS2V5U2VjcmV0IjoiMDdjNDUwY2IxMTQ4MWRiZjA3YjI4ZTU3NGFlYzZjOTlmYTQwZGIxMzBiZGQxYTczNmUxMGRmYWRiODcyYjQ4OSIsImV4cCI6MTc1MzIwMDU1NX0.VpcgwYgOUj8by3J57ew6GFCf0HXOGSq-31r0JbLqisE' });

app.use(express.json());


// Security best practices
app.use(helmet());

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

router.get('/friends', cors(corsOptions), async (req, res) => {
    const peopleRef = db.collection('people').doc('associates');
    const doc = await peopleRef.get();
    if (!doc.exists) {
        return res.sendStatus(400);
    }

    res.status(200).send(doc.data());
});

app.get('/friends/:name', (req, res) => {
    const { name } = req.params;
    if (!name || !(name in friends)) {
        return res.sendStatus(404);
    }
    res.status(200).send({ [name]: friends[name] });
});

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

// Route to add a new friend
router.post('/addfriend', cors(corsOptions), async (req, res) => {
    try {
        if (req.body && req.body.file) {
            const peopleRef1 = db.collection('people');
            const snapshot = await peopleRef1.get();
            const snapshot2 = await peopleRef1.orderBy('order', 'desc').limit(1).get();

            let order = 0; // Default order if no documents or error fetching
            if (!snapshot2.empty) {
                const lastDoc = snapshot2.docs[0];
                order = lastDoc.data().order + 1; // Increment the last order value
            }

            const count = snapshot.size; // This gives the count of documents

            console.log("Count: " + count);

            // Pinata section
            const buffer = Buffer.from(req.body.file, 'base64');
            const readableStreamForFile = require('stream').Readable.from(buffer);
            
            const options = {
                pinataMetadata: {
                    name: req.body.fileName,
                    keyvalues: {
                        NAME: req.body.name,
                        DESCRIPTION: req.body.description
                    }
                },
                pinataOptions: {
                    cidVersion: 0
                }
            };

            const result = await pinata.pinFileToIPFS(readableStreamForFile, options);
            console.log("File pinned to IPFS:", result);

            const fileUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
            console.log("File URL:", fileUrl);

            const timestamp = Math.floor(Date.now() / 1000);
            console.log(timestamp);

            const date = new Date();
            const formattedDate = date.toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                timeZone: 'GMT',
                timeZoneName: 'short',
                hour12: true
            }).replace('GMT', 'GMT:');
            console.log(formattedDate);

            const lowercaseName = req.body.name.toLowerCase();

            const peopleRef = db.collection('people').doc(count.toString());
            await peopleRef.set({
                NAME: req.body.name,
                LOWERCASE_NAME: lowercaseName,
                DESCRIPTION: req.body.description,
                MEMETICKER: req.body.memeTicker,
                IMAGE: fileUrl,
                WEBSITE: req.body.website,
                TWITTER: req.body.twitter,
                TELEGRAM: req.body.telegram,
                PUMP: req.body.pump,
                MOONSHOT: req.body.moonshot,
                SOLSCAN: req.body.solScan,
                WALLET: req.body.wallet,
                STATUS: req.body.status,
                SIGNATURE_PK: req.body.txn_sign.publicKey,
                SIGNATURE_SIGN: req.body.txn_sign.signature,
                TIME: timestamp,
                order: order

            }, { merge: true });

            res.status(200).send('Friend added successfully');
        } else {
            console.log("No file received.");
            res.status(400).send('No file received');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Something went wrong!');
    }
});

// Route to fetch all people data in descending order by document name
router.get('/getallfriends', cors(corsOptions), async (req, res) => {
    try {
        console.log("data extracting");
        const peopleRef = db.collection('people');
        //const snapshot = await peopleRef.orderBy(FieldValue.documentId(), 'desc').get();
        //const snapshot = await peopleRef.orderBy(FieldPath.documentId(), 'desc').get();
        const snapshot = await peopleRef.orderBy('order', 'desc').get();

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
        console.error(err);
        res.status(500).send({ error: 'Failed to fetch data' });
    }
});

app.patch('/changestatus', async (req, res) => {
    const { name, newStatus } = req.body;
    const peopleRef = db.collection('people').doc(count.toString());
    await peopleRef.set({
        [name]: newStatus
    }, { merge: true });
    res.status(200).send(friends);
});

app.delete('/friends', async (req, res) => {
    const { name } = req.body;
    const peopleRef = db.collection('people').doc('associates');
    await peopleRef.update({
        [name]: FieldValue.delete()
    });
    res.status(200).send(friends);
});

router.post('/search', cors(corsOptions), async (req, res) => {
    // const { partialName } = req.body;

    const partialName = req.body.searchVar
    console.log("partial : " + partialName);
    console.log("searchVar : " + req.body.searchVar);

    if (!partialName) {
        return res.status(400).send('Query parameter "partialName" is required');
    }

    try {
        const lowercasePartialName = partialName.toLowerCase();
        const peopleRef = db.collection('people');

        // Query for names that start with the partialName
        const snapshot = await peopleRef
            .where('LOWERCASE_NAME', '>=', lowercasePartialName)
            .where('LOWERCASE_NAME', '<', lowercasePartialName + '\uf8ff')
            .get();

        if (snapshot.empty) {
            return res.status(200).send({ message: 'No documents found' });
        }

        const results = [];
        snapshot.forEach(doc => {
            results.push({ id: doc.id, ...doc.data() });
        });

        res.status(200).send(results);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Failed to fetch data' });
    }
});

app.listen(port, () => console.log(`Server has started on port: ${port}`));
