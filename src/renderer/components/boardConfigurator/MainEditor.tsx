import React from 'react';
import _uniqueId from 'lodash/uniqueId';
import { VscArrowDown, VscArrowLeft, VscArrowRight, VscArrowUp, VscEdit } from 'react-icons/vsc';
import { ParsedPath } from 'path';
import BoardConfigInterface, { Direction } from '../interfaces/BoardConfigInterface';
import {
	BoardPosition,
	boardPosition2String,
	wallBoardPosition2String,
	wallConfig2Map,
} from '../generator/interfaces/boardPosition';
import { EditorToolType } from '../../screens/BoardConfiguratorV2';
import { FieldsEnum } from '../generator/BoardGenerator';
import { getDirectionFieldConfig, getFieldType, getLembasFieldConfig, isDestinyMountain } from './HelperFunctions';
import DirectionHelper from '../generator/helper/DirectionHelper';
import ContextMenuV2 from './ContextMenuV2';
import ContextMenuItemV2, { ContextMenuDividerV2 } from './ContextMenuItemV2';

interface FieldTypeOnClickArgs {
	wall: [BoardPosition, BoardPosition];
	field: BoardPosition;
}

export type FieldTypeOnClick = <K extends keyof FieldTypeOnClickArgs>(
	type: K,
	position: FieldTypeOnClickArgs[K]
) => void;

type WallHelperProps = {
	position: [BoardPosition, BoardPosition];
	direction?: 'horizontal' | 'vertical';
	onClick: FieldTypeOnClick;
	editorTool: EditorToolType;
	isWall?: boolean;
	onContextMenu: (contextMenu: JSX.Element | null) => void;
};

function WallHelper(props: WallHelperProps) {
	const { direction, onClick, position, editorTool, isWall, onContextMenu } = props;
	const active = editorTool === 'delete' || editorTool === FieldsEnum.WALL;
	const inactiveClass = 'bg-muted-700 hover:bg-muted-600 hover:cursor-pointer';
	const activeClass = 'bg-accent/40 hover:bg-accent/75 shadow-lg';

	const handleWallContextMenu: React.MouseEventHandler<HTMLDivElement> = (event) => {
		onContextMenu(
			<ContextMenuV2 position={{ x: event.clientX, y: event.clientY }}>
				<ContextMenuItemV2
					text={
						<div className="flex gap-2">
							<span>{window.languageHelper.translate('Position')}:</span>
							<span>
								[{position[0].x}, {position[0].y}]
							</span>
							<span>
								[{position[1].x}, {position[1].y}]
							</span>
						</div>
					}
				/>
			</ContextMenuV2>
		);
	};
	return (
		<div
			key={_uniqueId('wall-helper-')}
			tabIndex={-1}
			role="presentation"
			className={`${
				direction === 'horizontal' ? 'w-16 h-4' : 'w-4 h-16'
			} transition transition-color hover:cursor-pointer rounded ${active ? activeClass : inactiveClass} ${
				isWall ? 'isWall' : ''
			}`}
			onClick={() => {
				if (active) onClick('wall', position);
			}}
			onContextMenu={handleWallContextMenu}
		/>
	);
}

WallHelper.defaultProps = {
	direction: 'vertical',
	isWall: false,
};

type FieldHelperProps = {
	position: BoardPosition;
	onClick: FieldTypeOnClick;
	editorTool: EditorToolType;
	type: FieldsEnum | null;
	inEdit: boolean;
	attribute: null | Direction | number;
	onContextMenu: (contextMenu: JSX.Element | null) => void;
	onChangeToEdit: (position: BoardPosition) => void;
};

export const DirectionArrows: JSX.Element[] = [
	<VscArrowUp strokeWidth={2} />,
	<VscArrowRight strokeWidth={2} />,
	<VscArrowDown strokeWidth={2} />,
	<VscArrowLeft strokeWidth={2} />,
];

