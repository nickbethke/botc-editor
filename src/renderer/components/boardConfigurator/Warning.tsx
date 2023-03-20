import React from 'react';
import _uniqueId from 'lodash/uniqueId';
import { BoardPosition } from '../generator/interfaces/boardPosition';

export enum Warnings {
	pathImpossible,
	configurationInvalid,
}

export type WarningsMap = Map<
	string,
	{
		type: Warnings;
		title: string;
		content: string;
		helper?: string[];
		fields?: BoardPosition[];
	}
>;

export type WarningProps = {
	title: string;
	content: string;
	helper?: string[];
	fields?: BoardPosition[];
	onFieldSelect: (position: BoardPosition) => void;
};

function Warning(props: WarningProps) {
	const { title, content, helper, fields, onFieldSelect } = props;
	return (
		<div className="m-2 text-sm border dark:border-muted-700 border-muted-400 rounded flex flex-col dark:bg-muted-800 bg-muted-600">
			<div className="border-b dark:border-muted-700 border-muted-400 px-2 py-1">
				{title}
			</div>
			<div className="px-2 py-1">{content}</div>
			{fields ? (
				<div className="flex gap-2 px-2 py-1 mb-2">
					{fields.map((field) => (
						<button
							type="button"
							key={_uniqueId('warning-helper-')}
							className="px-2 py-1 rounded dark:bg-muted-700 dark:hover:bg-muted-600 bg-muted-400 hover:bg-muted-300 text-[12px]"
							onClick={() => {
								onFieldSelect(field);
							}}
						>
							{window.languageHelper.translate('Field')}: [
							{field.x}, {field.y}]
						</button>
					))}
				</div>
			) : null}
			{helper ? (
				<div className="flex gap-2 px-2 py-1 mb-2">
					{helper.map((help) => (
						<div
							key={_uniqueId('warning-helper-')}
							className="px-2 py-1 rounded dark:bg-muted-700 bg-muted-400 text-[12px]"
						>
							{help}
						</div>
					))}
				</div>
			) : null}
		</div>
	);
}

Warning.defaultProps = {
	helper: null,
	fields: null,
};
export default Warning;
