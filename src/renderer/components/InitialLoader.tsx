import {VscLoading} from "react-icons/vsc";

export default function InitialLoader() {
	return (
		<div className="w-[100vw] h-[100vh] bg-slate-800 text-white">
			<div className="flex flex-col items-center justify-center w-full h-full">
				<VscLoading className="animate-spin w-12 h-12"/>
				<p className="mt-4">Loading BotC - Editor</p>
			</div>
		</div>
	);
}
