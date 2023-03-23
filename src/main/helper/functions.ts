import { app } from 'electron';
import path from 'path';
import fs from 'fs';

export function getAppDataPath(...paths: string[]): string {
	const appDataPath = app.isPackaged
		? path.join(app.getPath('appData'), 'botc-editor/')
		: path.join(__dirname, '../../../appData');
	if (!fs.existsSync(appDataPath)) {
		fs.mkdirSync(appDataPath);
	}
	return path.join(appDataPath, ...paths);
}

export default {};
