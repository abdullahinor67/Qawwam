const express = require('express');
const cors = require('cors');
const adhan = require('adhan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Prayer Times API
app.get('/api/prayer-times', (req, res) => {
  const { latitude, longitude, method = 'MuslimWorldLeague' } = req.query;
  
  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Latitude and longitude required' });
  }

  const coordinates = new adhan.Coordinates(parseFloat(latitude), parseFloat(longitude));
  const date = new Date();
  const params = adhan.CalculationMethod[method]();
  
  const prayerTimes = new adhan.PrayerTimes(coordinates, date, params);
  
  res.json({
    fajr: prayerTimes.fajr.toISOString(),
    sunrise: prayerTimes.sunrise.toISOString(),
    dhuhr: prayerTimes.dhuhr.toISOString(),
    asr: prayerTimes.asr.toISOString(),
    maghrib: prayerTimes.maghrib.toISOString(),
    isha: prayerTimes.isha.toISOString(),
    currentPrayer: prayerTimes.currentPrayer(),
    nextPrayer: prayerTimes.nextPrayer(),
  });
});

// Quran API proxy
app.get('/api/surah/:number', async (req, res) => {
  try {
    const response = await fetch(`https://api.alquran.cloud/v1/surah/${req.params.number}/ar.alafasy`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch surah' });
  }
});

app.get('/api/surah/:number/translation', async (req, res) => {
  try {
    const response = await fetch(`https://api.alquran.cloud/v1/surah/${req.params.number}/en.sahih`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch translation' });
  }
});

// Daily Ayah
app.get('/api/daily-ayah', async (req, res) => {
  const dailyAyahs = [
    { surah: 2, ayah: 286 },
    { surah: 3, ayah: 139 },
    { surah: 94, ayah: 5 },
    { surah: 2, ayah: 152 },
    { surah: 2, ayah: 186 },
    { surah: 13, ayah: 28 },
    { surah: 65, ayah: 3 },
  ];
  
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const selected = dailyAyahs[dayOfYear % dailyAyahs.length];
  
  try {
    const [arabicRes, englishRes] = await Promise.all([
      fetch(`https://api.alquran.cloud/v1/ayah/${selected.surah}:${selected.ayah}/ar.alafasy`),
      fetch(`https://api.alquran.cloud/v1/ayah/${selected.surah}:${selected.ayah}/en.sahih`)
    ]);
    
    const arabic = await arabicRes.json();
    const english = await englishRes.json();
    
    res.json({
      arabic: arabic.data.text,
      translation: english.data.text,
      surah: selected.surah,
      ayah: selected.ayah,
      surahName: arabic.data.surah.englishName
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch daily ayah' });
  }
});

app.listen(PORT, () => {
  console.log(`🕌 Qawaam server running on port ${PORT}`);
});

