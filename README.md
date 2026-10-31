# 📸 Photo Gallery - Multi-Format Image Replacement Guide

Simply place your own photos into this folder (`assets/images/gallery/`) to replace the placeholders!

---

## 🎨 Supported Image Formats

All **four** major web image formats are fully supported:
- **`.jpg`**
- **`.jpeg`**
- **`.png`**
- **`.webp`**

You do **not** need to convert all images to the same format — different cards can use different extensions (e.g. `photo1.png`, `photo2.jpeg`, `photo3.webp`, `photo4.jpg`).

---

## 🖼️ How It Works (Zero Coding Required!)

Each photo file in this folder corresponds to a specific card in the website gallery.
The gallery automatically detects your photos using **either** of these two naming styles:
- `photo1.jpg` / `photo1.jpeg` / `photo1.png` / `photo1.webp`
- OR simply `1.jpg` / `1.jpeg` / `1.png` / `1.webp`

| Card Slot | Supported File Names | Memory Theme / Caption |
| :---: | :--- | :--- |
| **Card #1** | `photo1.jpg` / `.jpeg` / `.png` / `.webp` (or `1.*`) | Coffee dates & endless gossip ☕ |
| **Card #2** | `photo2.jpg` / `.jpeg` / `.png` / `.webp` (or `2.*`) | Golden hour and your radiant smile ✨ |
| **Card #3** | `photo3.jpg` / `.jpeg` / `.png` / `.webp` (or `3.*`) | Unstoppable laughter & silly selfies 📸 |
| **Card #4** | `photo4.jpg` / `.jpeg` / `.png` / `.webp` (or `4.*`) | Celebrating you, the birthday queen 👑 |
| **Card #5** | `photo5.jpg` / `.jpeg` / `.png` / `.webp` (or `5.*`) | Partners in crime through thick and thin 👯‍♀️ |
| **Card #6** | `photo6.jpg` / `.jpeg` / `.png` / `.webp` (or `6.*`) | To a lifetime more of beautiful memories 🥂 |
| **Card #7** | `photo7.jpg` / `.jpeg` / `.png` / `.webp` (or `7.*`) | Late night dessert & ice cream runs 🍦 |
| **Card #8** | `photo8.jpg` / `.jpeg` / `.png` / `.webp` (or `8.*`) | Road trips & singing off-key 🚗🎶 |
| **Card #9** | `photo9.jpg` / `.jpeg` / `.png` / `.webp` (or `9.*`) | Picnics in the park & flower crowns 🌸🧺 |
| **Card #10** | `photo10.jpg` / `.jpeg` / `.png` / `.webp` (or `10.*`) | Rainy days & cozy warm tea 🌧️🫖 |
| **Card #11** | `photo11.jpg` / `.jpeg` / `.png` / `.webp` (or `11.*`) | Movie marathons & popcorn fights 🍿🎬 |
| **Card #12** | `photo12.jpg` / `.jpeg` / `.png` / `.webp` (or `12.*`) | Beach days, ocean waves & sand 🌊🏖️ |
| **Card #13** | `photo13.jpg` / `.jpeg` / `.png` / `.webp` (or `13.*`) | Cooking disasters & sweet treats 🧁👩‍🍳 |
| **Card #14** | `photo14.jpg` / `.jpeg` / `.png` / `.webp` (or `14.*`) | Stargazing & sharing our dreams 🌌✨ |
| **Card #15** | `photo15.jpg` / `.jpeg` / `.png` / `.webp` (or `15.*`) | Photobooth strips & goofy poses 🎀📸 |
| **Card #16** | `photo16.jpg` / `.jpeg` / `.png` / `.webp` (or `16.*`) | Forever my best friend, happy birthday! 💖🎉 |

---

## 💡 Quick Tips

1. **Original Quality Preserved**: Photos are never compressed, downsampled, or modified. Full native resolution is preserved in the lightbox.
2. **Natural Colors & Contrast**: Images render with native contrast against clean, glare-free dark backdrops without washed-out filters or white overlays.
3. **Automatic Extension Detection**: If you drop `photo3.png` into this folder, the website automatically finds and displays it on Card #3.
4. **Lightbox & Slideshow**: The full-screen lightbox and automatic slideshow automatically use whichever format your image is in.
5. **Missing Photos / Fallback**: If an image is missing or cannot be loaded, the website automatically displays a cute pastel artwork placeholder instead of a broken image.
6. **Captions**: To edit captions or dates, open `js/config.js`.
