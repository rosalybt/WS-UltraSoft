import express from 'express';
import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import qrcode from 'qrcode';
import fs from 'fs';
import axios from 'axios';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json());

const clients = {};

function initClient(sessionId) {
    if (clients[sessionId]) return clients[sessionId];

    const client = new Client({
        authStrategy: new LocalAuth({ clientId: sessionId }),
        puppeteer: { headless: true, args: ['--no-sandbox'] }
    });

    client.on('qr', qr => {
        qrcode.toDataURL(qr, (err, src) => {
            fs.writeFileSync(`./sessions/${sessionId}.qr.png`, src.split(",")[1], 'base64');
        });
    });

    client.on('ready', () => {
        console.log(`[${sessionId}] Cliente listo`);
    });

    client.on('authenticated', () => {
        console.log(`[${sessionId}] Autenticado`);
    });

    client.initialize();
    clients[sessionId] = client;
    return client;
}

app.get('/qr/:sessionId', (req, res) => {
    const sessionId = req.params.sessionId;
    initClient(sessionId);
    const qrPath = `./sessions/${sessionId}.qr.png`;
    if (fs.existsSync(qrPath)) {
        res.sendFile(qrPath, { root: '.' });
    } else {
        res.status(202).send('QR en proceso, recarga en unos segundos.');
    }
});

app.post('/send-pdf', async (req, res) => {
    const { sessionId, telefono, url } = req.body;
    if (!sessionId || !telefono || !url) {
        return res.status(400).json({ error: 'sessionId, telefono y url son requeridos' });
    }

    try {
        const client = initClient(sessionId);
        const pdf = await axios.get(url, { responseType: 'arraybuffer' });
        const media = new MessageMedia('application/pdf', Buffer.from(pdf.data).toString('base64'), 'documento.pdf');
        await client.sendMessage(`${telefono}@c.us`, media);
        res.json({ status: true, message: 'PDF enviado correctamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado en puerto ${PORT}`);
});
