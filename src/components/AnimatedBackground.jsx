"use client";

import { useEffect, useState } from "react";

const TILE = 1024; // size of one repeating star tile (px)

// 3 star layers: bigger stars move slower, just like the original
const layers = [
  { count: 270, radius: 0.7, seconds: 40 },
  { count: 110, radius: 1.1, seconds: 50 },
  { count: 30, radius: 1.6, seconds: 70 },
];

// a few shooting stars with different positions and timing
const shootingStars = [
  { right: "10%", bottom: "-5%", delay: "0s", seconds: 9 },
  { right: "45%", bottom: "-5%", delay: "4s", seconds: 12 },
  { right: "-5%", bottom: "35%", delay: "7s", seconds: 10 },
];

// draws random white dots on a canvas and returns it as an image URL
function makeStarTile(count, radius) {
  const canvas = document.createElement("canvas");
  canvas.width = TILE;
  canvas.height = TILE;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";

  for (let i = 0; i < count; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * TILE, Math.random() * TILE, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  return canvas.toDataURL("image/png");
}

export default function AnimatedBackground() {
  const [tiles, setTiles] = useState([]);

  // stars are created after the page loads (browser only), so there is no hydration mismatch
  useEffect(() => {
    setTiles(
      layers.map((layer) => ({
        url: makeStarTile(layer.count, layer.radius),
        seconds: layer.seconds,
      })),
    );
  }, []);

  return (
    <div className="sky" aria-hidden="true">
      {tiles.map((tile, index) => (
        <div
          key={index}
          className="star-layer"
          style={{
            "--tile": `${TILE}px`,
            backgroundImage: `url(${tile.url})`,
            backgroundSize: `${TILE}px ${TILE}px`,
            animationDuration: `${tile.seconds}s`,
          }}
        />
      ))}

      {shootingStars.map((star, index) => (
        <div
          key={index}
          className="shooting-star"
          style={{
            right: star.right,
            bottom: star.bottom,
            animationDelay: star.delay,
            animationDuration: `${star.seconds}s`,
          }}
        />
      ))}
    </div>
  );
}
