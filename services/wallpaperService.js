import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export const requestMediaPermission = async () => {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  return status === 'granted';
};

export const saveWallpaperToGallery = async (wallpaper) => {
  try {
    const granted = await requestMediaPermission();
    if (!granted) return { success: false, message: 'Permission denied' };

    const svgContent = generateWallpaperSVG(wallpaper);
    const fileUri = FileSystem.cacheDirectory + `${wallpaper.id}.png`;

    await FileSystem.writeAsStringAsync(fileUri, svgContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    await MediaLibrary.saveToLibraryAsync(fileUri);
    return { success: true, message: 'Saved to gallery!' };
  } catch (e) {
    return { success: false, message: 'Failed to save' };
  }
};

export const shareWallpaper = async (wallpaper) => {
  try {
    const available = await Sharing.isAvailableAsync();
    if (!available) return { success: false, message: 'Sharing not available' };

    const svgContent = generateWallpaperSVG(wallpaper);
    const fileUri = FileSystem.cacheDirectory + `${wallpaper.id}.svg`;

    await FileSystem.writeAsStringAsync(fileUri, svgContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    await Sharing.shareAsync(fileUri, {
      mimeType: 'image/svg+xml',
      dialogTitle: `Share ${wallpaper.title}`,
    });

    return { success: true };
  } catch (e) {
    return { success: false, message: 'Failed to share' };
  }
};

const generateWallpaperSVG = (wallpaper) => {
  const isStatus = wallpaper.category === 'status';
  const width = isStatus ? 1080 : 1080;
  const height = isStatus ? 1920 : 1920;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${wallpaper.gradient[0]};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${wallpaper.gradient[1]};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <circle cx="${width / 2}" cy="${height / 2 - 100}" r="300" fill="${wallpaper.color}" fill-opacity="0.15"/>
  <circle cx="${width / 2}" cy="${height / 2 - 100}" r="200" fill="${wallpaper.color}" fill-opacity="0.2"/>
  <text x="${width / 2}" y="${height / 2 + 200}" font-family="serif" font-size="80" fill="white" text-anchor="middle" opacity="0.9">${wallpaper.title}</text>
  <text x="${width / 2}" y="${height / 2 + 320}" font-family="serif" font-size="48" fill="white" text-anchor="middle" opacity="0.6">${wallpaper.deity}</text>
  <text x="${width / 2}" y="${height - 120}" font-family="sans-serif" font-size="36" fill="white" text-anchor="middle" opacity="0.4">Bharat Bhakti</text>
</svg>`;
};