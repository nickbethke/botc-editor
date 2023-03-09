import React from 'react';
import _uniqueId from 'lodash/uniqueId';
import {
	VscArrowDown,
	VscArrowLeft,
	VscArrowRight,
	VscArrowUp,
} from 'react-icons/vsc';
import BoardConfigInterface, {
	Direction,
} from '../interfaces/BoardConfigInterface';
import {
	BoardPosition,
	boardPosition2String,
	wallBoardPosition2String,
	wallConfig2Map,
} from '../generator/interfaces/boardPosition';
import { EditorToolType } from '../../screens/BoardConfiguratorV2';
import { FieldsEnum } from '../generator/BoardGenerator';
import {
	getDirectionFieldConfig,
	getFieldType,
	getLembasFieldConfig,
	isDestinyMountain,
} from './HelperFunctions';
import DirectionHelper from '../generator/helper/DirectionHelper';

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
};

function WallHelper(props: WallHelperProps) {
	const { direction, onClick, position, editorTool, isWall } = props;
	const active = editorTool === 'delete' || editorTool === FieldsEnum.WALL;
	const activeClass = 'bg-accent/50 hover:bg-accent/75';
	const inactiveClass = 'bg-muted/50 hover:bg-muted/75';
	if (direction === 'horizontal') {
		return (
			<div
				tabIndex={-1}
				role="presentation"
				className={`w-16 h-4 transition transition-color hover:cursor-pointer ${
					active ? activeClass : inactiveClass
				} ${isWall ? 'isWall' : ''}`}
				onClick={() => {
					if (active) onClick('wall', position);
				}}
			/>
		);
	}
	return (
		<div
			tabIndex={-1}
			role="presentation"
			className={`w-4 h-16 transition transition-color hover:cursor-pointer ${
				active ? activeClass : inactiveClass
			} ${isWall ? 'isWall' : ''}`}
			onClick={() => {
				if (active) onClick('wall', position);
			}}
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
};

const DirectionArrows: JSX.Element[] = [
	<VscArrowUp strokeWidth={2} />,
	<VscArrowRight strokeWidth={2} />,
	<VscArrowDown strokeWidth={2} />,
	<VscArrowLeft strokeWidth={2} />,
];

function FieldHelper(props: FieldHelperProps) {
	const { position, onClick, editorTool, type, inEdit, attribute } = props;
	const active =
		editorTool === 'edit' ||
		(editorTool !== FieldsEnum.WALL && type !== FieldsEnum.EYE);
	const inactiveClass = 'bg-muted/50 hover:bg-muted/75';
	const activeClass = 'bg-accent/50 hover:bg-accent/75';
	const inEditClass = 'shadow box-shadow border-red-400';

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
			text =
				DirectionArrows[
					DirectionHelper.stringToDirEnum(attribute as Direction)
				];
			break;
		case FieldsEnum.CHECKPOINT:
			text = ((attribute as number) + 1).toString();
			break;
		case FieldsEnum.DESTINY_MOUNTAIN:
			text = ((attribute as number) + 1).toString();
			break;
		case FieldsEnum.EYE:
			text =
				DirectionArrows[
					DirectionHelper.stringToDirEnum(attribute as Direction)
				];
			break;
		case FieldsEnum.RIVER:
			text =
				DirectionArrows[
					DirectionHelper.stringToDirEnum(attribute as Direction)
				];
			break;
		case FieldsEnum.LEMBAS:
			text = (attribute as number).toString();
			break;
		default:
	}

	return (
		<div
			tabIndex={-1}
			role="presentation"
			className={`relative w-16 h-16 transition transition-color hover:cursor-pointer rounded border ${
				active ? activeClass : inactiveClass
			} ${getClassFromFieldEnum()} ${
				inEdit ? inEditClass : 'border-transparent'
			}`}
			onClick={() => {
				if (active) onClick('field', position);
			}}
		>
			{attribute ? (
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
};

class MainEditor extends React.Component<MainEditorProps, unknown> {
	constructor(props: MainEditorProps) {
		super(props);
		this.handleZoom = this.handleZoom.bind(this);
	}

	buildBoard = (config: BoardConfigInterface) => {
		const { onFieldOrWallClick, editorTool, fieldInEdit } = this.props;
		const wallMap = wallConfig2Map(config.walls);
		const board: JSX.Element[][] = [];
		for (let y = 0; y < config.height; y += 1) {
			const row: JSX.Element[] = [];
			for (let x = 0; x < config.width; x += 1) {
				const fieldPosition = { x, y };
				const type = getFieldType(fieldPosition, config);

				const destinyMountain =
					type === FieldsEnum.CHECKPOINT &&
					isDestinyMountain(fieldPosition, config);

				let attribute: null | Direction | number = null;
				switch (type) {
					case FieldsEnum.EYE:
						attribute = config.eye.direction;
						break;
					case FieldsEnum.START:
					case FieldsEnum.RIVER:
						attribute =
							getDirectionFieldConfig(fieldPosition, config)
								?.direction || 'NORTH';
						break;
					case FieldsEnum.LEMBAS:
						attribute =
							getLembasFieldConfig(fieldPosition, config)
								?.amount || 0;
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
						inEdit={
							fieldInEdit !== null &&
							boardPosition2String(fieldInEdit) ===
								boardPosition2String(fieldPosition)
						}
						type={
							destinyMountain ? FieldsEnum.DESTINY_MOUNTAIN : type
						}
						attribute={attribute}
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
						/>
					);
				}
			}
			board.push(row);
			if (y < config.height - 1) {
				const wallRow: JSX.Element[] = [];
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
						/>
					);
					if (x < config.width - 1) {
						wallRow.push(<div className="w-4 h-4" />);
					}
				}
				board.push(wallRow);
			}
		}
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
		const { config, zoom } = this.props;
		const board = this.buildBoard(config);
		return (
			<div
				id="main-editor"
				className="relative h-full max-w-full max-h-full flex overflow-auto p-4 z-0"
				onWheel={this.handleZoom}
			>
				<div id="main-editor-board" className="h-fit">
					<div
						className="flex flex-col rounded bg-grass gap-4 p-4"
						style={{
							transform: `scale(${zoom})`,
							transformOrigin: 'top left',
						}}
					>
						{board.map((row) => {
							return (
								<div
									key={_uniqueId('editor-row-')}
									className="flex gap-4"
								>
									{row.map((field) => field)}
								</div>
							);
						})}
					</div>
				</div>
			</div>
		);
	}
}

export default MainEditor;
