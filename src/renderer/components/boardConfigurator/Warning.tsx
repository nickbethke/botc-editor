import React from 'react';
import _uniqueId from 'lodash/uniqueId';
import { TrashIcon } from '@radix-ui/react-icons';
import { BoardPosition } from '../generator/interfaces/BoardPosition';
import { Position } from '../../../interfaces/BoardConfigInterface';
import { FieldsEnum } from '../generator/BoardGenerator';
import Button from '../Button';

/**
 * The board configurator warnings type
 */
export enum Warnings {
	pathImpossible,
	configurationInvalid,
}

/**
 * The board configurator warnings map
 */
export type WarningsMap = Map<
	string,
	{
		type: Warnings;
		title: string;
		content: string;
		helper?: string[];
		fields?: BoardPosition[];
		removeWall?: Position[];
		removeField?: { position: BoardPosition; type: FieldsEnum };
	}
>;
/**
 * The board configurator warnings component properties
 */
export type WarningProps = {
	title: string;
	content: string;
	helper?: string[];
	fields?: BoardPosition[];
	onFieldSelect: (position: BoardPosition) => void;
	removeWall?: Position[] | null;
	onRemoveWall: (position: Position[]) => void;
	removeField?: { position: BoardPosition; type: FieldsEnum } | null;
	onRemoveField: (field: { position: BoardPosition; type: FieldsEnum }) => void;
};

/**
 * The board configurator warnings component
 * @param props
 * @constructor
 */
function Warning(props: WarningProps) {
	const { title, content, helper, fields, onFieldSelect, removeWall, onRemoveWall, removeField, onRemoveField } = props;

	const fieldEnumToString = (fieldEnum: FieldsEnum) => {
		switch (fieldEnum) {
			case FieldsEnum.EYE:
				return 'field';
			case FieldsEnum.CHECKPOINT:
			case FieldsEnum.DESTINY_MOUNTAIN:
				return 'checkpoint';
			case FieldsEnum.LEMBAS:
				return 'lembas';
			case FieldsEnum.RIVER:
				return 'river';
			case FieldsEnum.START:
				return 'start';
			case FieldsEnum.HOLE:
				return 'hole';
			default:
				return '';
		}
	};

	return (
		<div className="m-2 text-sm border dark:border-muted-700 border-muted-400 rounded flex flex-col dark:bg-muted-800 bg-muted-600">
			<div className="border-b dark:border-muted-700 border-muted-400 px-2 py-1">{title}</div>
			<div className="px-2 py-1">{content}</div>
			{fields ? (
				<div className="flex gap-2 px-2 py-1 mb-2">
					{fields.map((field) => (
						<Button
							buttonType="secondary"
							key={_uniqueId('warning-helper-')}
							className="px-2 py-1"
							onClick={() => {
								onFieldSelect(field);
							}}
							size="sm"
						>
							<p>
								{window.t.translate('Field')}: [{field.x}, {field.y}]
							</p>
						</Button>
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
			{removeWall ? (
				<div className="flex gap-2 px-2 py-1 mb-2">
					<Button
						key={_uniqueId('warning-remove-wall-')}
						onClick={() => {
							onRemoveWall(removeWall);
						}}
						className="px-2 py-1"
						buttonType="secondary"
						size="sm"
						icon={<TrashIcon />}
					>
						{window.t.translate('Remove wall')}
					</Button>
				</div>
			) : null}
			{removeField ? (
				<div className="flex gap-2 px-2 py-1 mb-2">
					<Button
						key={_uniqueId('warning-remove-field-')}
						onClick={() => {
							onRemoveField(removeField);
						}}
						className="px-2 py-1"
						buttonType="secondary"
						size="sm"
						icon={<TrashIcon />}
					>
						{window.t.translateVars('Remove {0} field', [fieldEnumToString(removeField.type)])}{' '}
					</Button>
				</div>
			) : null}
		</div>
	);
}

/**
 * The board configurator warnings component default properties
 */
Warning.defaultProps = {
	helper: null,
	fields: null,
	removeWall: null,
	removeField: null,
};
export default Warning;
