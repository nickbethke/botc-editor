/**
 * The settings interface
 */
export interface SettingsInterface {
	darkMode: boolean;
	language: string;
	popupsDraggable: boolean;
	defaultValues: {
		defaultBoardName: string;
		maxBoardSize: number;
		maxCheckpoints: number;
		maxLembasFields: number;
		maxLembasCount: number;
		maxHoles: number;
		maxEagleFields: number;
	};
}
