import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Extracts the public ID from a Cloudinary URL.
 * Handles standard URLs and those with folders.
 */
export function getPublicIdFromUrl(url: string): string | null {
    try {
        if (!url.includes('cloudinary.com')) return null;

        // Split by '/'
        const parts = url.split('/');

        // Find the index of 'upload'
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex === -1) return null;

        // The parts after 'upload' are version (optional) and public_id
        // Version usually starts with 'v' followed by numbers
        let publicIdParts = parts.slice(uploadIndex + 1);

        if (publicIdParts[0].match(/^v\d+$/)) {
            publicIdParts = publicIdParts.slice(1);
        }

        // Join the remaining parts to get the full path (folder + filename)
        const fullPath = publicIdParts.join('/');

        // Remove the file extension
        const lastDotIndex = fullPath.lastIndexOf('.');
        if (lastDotIndex === -1) return fullPath;

        return fullPath.substring(0, lastDotIndex);
    } catch (error) {
        console.error('Error extracting public ID:', error);
        return null;
    }
}

/**
 * Deletes a file from Cloudinary using its URL.
 */
export async function deleteFromCloudinary(url: string) {
    if (!url) return;

    const publicId = getPublicIdFromUrl(url);
    if (!publicId) {
        console.warn('Could not extract public ID from URL:', url);
        return;
    }

    try {
        await cloudinary.uploader.destroy(publicId);
        console.log(`Deleted from Cloudinary: ${publicId}`);
    } catch (error) {
        console.error(`Failed to delete from Cloudinary (${publicId}):`, error);
    }
}

/**
 * Deletes a folder and all its contents from Cloudinary.
 */
export async function deleteFolder(folderPath: string) {
    if (!folderPath) return;

    try {
        // Delete all resources in the folder
        await cloudinary.api.delete_resources_by_prefix(folderPath + '/');

        // Delete the folder itself
        await cloudinary.api.delete_folder(folderPath);
        console.log(`Deleted folder from Cloudinary: ${folderPath}`);
    } catch (error) {
        console.error(`Failed to delete folder (${folderPath}):`, error);
    }
}

/**
 * Sanitizes a string to be used as a Cloudinary folder name.
 * Converts to lowercase, replaces spaces with dashes, removes special characters.
 */
export function sanitizeFolderName(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9-]/g, '-') // Replace non-alphanumeric chars with dash
        .replace(/-+/g, '-') // Replace multiple dashes with single dash
        .replace(/^-|-$/g, ''); // Remove leading/trailing dashes
}
