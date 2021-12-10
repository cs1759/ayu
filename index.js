// This file will contain key-server endpoints

import express from 'express';
export const app = express();
import {KeyServer} from './key-server.js';
const server = new KeyServer()

app.use(express.urlencoded({ extended: true }));
app.use(express.json())

// Rule 1
setInterval(async () => {
    console.log('Releasing key(s) every minute');
    await server.cleanUp()
},60000)

// Endpoints :
// To generate key
app.get('/E1', async (req, res) => {
    let result = await server.generateKey();
    res.status(201).send(result);
})

// To fetch assign key
app.get('/E2', async (req, res) => {
    let result = await server.fetchKey();
    if (result === "404: Not Found") {
        res.status(404).send(result);
    }
    res.status(200).send(result);
})

// To unblock a key
app.get('/E3', async (req, res) => {
    let result = await server.unblockKey(req.query.key);
    res.status(200).send(result);
})

// To delete a key
app.get('/E4', async (req, res) => {
    let result = await server.deleteKey(req.query.key);
    console.log(req.query.key)
    res.status(200).send(result);
})

// To keep a key alive
app.get('/E5', async (req, res) => {
    let result = await server.keepKeyAlive(req.query.key);
    res.status(200).send(result);
})

app.listen(3000, () => {
    console.log('App Running at port 3000...')
})
