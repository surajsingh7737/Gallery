# Gallery Project

A responsive photo gallery built with React. It fetches photos from an API, shows them in a clean grid, and lets you browse, search, preview, and save your favorites.

![Gallery Screenshot](./screenshot.png)

**Live demo:** [add your link here]

## Features

- **Pagination:** Prev, Next, and numbered pages, with 12, 24, or 48 photos per page
- **Shareable pages:** the page number is saved in the URL (`?page=3`), so a refresh keeps your place
- **Image preview:** click any photo to open it large, then move between photos with the arrow keys and close with `Esc`
- **Favorites:** tap the heart to save photos, and they stay after you refresh (saved in `localStorage`)
- **Search:** filter photos on the current page by photographer name
- **Loading and error states:** skeleton loaders while photos load, and a "Try again" screen if the network fails
- **Optimized images:** lazy loading and resized thumbnails for faster loading
- **Responsive design:** works on mobile, tablet, and desktop
- **Accessible:** keyboard navigation, focus styles, and alt text on images

## Tech Stack

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Axios](https://axios-http.com/)
- [Lucide React](https://lucide.dev/) for icons
- [Picsum Photos API](https://picsum.photos/)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher)

### Installation

1. Clone the repository

```bash
git clone https://github.com/your-username/gallery-project.git
```

2. Go into the project folder

```bash
cd gallery-project
```

3. Install dependencies

```bash
npm install
```

4. Start the development server

```bash
npm run dev
```

5. Open `http://localhost:5173` in your browser

### Build for production

```bash
npm run build
```

## Project Structure

```
gallery-project/
├── src/
│   ├── components/
│   │   └── Card.jsx      # Photo card and skeleton loader
│   ├── App.jsx           # Main app: data fetching, pagination, search, favorites, lightbox
│   ├── main.jsx
│   └── index.css
├── index.html
└── package.json
```

## What I Learned

- Fetching data from an API with **Axios** (query params, async/await, error handling)
- Managing data with **useState** (photos, page, loading status, search text)
- Running side effects with **useEffect** and its dependency array
- Cancelling old requests with `AbortController` so fast page clicks don't show wrong data
- Building loading, error, and empty states
- Saving data in the browser with `localStorage`
- Designing a responsive layout with **Tailwind CSS**

## Future Improvements

- Infinite scroll as an option
- Photo categories and filters
- Dark and light theme toggle
- Download button for photos
- Unit tests

## Credits

Photos are provided by [Lorem Picsum](https://picsum.photos/), and the original images come from [Unsplash](https://unsplash.com/) photographers.

## Author

**Your Name**

- GitHub: [@your-username](https://github.com/your-username)
- LinkedIn: [your-name](https://linkedin.com/in/your-name)

---

If you like this project, give it a star on GitHub.