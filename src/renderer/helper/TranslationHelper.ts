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

	private loadedLanguage: Map<string, string>;

	constructor(lang: AvailableLanguages) {
		this.lang = lang;
		this.loadedLanguage = new Map<string, string>();
		this.setLanguageJSON();
	}

	public translate(str: string): string {
		if (this.loadedLanguage.has(str)) {
			return this.loadedLanguage.get(str) || str;
		}
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
			.catch(console.log);
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
				.catch(console.log);
		});
	}
}

export default TranslationHelper;
