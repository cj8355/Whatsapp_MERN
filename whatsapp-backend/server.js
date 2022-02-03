// Importing
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Messages from './dbMessages.js';
import Pusher from 'pusher';
import cors from 'cors';
dotenv.config();


// App config
const app = express();
const PORT = process.env.PORT  || 9000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());



const pusher = new Pusher({
    appId: "1340284",
    key: process.env.REACT_APP_PUSHER_KEY, 
    secret: process.env.REACT_APP_PUSHER_SECRET,
    cluster: "us3",
    useTLS: true
  });

// DB config
//console.log(`This is the var ${process.env.REACT_APP_MONGO_URL}`);

mongoose.connect(process.env.REACT_APP_MONGO_URL, 
{
    useNewUrlParser: "true",
    useUnifiedTopology: "true"
})/*.toString()*/;

mongoose.connection.on("connected", (err, res) => {

    console.log("mongoose is connected")
  
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
app.get('/', (req,res) => res.status(200).send("Route OK"));

app.get('/messages/sync', (req, res) => {
    Messages.find((err, data) => {
    if (err) {
        res.status(500).send(err)
    } else {
        res.status(200).send(data)
    }
    });
});

app.post('/messages/new', (req, res) => {
    const dbMessage = req.body

    Messages.create(dbMessage, (err, data) => {
        if(err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(`new message created: \n ${data}`)
        }
    });
});


// Listen
app.listen(PORT, () => console.log(`Listening on localhost:${PORT}`));