const request = require('supertest');
const app = require('../index.js');

describe("GET /search_tracks", () => {
  it("should return songs for a valid artist name", async () => {
    const response = await request(app).get("/search_tracks?name=Lorde");
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("total_songs");
    expect(response.body).toHaveProperty("songs");
    expect(response.body.songs.length).toBeGreaterThan(0);
  });

  it("should return 400 for missing artist name", async () => {
    const response = await request(app).get("/search_tracks");
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error");
  });
});