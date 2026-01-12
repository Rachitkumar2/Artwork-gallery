# Artwork Gallery

A React application displaying artwork data from the Art Institute of Chicago API with server-side pagination and persistent row selection.

## Features

- **Data Table**: Displays artwork information including title, place of origin, artist, inscriptions, and dates
- **Server-Side Pagination**: Fetches data page by page from the API
- **Row Selection**: Select individual rows or all rows on current page
- **Custom Selection**: Select a specific number of rows across all pages using the dropdown menu
- **Persistent Selection**: Selections are maintained when navigating between pages

## Technologies Used

- React with TypeScript
- Vite
- PrimeReact DataTable
- Art Institute of Chicago API

## Project Structure

```
src/
├── components/
│   └── ArtworkTable.tsx
├── types/
│   └── artwork.ts
├── App.tsx
├── App.css
└── main.tsx
```

## Live Demo
[text](https://artwork-ga.netlify.app/)


