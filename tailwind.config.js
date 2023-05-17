const tailwindcss = require('tailwindcss');
const tailwindcssNesting = require('tailwindcss/nesting');
const autoprefixer = require('autoprefixer');
/**
 * Tailwind Settings
 * @type {{plugins: (*|postcss.PluginCreator<string | Config | {config: string | Config}>|{Config: any, readonly default: postcss.PluginCreator<string | Config | {config: string | Config}>}|autoprefixer|((options?: autoprefixer.Options) => (postcss.Plugin & autoprefixer.ExportedAPI))|((browsers: string[], options?: autoprefixer.Options) => (postcss.Plugin & autoprefixer.ExportedAPI))|(<T extends string[]>(...args: [...T, autoprefixer.Options]) => (postcss.Plugin & autoprefixer.ExportedAPI)))[], theme: {extend: {fontFamily: {mono: string[], lato: string[], flicker: string[], jetbrains: string[]}, transitionProperty: {spacing: string, 'font-size': string, height: string}, colors: {background: {'100': string, '200': string, '300': string, '400': string, '500': string, '600': string, '700': string, '800': string, '900': string, '50': string, DEFAULT: string}, accent: {'100': string, '200': string, '300': string, '400': string, '500': string, '600': string, '700': string, '800': string, '900': string, '50': string, DEFAULT: string}, muted: {'100': string, '200': string, '300': string, '400': string, '500': string, '600': string, '700': string, '800': string, '900': string, '50': string, DEFAULT: string}}}}, darkMode: string, variants: {}, content: string[]}}
 */
module.exports = {
	darkMode: 'class',
	content: ['./src/**/*.{html,js,tsx,ejs}'],
	theme: {
		extend: {
			fontFamily: {
				lato: ['Lato', 'sans-serif'],
				mono: ['Consolas', 'Liberation Mono', 'Menlo', 'Courier', 'monospace'],
				jetbrains: ['JetBrains Mono', 'Consolas', 'Liberation Mono', 'Menlo', 'Courier', 'monospace'],
				flicker: ['flicker', 'sans-serif'],
			},
			colors: {
				background: {
					DEFAULT: '#010311',
					50: '#4F64F5',
					100: '#3C53F4',
					200: '#1631F1',
					300: '#0C25D2',
					400: '#0A1EAB',
					500: '#081785',
					600: '#06115E',
					700: '#030A38',
					800: '#010311',
					900: '#000000',
				},
				accent: {
					DEFAULT: '#71C294',
					50: '#D5EDDF',
					100: '#C7E7D5',
					200: '#AADBBF',
					300: '#8ECEAA',
					400: '#71C294',
					500: '#4BB077',
					600: '#3B885C',
					700: '#2A6142',
					800: '#193A27',
					900: '#08130D',
				},
				muted: {
					DEFAULT: '#6B808E',
					50: '#D3D9DE',
					100: '#C7CFD5',
					200: '#B0BCC3',
					300: '#99A8B2',
					400: '#8194A0',
					500: '#6B808E',
					600: '#53636E',
					700: '#3B464E',
					800: '#23292E',
					900: '#0B0D0E',
				},
			},
			transitionProperty: {
				height: 'height',
				spacing: 'margin, padding',
				'font-size': 'font-size',
			},
		},
	},
	variants: {},
	plugins: [tailwindcssNesting, tailwindcss, autoprefixer],
};
