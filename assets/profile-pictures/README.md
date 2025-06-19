# Profile Pictures

This folder contains the profile picture assets for the iQuery MMPC application.

## Folder Structure

### `/presets`

Contains default profile picture options that users can select from. These are pre-designed avatars that work well with the app's theme system.

**Naming Convention:** `preset-{number}.png` (e.g., `preset-1.png`, `preset-2.png`)

**Requirements:**

- Format: PNG with transparency support
- Size: 200x200 pixels (minimum)
- Aspect Ratio: 1:1 (square)
- File Size: < 500KB per image

### `/custom`

Used for storing user-uploaded custom profile pictures. This folder is automatically managed by the app.

**Note:** Files in this folder are managed by the application and should not be manually edited.

## For Developers

### Adding New Preset Images

1. Create or obtain square (1:1 aspect ratio) images
2. Resize to at least 200x200 pixels
3. Save as PNG format with transparency if needed
4. Name using the convention: `preset-{number}.png`
5. Place in the `/presets` folder
6. Update the `PRESET_PROFILES` array in the dashboard component

### Supported Formats

- PNG (recommended for transparency)
- JPG/JPEG (for photos)
- WebP (for smaller file sizes)

### Image Guidelines

- Use high-quality images that look good at small sizes
- Consider the app's theme colors when designing presets
- Ensure images work well with both light and dark themes
- Test images with different tier color schemes

## Current Presets

The following preset images should be added to the `/presets` folder:

1. `preset-1.png` - Default avatar (male)
2. `preset-2.png` - Default avatar (female)
3. `preset-3.png` - Business professional (male)
4. `preset-4.png` - Business professional (female)
5. `preset-5.png` - Casual avatar (male)
6. `preset-6.png` - Casual avatar (female)
7. `preset-7.png` - Abstract geometric design
8. `preset-8.png` - Minimalist design
9. `preset-9.png` - Corporate style
10. `preset-10.png` - Modern flat design

## Implementation Notes

- The dashboard component automatically loads presets from this folder
- Custom images are saved to `/custom` with user-specific naming
- Profile pictures are cached locally using AsyncStorage
- Images are automatically resized and optimized when uploaded
