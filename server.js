const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const ASPSMS_USERKEY = '9E32D2DK3JNF';
const ASPSMS_API_PASSWORD = 'UTASwGD429L0phf8KgMEeVoq';

app.post('/api/send-sms', async (req, res) => {
  try {
    const { to, message } = req.body || {};

    if (!to || !message) {
      return res.status(400).json({ error: 'Felder "to" und "message" sind erforderlich.' });
    }

    if (!/^\+[1-9]\d{6,14}$/.test(to)) {
      return res.status(400).json({ error: 'Ungültiges Telefonnummer-Format (erwartet z.B. +41791234567).' });
    }

    const aspsmsRes = await fetch('https://json.aspsms.com/sendSimpleTextSMS', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        UserKey: ASPSMS_USERKEY,
        Password: ASPSMS_API_PASSWORD,
        Originator: 'BeautyRoom',
        Recipients: [to],
        MessageText: message
      })
    });

    const data = await aspsmsRes.json();
    console.log('ASPSMS Antwort für', to, ':', data);

    if (data.StatusCode !== '1') {
      return res.status(502).json({ error: 'SMS-Versand fehlgeschlagen.', details: data.StatusInfo || null });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('send-sms Fehler:', err);
    return res.status(500).json({ error: 'Unerwarteter Serverfehler.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server läuft auf Port ' + PORT);
});
