import {ParsedPath} from 'path';
import {useState} from 'react';

type FilePathComponentProps = {
	file: ParsedPath;
	os: NodeJS.Platform;
	edited: boolean;
};

function FilePathComponent(props: FilePathComponentProps) {
	const {file, os, edited} = props;
	const [dirOpen, setDirOpen] = useState(true);
	const [isHovered, setIsHovered] = useState(false);
	const fileSep = os === 'win32' ? '\\' : '/';
	return (
		<button
			className="flex items-center italic"
			type="button"
			onClick={() => {
				setDirOpen(!dirOpen);
			}}
			onMouseEnter={() => {
				setIsHovered(true);
			}}
			onMouseLeave={() => {
				setIsHovered(false);
			}}
			onMouseOver={() => {
				setIsHovered(true);
			}}
			onMouseOut={() => {
				setIsHovered(false);
			}}
			onFocus={() => {
				setIsHovered(true);
			}}
			onBlur={() => {
				setIsHovered(false);
			}}
		>
			<span
				className={`${isHovered ? 'text-white' : 'text-white/50'} transition transition-colors overflow-x-hidden`}>
				{dirOpen ? file.dir + fileSep : `...${fileSep}`}
			</span>
			<span>
				{file.base}
				{edited ? ' *' : ''}
			</span>
		</button>
	);
}

export default FilePathComponent;
