/**
 * The settings interface
 */
export interface SettingsInterface {
	darkMode: boolean;
	language: string;
	popupsDraggable: boolean;

	[k: string]: unknown;
}
