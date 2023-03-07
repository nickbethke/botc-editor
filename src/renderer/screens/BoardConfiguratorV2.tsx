import React from 'react';
import TopMenu, {
	TopMenuActions,
} from '../components/boardConfiguratorV2/TopMenu';
import BoardConfigInterface from '../components/interfaces/BoardConfigInterface';
import LeftSidebar, {
	LeftSidebarOpenTab,
} from '../components/boardConfiguratorV2/LeftSidebar';
import { FieldsEnum } from '../components/generator/BoardGenerator';
import RightSidebar, {
	RightSidebarOpenTab,
} from '../components/boardConfiguratorV2/RightSidebar';

type BoardConfiguratorV2Props = {
	os: NodeJS.Platform;
	onClose: () => void;
};
type BoardConfiguratorV2State = {
	windowDimensions: {
		width: number;
		height: number;
	};
	sidebars: { left: number; right: number };
	darkMode: boolean;
	popup: null | 'boardSettings';
	currentTool: FieldsEnum | 'delete';
	sideBarTabLeft: LeftSidebarOpenTab;
	sideBarTabRight: RightSidebarOpenTab;
};

class BoardConfiguratorV2 extends React.Component<
	BoardConfiguratorV2Props,
	BoardConfiguratorV2State
> {
	static defaultBoard: BoardConfigInterface = {
		height: 2,
		width: 2,
		name: 'Default Board',
		checkPoints: [],
		startFields: [],
		eye: { position: [0, 0], direction: 'NORTH' },
		lembasFields: [],
		riverFields: [],
		holes: [],
		walls: [],
	};

	constructor(props: BoardConfiguratorV2Props) {
		super(props);
		this.state = {
			windowDimensions: {
				width: window.innerWidth,
				height: window.innerHeight,
			},
			sidebars: {
				left: 400,
				right: 52,
			},
			darkMode: true,
			popup: null,
			currentTool: FieldsEnum.START,
			sideBarTabLeft: 'settings',
			sideBarTabRight: null,
		};
		this.addEventListeners = this.addEventListeners.bind(this);
		this.onTopMenuAction = this.onTopMenuAction.bind(this);
		document.querySelector('html')?.classList.add('dark');
	}

	componentDidUpdate(
		prevProps: Readonly<BoardConfiguratorV2Props>,
		prevState: Readonly<BoardConfiguratorV2State>
	) {
		const { darkMode, sideBarTabLeft, sidebars, sideBarTabRight } =
			this.state;
		const {
			sideBarTabLeft: preSideBarTabLeft,
			sideBarTabRight: preSideBarTabRight,
		} = prevState;
		const html = document.querySelector('html');
		if (darkMode) {
			html?.classList.add('dark');
		} else {
			html?.classList.remove('dark');
		}
		if (sideBarTabLeft === null && sidebars.left > 52) {
			this.setState({ sidebars: { ...sidebars, left: 52 } });
		}
		if (preSideBarTabLeft === null && sideBarTabLeft !== null) {
			this.setState({ sidebars: { ...sidebars, left: 400 } });
		}
		if (sideBarTabRight === null && sidebars.right > 52) {
			this.setState({ sidebars: { ...sidebars, right: 52 } });
		}
		if (preSideBarTabRight === null && sideBarTabRight !== null) {
			this.setState({ sidebars: { ...sidebars, right: 400 } });
		}
	}

	onTopMenuAction = (action: TopMenuActions) => {
		const { onClose } = this.props;
		const { darkMode } = this.state;
		switch (action) {
			case TopMenuActions.NEW:
				break;
			case TopMenuActions.OPEN:
				break;
			case TopMenuActions.SAVE:
				break;
			case TopMenuActions.SAVE_AS_PRESET:
				break;
			case TopMenuActions.CLOSE:
				onClose();
				break;
			case TopMenuActions.DARK_MODE:
				this.setState({ darkMode: !darkMode });
				break;
			default:
				break;
		}
	};

	popup = () => {
		const { popup } = this.state;
		switch (popup) {
			default:
				return null;
		}
	};

	private addEventListeners() {
		window.addEventListener(
			'resize',
			() => {
				this.setState({
					windowDimensions: {
						width: window.innerWidth,
						height: window.innerHeight,
					},
				});
			},
			{ once: true }
		);
	}

	render() {
		const { os } = this.props;
		const {
			windowDimensions,
			sidebars,
			darkMode,
			currentTool,
			sideBarTabLeft,
			sideBarTabRight,
		} = this.state;
		this.addEventListeners();
		const mainHeight =
			windowDimensions.height - (os === 'win32' ? 32 + 37 : 37);
		const mainWidth =
			windowDimensions.width - (sidebars.left + sidebars.right);
		return (
			<section className="text-white font-lato">
				{os === 'win32' ? (
					<div className="dragger w-[100vw] h-8 bg-muted" />
				) : null}
				<div
					className={`dark:bg-muted-800 bg-muted-400 py-1 px-4 ${
						os === 'darwin' ? 'pl-24' : ''
					}`}
					style={{ width: `${windowDimensions.width}px` }}
				>
					<TopMenu
						onAction={this.onTopMenuAction}
						darkMode={darkMode}
					/>
				</div>
				<div
					className="flex flex-row bg-background border-t dark:border-muted-700 border-muted-400"
					style={{
						height: `${mainHeight}px`,
						maxHeight: `${mainHeight}px`,
					}}
				>
					<div
						className="dark:bg-muted-800 bg-muted-600"
						style={{
							width: `${sidebars.left}px`,
							maxWidth: `${sidebars.left}px`,
						}}
					>
						<LeftSidebar
							openTab={sideBarTabLeft}
							currentTool={currentTool}
							toolChange={(tool) => {
								this.setState({ currentTool: tool });
							}}
							tabChange={(tab) => {
								this.setState({ sideBarTabLeft: tab });
							}}
						/>
					</div>
					<div
						className="dark:bg-muted-800 bg-muted-600 border-x dark:border-muted-700 border-muted-400"
						style={{
							width: `${mainWidth}px`,
							maxWidth: `${mainWidth}px`,
						}}
					/>
					<div
						className="dark:bg-muted-800 bg-muted-600"
						style={{
							width: `${sidebars.right}px`,
							maxWidth: `${sidebars.right}px`,
						}}
					>
						<RightSidebar
							openTab={sideBarTabRight}
							tabChange={(tab) => {
								this.setState({ sideBarTabRight: tab });
							}}
						/>
					</div>
				</div>
				{this.popup()}
			</section>
		);
	}
}

export default BoardConfiguratorV2;
