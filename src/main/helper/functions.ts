import { app } from 'electron';
import path from 'path';
import fs from 'fs';

/**
 * Generates an absolute path to the app's data path with the paths.
 * @param paths
 */
export function getAppDataPath(...paths: string[]): string {
	const appDataPath = app.isPackaged
		? path.join(app.getPath('documents'), 'botc-editor')
		: path.join(__dirname, '../../../appData');
	if (!fs.existsSync(appDataPath)) {
		fs.mkdirSync(appDataPath);
	}
	return path.join(appDataPath, ...paths);
}

export default {};