function FieldHelper(props: FieldHelperProps) {
	const { position, onClick, editorTool, type, inEdit, attribute, onContextMenu } = props;
	const active = editorTool && (editorTool === 'edit' || (editorTool !== FieldsEnum.WALL && type !== FieldsEnum.EYE));
	let inactiveClass = 'bg-muted-700 hover:bg-muted-600 hover:cursor-pointer';
	const activeClass = 'bg-accent/40 hover:bg-accent/75 shadow-lg hover:cursor-pointer';
	const inEditClass = `${activeClass} border-red-400`;
	const editableFieldTypes = [FieldsEnum.EYE, FieldsEnum.START, FieldsEnum.RIVER, FieldsEnum.LEMBAS];
	const editable = type !== null ? editableFieldTypes.includes(type) : false;
	const getClassFromFieldEnum = (): string => {
		switch (type) {
			case FieldsEnum.EYE:
				return 'isEye';
			case FieldsEnum.DESTINY_MOUNTAIN:
				return 'isDestinyMountain';
			case FieldsEnum.CHECKPOINT:
				return 'isCheckpoint';
			case FieldsEnum.START:
				return 'isStartField';
			case FieldsEnum.LEMBAS:
				return 'isLembasField';
			case FieldsEnum.RIVER:
				return 'isRiver';
			case FieldsEnum.HOLE:
				return 'isHole';
			default:
				return '';
		}
	};
	let text = null;
	switch (type) {
		case FieldsEnum.START:
			text = DirectionArrows[DirectionHelper.stringToDirEnum(attribute as Direction)];
			break;
		case FieldsEnum.CHECKPOINT:
		case FieldsEnum.DESTINY_MOUNTAIN:
			text = ((attribute as number) + 1).toString();
			break;
		case FieldsEnum.EYE:
			text = DirectionArrows[DirectionHelper.stringToDirEnum(attribute as Direction)];
			inactiveClass = 'bg-muted/25 hover:cursor-not-allowed';
			break;
		case FieldsEnum.RIVER:
			text = DirectionArrows[DirectionHelper.stringToDirEnum(attribute as Direction)];
			break;
		case FieldsEnum.LEMBAS:
			text = attribute === 0 ? '0' : (attribute as number).toString();
			break;
		default:
	}
	const getContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
		const { onChangeToEdit } = props;
		if (editable) {
			return (
				<ContextMenuV2 position={{ x: event.clientX, y: event.clientY }}>
					<ContextMenuItemV2
						text={
							<div className="flex gap-2">
								<span>{window.languageHelper.translate('Position')}:</span>
								<span>
									[{position.x}, {position.y}]
								</span>
							</div>
						}
					/>
					<ContextMenuDividerV2 />
					<ContextMenuItemV2
						text={
							<div className="flex gap-2 items-center">
								<VscEdit />
								{window.languageHelper.translate('Edit')}
							</div>
						}
						onClick={() => {
							onChangeToEdit(position);
						}}
					/>
				</ContextMenuV2>
			);
		}
		return (
			<ContextMenuV2 position={{ x: event.clientX, y: event.clientY }}>
				<ContextMenuItemV2
					text={
						<div className="flex gap-2">
							<span>{window.languageHelper.translate('Position')}:</span>
							<span>
								[{position.x}, {position.y}]
							</span>
						</div>
					}
				/>
			</ContextMenuV2>
		);
	};
	return (
		<div
			key={_uniqueId('field-helper-')}
			tabIndex={-1}
			role="presentation"
			className={`relative w-16 h-16 transition transition-color rounded border ${
				active ? activeClass : inactiveClass
			} ${getClassFromFieldEnum()} ${inEdit ? inEditClass : 'border-transparent'}`}
			onClick={() => {
				if (active) onClick('field', position);
			}}
			onContextMenu={(event) => {
				onContextMenu(getContextMenu(event));
			}}
		>
			{attribute !== null ? (
				<div className="absolute bottom-0 right-0 w-5 h-5 font-mono font-black flex items-center justify-center text-white bg-gray-900/75">
					{text}
				</div>
			) : null}
		</div>
	);
}

