type Styles = Record<string, string>;

declare module '*.svg' {
	export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;

	const content: string;
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	export default content;
}

declare module '*.png' {
	const content: string;
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	export default content;
}

declare module '*.gif' {
	const content: string;
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	export default content;
}

declare module '*.jpg' {
	const content: string;
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	export default content;
}

declare module '*.scss' {
	const content: Styles;
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	export default content;
}

declare module '*.sass' {
	const content: Styles;
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	export default content;
}

declare module '*.css' {
	const content: Styles;
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	export default content;
}

declare module '*.json' {
	const content: object;
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	export default content;
}
