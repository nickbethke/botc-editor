export enum AvailableLanguages {
	'en',
	'de',
	'fr',
}

export interface LanguageSchema {
	lang?: string;
	data?: [string, string][];
}

class TranslationHelper {
	private lang: AvailableLanguages;

	public missingTranslations: Map<string, boolean>;

	private loadedLanguage: Map<string, string>;

	constructor(lang: AvailableLanguages) {
		this.lang = lang;
		this.loadedLanguage = new Map<string, string>();
		this.missingTranslations = new Map();
		this.setLanguageJSON();
	}

	public translate(str: string): string {
		if (this.loadedLanguage.has(str)) {
			return this.loadedLanguage.get(str) || str;
		}
		this.missingTranslations.set(str, true);
		console.warn(`Missing translation for "${str}"`);
		let missing = '';
		this.missingTranslations.forEach((v, k) => {
			missing += `["${k}", ""],\n`;
		});
		console.log(missing);
		return str;
	}

	public translateVars(str: string, p: string[]): string {
		let trStr = this.translate(str);
		p.forEach((v, i) => {
			trStr = trStr.replace(new RegExp(`\\{${i}\\}`, 'g'), v);
		});
		return trStr;
	}

	private setLanguageJSON() {
		window.electron.file
			.getTranslation(AvailableLanguages[this.lang])
			.then((content) => {
				const json = JSON.parse(content) as LanguageSchema;
				this.loadedLanguage = new Map<string, string>(json.data);
				return null;
			})
			.catch(() => {
			});
	}

	public switchLanguage(lang: AvailableLanguages) {
		return new Promise<void>((resolve, reject) => {
			window.electron.file
				.getTranslation(AvailableLanguages[lang])
				.then((content) => {
					this.lang = lang;
					const json = JSON.parse(content) as LanguageSchema;
					this.loadedLanguage = new Map<string, string>(json.data);
					resolve();
					return null;
				})
				.catch(() => {
					reject();
				});
		});
	}

	static stringToEnum(language: string): AvailableLanguages {
		switch (language) {
			case 'de':
			default:
				return AvailableLanguages.de;
			case 'en':
				return AvailableLanguages.en;
			case 'fr':
				return AvailableLanguages.fr;
		}
	}

	static enumToString(value: AvailableLanguages) {
		switch (value) {
			case AvailableLanguages.de:
			default:
				return 'de';
			case AvailableLanguages.en:
				return 'en';
			case AvailableLanguages.fr:
				return 'fr';
		}
	}
}

export default TranslationHelper;