type MainEditorProps = {
	config: BoardConfigInterface;
	zoom: number;
	onZoom: (zoom: number) => void;
	onFieldOrWallClick: FieldTypeOnClick;
	editorTool: EditorToolType;
	fieldInEdit: BoardPosition | null;
	onChangeToEdit: (position: BoardPosition) => void;
	file: {
		parsedPath: ParsedPath;
		path: string;
	} | null;
	fileSaved: boolean;
	fileSep: string;
};
type MainEditorState = {
	contextMenu: JSX.Element | null;
};

class MainEditor extends React.Component<MainEditorProps, MainEditorState> {
	constructor(props: MainEditorProps) {
		super(props);
		this.state = {
			contextMenu: null,
		};
		this.handleZoom = this.handleZoom.bind(this);
	}

	onContextMenu = (contextMenu: JSX.Element | null) => {
		this.setState({ contextMenu });
		if (contextMenu) {
			document.addEventListener(
				'click',
				() => {
					if (contextMenu) {
						this.setState({ contextMenu: null });
					}
				},
				{ once: true }
			);
		}
	};

	buildBoard = (config: BoardConfigInterface) => {
		const { onFieldOrWallClick, editorTool, fieldInEdit, onChangeToEdit } = this.props;
		const wallMap = wallConfig2Map(config.walls);
		const board: JSX.Element[][] = [];
		const xCordsRow: JSX.Element[] = [];
		xCordsRow.push(<div className="h-4 w-4 flex items-center" />);
		for (let x = 0; x < config.width; x += 1) {
			xCordsRow.push(
				<>
					<div
						className="h-4 w-16 flex items-center justify-center text-muted-50 bg-muted/25 text-[12px]"
						key={_uniqueId('y-coordinates-')}
					>
						{x}
					</div>
					<div className="h-4 w-4 flex items-center" />
				</>
			);
		}
		board.push(xCordsRow);
		for (let y = 0; y < config.height; y += 1) {
			const row: JSX.Element[] = [];
			row.push(
				<div
					className="h-16 w-4 flex items-center justify-center text-muted-50 bg-muted/25 text-[12px]"
					key={_uniqueId('y-coordinates-')}
				>
					{y}
				</div>
			);
			for (let x = 0; x < config.width; x += 1) {
				const fieldPosition = { x, y };
				const type = getFieldType(fieldPosition, config);

				const destinyMountain = type === FieldsEnum.CHECKPOINT && isDestinyMountain(fieldPosition, config);

				let attribute: null | Direction | number = null;
				switch (type) {
					case FieldsEnum.EYE:
						attribute = config.eye.direction;
						break;
					case FieldsEnum.START:
					case FieldsEnum.RIVER:
						attribute = getDirectionFieldConfig(fieldPosition, config)?.direction || 'NORTH';
						break;
					case FieldsEnum.LEMBAS:
						attribute = getLembasFieldConfig(fieldPosition, config)?.amount || 0;
						break;
					default:
						attribute = null;
						break;
				}
				row.push(
					<FieldHelper
						position={fieldPosition}
						onClick={onFieldOrWallClick}
						editorTool={editorTool}
						inEdit={fieldInEdit !== null && boardPosition2String(fieldInEdit) === boardPosition2String(fieldPosition)}
						type={destinyMountain ? FieldsEnum.DESTINY_MOUNTAIN : type}
						attribute={attribute}
						onContextMenu={this.onContextMenu}
						onChangeToEdit={onChangeToEdit}
					/>
				);
				if (x < config.width - 1) {
					const position: [BoardPosition, BoardPosition] = [
						{ x, y },
						{ x: x + 1, y },
					];
					const positionString = wallBoardPosition2String(position);
					row.push(
						<WallHelper
							direction="vertical"
							position={position}
							onClick={onFieldOrWallClick}
							editorTool={editorTool}
							isWall={!!wallMap.get(positionString)}
							onContextMenu={this.onContextMenu}
						/>
					);
				}
			}
			board.push(row);
			if (y < config.height - 1) {
				const wallRow: JSX.Element[] = [];
				wallRow.push(<div className="w-4 h-4" />);
				for (let x = 0; x < config.width; x += 1) {
					const position: [BoardPosition, BoardPosition] = [
						{ x, y },
						{ x, y: y + 1 },
					];
					const positionString = wallBoardPosition2String(position);
					wallRow.push(
						<WallHelper
							direction="horizontal"
							position={position}
							onClick={onFieldOrWallClick}
							editorTool={editorTool}
							isWall={!!wallMap.get(positionString)}
							onContextMenu={this.onContextMenu}
						/>
					);
					if (x < config.width - 1) {
						wallRow.push(<div key={_uniqueId('wall-divider-')} className="w-4 h-4" />);
					}
				}
				board.push(wallRow);
			}
			row.push(
				<div
					className="h-16 w-4 flex items-center justify-center text-muted-50 bg-muted/25 text-[12px]"
					key={_uniqueId('y-coordinates-')}
				>
					{y}
				</div>
			);
		}
		board.push(xCordsRow);
		return board;
	};

