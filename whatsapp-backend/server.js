// Importing
import express from 'express';
import mongoose from 'mongoose';
import Messages from './dbMessages.js';
import Pusher from 'pusher';
import cors from 'cors';

// App config
const app = express();
const port = process.env.port || 9000;

// Middleware
app.use(express.json());
app.use(cors());



const pusher = new Pusher({
    appId: "1340284",
    key: "8d93cea93a16afc0c97c",
    secret: "03b74ea46629eed65d22",
    cluster: "us3",
    useTLS: true
  });

// DB config
const connection_url = 'mongodb+srv://ccallender:Mariokart65@cluster0.07ubg.mongodb.net/WhatsappDB?retryWrites=true&w=majority';

mongoose.connect(connection_url, {
    
});


const db = mongoose.connection;

db.once('open', () => {
    console.log('DB connected');

    const msgCollection = db.collection("messagecontents");
    const changeStream = msgCollection.watch();

    changeStream.on('change', (change) => {
        console.log('A change occured', change);

        if (change.operationType === 'insert') {
            const messageDetails = change.fullDocument;
            pusher.trigger('messages', 'inserted',
            {
                name: messageDetails.name,
                message: messageDetails.message,
                timestamp: messageDetails.timestamp,
                received: messageDetails.received,
            }
            );
        } else {
            console.log('Error triggering pusher')
        }

    });
});


// API routes
app.get('/', (req,res) => res.status(200).send("HELLO WROLD!!"));

app.get('/messages/sync', (req, res) => {
    Messages.find((err, data) => {
    if (err) {
        res.status(500).send(err)
    } else {
        res.status(200).send(data)
    }
    })
})

app.post('/messages/new', (req, res) => {
    const dbMessage = req.body

    Messages.create(dbMessage, (err, data) => {
        if(err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(`new message created: \n ${data}`)
        }
    })
})


// Listen
app.listen(port, () => console.log(`Listening on localhost:${port}`));