# PayloadCMS GIF Feature

A PayloadCMS Lexical editor plugin that allows users to search and insert GIFs from Giphy directly into the rich text editor.

## Features

- 🔍 **Search Functionality**: Search for GIFs using Giphy's API
- 🎯 **Trending GIFs**: Shows trending GIFs by default
- ♾️ **Lazy Loading**: Implements infinite scroll for better performance
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **Real-time Search**: Debounced search with 500ms delay
- 🖼️ **Preview**: Shows GIF previews before insertion
- 📝 **Alt Text**: Automatically sets alt text based on GIF title
- 💾 **Serialization**: Supports HTML and Markdown conversion

## Installation

```bash
npm install @joshuademarco/payload-gifs
# or
yarn add @joshuademarco/payload-gifs
# or
pnpm add @joshuademarco/payload-gifs
```

## Setup

### 1. Environment Variables

Add your Giphy API key to your environment variables:

```bash
NEXT_PUBLIC_GIPHY_API_KEY=your_giphy_api_key_here
```

You can get a free API key from [Giphy Developers](https://developers.giphy.com/).

### 2. Add to Lexical Editor

Import and add the feature to your lexical editor configuration:

```typescript
import { GifFeature } from '@joshuademarco/payload-gifs'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export default {
  // ... your collection config
  fields: [
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({
        features: [
          // ... other features
          GifFeature,
        ],
      }),
    },
  ],
}
```

## Usage

1. **Insert GIF**: Click the GIF icon in the toolbar
2. **Search**: Type in the search box to find specific GIFs
3. **Browse**: Scroll through trending GIFs
4. **Select**: Click on any GIF to insert it into the editor
5. **Lazy Loading**: Scroll down to load more GIFs automatically

## File Structure

```
src/features/gif/
├── feature.server.ts      # Server-side feature configuration
├── feature.client.ts      # Client-side feature configuration
├── nodes/
│   └── GifNode.tsx       # Lexical node for GIF elements
├── component/
│   ├── GifComponent.tsx  # React component for displaying GIFs
│   └── GifDialog.tsx     # Dialog for searching and selecting GIFs
├── plugin/
│   └── GifPlugin.tsx     # Lexical plugin for GIF functionality
└── icons/
    └── GifIcon.tsx       # Icon for the toolbar button
```

## API Integration

The feature integrates with Giphy's API using the following endpoints:

- **Trending GIFs**: `https://api.giphy.com/v1/gifs/trending`
- **Search GIFs**: `https://api.giphy.com/v1/gifs/search`

### Rate Limits

Giphy's free tier includes:
- 1000 requests per hour
- 42 requests per minute

For production applications, consider upgrading to a paid plan for higher limits.

## Customization

### Styling

The GIF dialog and components use inline styles for maximum compatibility. You can customize the appearance by:

1. Adding CSS classes to the components
2. Using CSS-in-JS libraries
3. Modifying the inline styles directly

### Search Parameters

You can modify the search parameters in `GifDialog.tsx`:

```typescript
const params = new URLSearchParams({
  api_key: GIPHY_API_KEY,
  limit: LIMIT.toString(),
  offset: currentOffset.toString(),
  rating: 'g', // Change rating: g, pg, pg-13, r
  lang: 'en', // Change language
})
```

### GIF Quality

The feature uses different image qualities:
- **Preview**: `preview_gif` for the dialog grid
- **Final**: `original` for the inserted GIF

You can modify this in the `handleGifSelect` function.

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify your Giphy API key is correct
   - Check that the environment variable is properly loaded

2. **GIFs Not Loading**
   - Check browser console for network errors
   - Verify CORS settings if hosting on a different domain

3. **Performance Issues**
   - Reduce the `LIMIT` constant for fewer GIFs per request
   - Implement image compression for preview thumbnails

### Browser Compatibility

The feature uses modern web APIs:
- Intersection Observer (for lazy loading)
- Fetch API (for Giphy requests)
- ES6+ features

For older browser support, consider adding polyfills.

## Contributing

To extend this feature:

1. **Add New GIF Sources**: Modify the API endpoints in `GifDialog.tsx`
2. **Enhance UI**: Update the dialog styling and layout
3. **Add Filters**: Implement category or size filters
4. **Improve Performance**: Add caching or compression

## License

This feature is part of your PayloadCMS project and follows the same licensing terms.