	handleZoom: React.WheelEventHandler<HTMLDivElement> = (event) => {
		const { onZoom, zoom } = this.props;
		if (event.ctrlKey) {
			if (event.deltaY > 0) {
				if (zoom - 0.1 <= 0.1) {
					onZoom(0.1);
					return;
				}
				onZoom(zoom - 0.1);
			} else {
				if (zoom + 0.1 >= 10) {
					onZoom(10);
					return;
				}
				onZoom(zoom + 0.1);
			}
		}
	};

	render() {
		const { config, zoom, file, fileSaved, fileSep } = this.props;

		const element = document.getElementById('main-editor-board-board');
		const element2 = document.getElementById('main-editor');
		if (element && element2) {
			if (element.clientHeight * zoom < element2.clientHeight) {
				element2.style.overflowY = 'hidden';
			} else {
				element2.style.overflowY = 'auto';
			}
		}

		const { contextMenu } = this.state;
		const board = this.buildBoard(config);
		return (
			<div className="max-h-full h-full">
				<div className="px-2 dark:bg-muted-800 bg-muted-600 text-sm dark:text-muted-200 text-muted-50 h-fit overflow-x-hidden">
					{file ? (
						<div className="flex items-center gap-0 h-full">
							<span className="py-[10px]">
								{file.parsedPath.dir}
								{fileSep}
							</span>
							<span>
								{file.parsedPath.base}
								{fileSaved ? '' : ` *`}
							</span>
							<span className="px-2">-</span>
							<span>{config.name}</span>
						</div>
					) : (
						<div className="flex items-center gap-0 h-full">
							<span className="py-[10px]">
								{window.languageHelper.translate('Unsaved File')}
								{fileSaved ? '' : ` *`}
							</span>
						</div>
					)}
				</div>
				<div
					id="main-editor"
					className="relative h-full max-w-full flex overflow-auto p-4 z-0"
					style={{ maxHeight: 'calc(100% - 42px)' }}
					onWheel={this.handleZoom}
				>
					<div id="main-editor-board" className="h-fit">
						<div
							id="main-editor-board-board"
							className="flex flex-col rounded gap-2 p-2"
							style={{
								transform: `scale(${zoom})`,
								transformOrigin: 'top left',
							}}
						>
							{board.map((row) => {
								return (
									<div key={_uniqueId('editor-row-')} className="flex gap-2">
										{row.map((field) => field)}
									</div>
								);
							})}
						</div>
					</div>
					{contextMenu}
				</div>
			</div>
		);
	}
}

export default MainEditor;
