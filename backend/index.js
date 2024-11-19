const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const cors = require('cors');

const app = express();
const port = 3001;
const cache = new NodeCache({ stdTTL: 3600 });

app.use(cors());
app.use(express.json());

app.get('/search_tracks', async (req, res) => {
    const { name } = req.query;
    if (!name) return res.status(400).json({ error: 'Band name is required' });

    const cachedData = cache.get(name);
    if (cachedData) return res.json(cachedData);

    try {
        const response = await axios.get(`https://itunes.apple.com/search?term=${name}&entity=song&limit=25`);
        const songs = response.data.results.filter(song =>
            song.artistName.toLowerCase().includes(name.toLowerCase().trim())
        );

        const albums = [...new Set(songs.map(song => song.collectionName))];
        const result = {
            total_albums: albums.length,
            total_songs: songs.length,
            albums,
            songs: songs.map(song => ({
                song_id: song.trackId,
                album_name: song.collectionName,
                song_name: song.trackName,
                preview_url: song.previewUrl,
                release_date: song.releaseDate,
                price: {
                    value: song.trackPrice || 0,
                    currency: song.currency || 'USD',
                },
            })),
        };
        cache.set(name, result);
        res.json(result);
    } catch (error) {
        console.error("Error fetching iTunes API:", error.message);
        res.status(500).json({ error: 'Failed to fetch data from iTunes API' });
    }
});

app.post('/favorites', (req, res) => {
    const { band_name, song_id, user, rating } = req.body;

    if (!band_name || !song_id || !user || !rating) {
        return res.status(400).json({ error: 'Incomplete data' });
    }

    const favorites = cache.get('favorites') || [];
    favorites.push({ band_name, song_id, user, rating });
    cache.set('favorites', favorites);

    res.json({ message: 'Song saved as favorite', data: { band_name, song_id, user, rating } });
});

app.get('/favorites', (req, res) => {
    const favorites = cache.get('favorites') || [];
    res.json(favorites);
});


if (require.main === module) {
    app.listen(port, () => console.log(`Backend is running at http://localhost:${port}`));
  }

  module.exports = app;