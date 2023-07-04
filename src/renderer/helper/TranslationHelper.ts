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

	private loadedLanguage: Map<string, string>;

	constructor(lang: AvailableLanguages, test?: boolean) {
		this.lang = lang;
		this.loadedLanguage = new Map<string, string>();
		if (!test) this.setLanguageJSON();
	}

	public translate(str: string): string {
		if (this.loadedLanguage.has(str)) {
			return this.loadedLanguage.get(str) ?? str;
		}
		console.warn(`Translation for ${str} not found!`);
		console.log(JSON.stringify([str, '']));
		return str;
	}

	public translateVars(str: string, p: any[]): string {
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
			.catch(() => {});
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
			case 'en':
				return AvailableLanguages.en;
			case 'fr':
				return AvailableLanguages.fr;
			case 'de':
			default:
				return AvailableLanguages.de;
		}
	}

	static enumToString(value: AvailableLanguages) {
		switch (value) {
			case AvailableLanguages.en:
				return 'en';
			case AvailableLanguages.fr:
				return 'fr';
			case AvailableLanguages.de:
			default:
				return 'de';
		}
	}
}

export default TranslationHelper;
