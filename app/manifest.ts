import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TimeX - Visual Clock, Timer, and Stopwatch",
    short_name: "TimeX",
    description:
      "A clean visual clock, countdown timer, and stopwatch with a smooth progress bar, custom durations, and fullscreen focus mode.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
