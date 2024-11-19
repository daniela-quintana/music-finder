"use client";

import React, { useState, useEffect } from "react";

interface Track {
  song_id: number;
  album_name: string;
  song_name: string;
  preview_url: string;
  release_date: string;
  price: {
    value: number;
    currency: string;
  };
  favorite?: boolean;
}

const App: React.FC = () => {
  const [artistName, setArtistName] = useState<string>("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const savedFavorites = JSON.parse(
      localStorage.getItem("favorites") || "[]"
    );
    const updatedTracks = tracks.map((track) => ({
      ...track,
      favorite: savedFavorites.some(
        (fav: Track) => fav.song_id === track.song_id
      ),
    }));
    setTracks(updatedTracks);
  }, [artistName]);

  const fetchTracks = async () => {
    try {
      setError("");
      const response = await fetch(
        `http://localhost:3001/search_tracks?name=${artistName}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch tracks");
      }
      const data = await response.json();
      const savedFavorites = JSON.parse(
        localStorage.getItem("favorites") || "[]"
      );
      const updatedTracks = data.songs.map((song: Track) => ({
        ...song,
        favorite: savedFavorites.some(
          (fav: Track) => fav.song_id === song.song_id
        ),
      }));

      setTracks(updatedTracks);
    } catch (err) {
      setError("Failed to fetch tracks. Please try again.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      fetchTracks();
    }
  };

  const toggleFavorite = async (track: Track) => {
    const savedFavorites = JSON.parse(
      localStorage.getItem("favorites") || "[]"
    );
    let updatedFavorites;

    if (track.favorite) {
      updatedFavorites = savedFavorites.filter(
        (fav: Track) => fav.song_id !== track.song_id
      );
    } else {
      updatedFavorites = [...savedFavorites, track];
      try {
        await fetch("http://localhost:3001/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            band_name: track.album_name,
            song_id: track.song_id,
            user: "guest",
          }),
        });
      } catch (error) {
        console.error("Error al guardar favorito en el backend:", error);
      }
    }

    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    const updatedTracks = tracks.map((t) =>
      t.song_id === track.song_id ? { ...t, favorite: !t.favorite } : t
    );
    setTracks(updatedTracks);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="max-w-4xl w-full bg-gray-50 p-6 rounded-xl shadow-lg">
        <h1 className="text-4xl font-extrabold text-blue-600 text-center mb-6 flex items-center justify-center">
          Music Finder 🎶
        </h1>

        <p className="text-center text-gray-500 mb-8">
          Discover your favorite songs and albums with ease.
        </p>

        <div className="flex items-center space-x-4 mb-6">
          <input
            type="text"
            placeholder="Enter artist or band name"
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full p-4 bg-gray-50 rounded-full shadow-inner text-gray-700 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button
            onClick={fetchTracks}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-md hover:bg-blue-500 focus:ring-2 focus:ring-blue-300 transition"
          >
            Search
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md shadow-md mb-6 text-center">
            ⚠️ {error}
          </div>
        )}

        {tracks.length > 0 && (
          <div className="bg-gray-50 rounded-xl shadow-md p-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-4 text-blue-500 text-left">Song Name</th>
                  <th className="p-4 text-blue-500 text-left">Album Name</th>
                  <th className="p-4 text-blue-500 text-left">Preview</th>
                  <th className="p-4 text-blue-500 text-left">Price</th>
                  <th className="p-4 text-blue-500 text-left">Release Date</th>
                  <th className="p-4 text-blue-500 text-left">Favorite</th>
                </tr>
              </thead>
              <tbody>
                {tracks.map((track, index) => (
                  <tr
                    key={track.song_id}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50 transition`}
                  >
                    <td className="p-4 text-gray-700">{track.song_name}</td>
                    <td className="p-4 text-gray-700">{track.album_name}</td>
                    <td className="p-4">
                      <a
                        href={track.preview_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        Listen
                      </a>
                    </td>
                    <td className="p-4 text-gray-700">
                      {track.price.value} {track.price.currency}
                    </td>
                    <td className="p-4 text-gray-700">
                      {new Date(track.release_date).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => toggleFavorite(track)}
                        className={`relative text-2xl ${
                          track.favorite
                            ? "text-[rgb(233,86,118)] scale-110"
                            : "text-gray-400"
                        }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill={track.favorite ? "currentColor" : "none"}
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
