export enum AvailableLanguages {
	'en',
	'de',
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
		return new Promise<void>((resolve) => {
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
		}
	}
}

export default TranslationHelper;
