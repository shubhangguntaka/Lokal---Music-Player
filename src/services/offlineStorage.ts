import * as FileSystem from 'expo-file-system/legacy';

const DOWNLOADS_DIR = `${FileSystem.documentDirectory ?? ''}downloads`;

const sanitizeTrackId = (trackId: string) =>
	trackId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);

const getTrackFileUri = (trackId: string) =>
	`${DOWNLOADS_DIR}/${sanitizeTrackId(trackId)}.mp3`;

const ensureDownloadsDirectory = async () => {
	if (!FileSystem.documentDirectory) {
		throw new Error('File system document directory is unavailable.');
	}

	await FileSystem.makeDirectoryAsync(DOWNLOADS_DIR, { intermediates: true });
};

export const offlineTrackExists = async (fileUri?: string): Promise<boolean> => {
	if (!fileUri) {
		return false;
	}

	try {
		const info = await FileSystem.getInfoAsync(fileUri);
		return Boolean(info.exists);
	} catch {
		return false;
	}
};

export const downloadTrackForOffline = async (
	trackId: string,
	sourceUrl: string,
): Promise<string> => {
	await ensureDownloadsDirectory();

	const targetUri = getTrackFileUri(trackId);
	await FileSystem.downloadAsync(sourceUrl, targetUri);
	return targetUri;
};

export const deleteOfflineTrack = async (fileUri: string): Promise<void> => {
	await FileSystem.deleteAsync(fileUri, { idempotent: true });
};
