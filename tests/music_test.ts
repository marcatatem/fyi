import { assertEquals } from "std/assert/mod.ts";
import { getReleasedTracks } from "html/music.tsx";
import type { Release } from "main.ts";

const release = (title: string, artist: string, releaseDate: string): Release => ({
  title,
  artist,
  releaseDate,
  cover: "releases/test.jpg",
  pixel: "123",
  links: [],
});

Deno.test("music catalog excludes unreleased tracks and playlists", () => {
  const releases = [
    release("Future", "Marca", "2026-11-26T08:00:00.000Z"),
    release("Released", "Marca", "2026-11-01T08:00:00.000Z"),
    release("Playlist", "Various", "2026-10-01T08:00:00.000Z"),
  ];

  const tracks = getReleasedTracks(releases, Date.parse("2026-11-14T08:00:00.000Z"));

  assertEquals(tracks.map((track) => track.title), ["Released"]);
});

Deno.test("music catalog orders released tracks newest first", () => {
  const releases = [
    release("Older", "Marca", "2026-01-01T08:00:00.000Z"),
    release("Newer", "Marca", "2026-06-01T08:00:00.000Z"),
  ];

  const tracks = getReleasedTracks(releases, Date.parse("2026-11-14T08:00:00.000Z"));

  assertEquals(tracks.map((track) => track.title), ["Newer", "Older"]);
});
