export interface SettingsInterface {
	darkMode: boolean;
	language: 'en' | 'de';
	popupsDraggable: boolean;

	[k: string]: unknown;
}
