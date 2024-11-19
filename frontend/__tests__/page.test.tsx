import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../src/app/page";

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () =>
      Promise.resolve({
        total_songs: 1,
        songs: [
          {
            song_id: 12345,
            album_name: "Pure Heroine",
            song_name: "Royals",
            preview_url: "https://example.com/preview.mp3",
            release_date: "2013-09-27",
            price: { value: 1.29, currency: "USD" },
          },
        ],
      }),
  } as Response)
);

describe("App Component - Search Functionality", () => {
  it("renders search results when a valid artist is searched", async () => {
    const { getByPlaceholderText, getByText, findByText } = render(<App />);

    const input = getByPlaceholderText(
      "Enter artist or band name"
    ) as HTMLInputElement;
    Object.defineProperty(input, "value", { value: "Lorde", writable: true });

    const inputEvent = new Event("input", { bubbles: true });
    input.dispatchEvent(inputEvent);

    const button = getByText("Search");
    button.click();

    const track = await findByText("Royals");
    expect(track).toBeInTheDocument();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
