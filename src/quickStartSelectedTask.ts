import type {Editor, MarkdownFileInfo, MarkdownView} from "obsidian";
import type TaskTracker from "TaskTracker";
import Tasks from "./Tasks";
import type Timer from 'Timer'

export async function quickStartSelectedTask(this: any, editor: Editor, view: MarkdownView | MarkdownFileInfo, tracker: TaskTracker | undefined, timer: Timer | undefined, tasks: Tasks | undefined) {
	logAnyCurrentTask(timer);
	unpinExistingFile(tracker);
	
	await loadTasksForSelectedFile(tracker, view);

	const lineNumber = getLineNumberOfSelectedTask(editor);
	const taskItemToSet = tasks?.getTaskItemByName(lineNumber);
	if(taskItemToSet){
		tracker?.active(taskItemToSet)
		tracker?.togglePinned();
		timer?.start();
	}
}
function logAnyCurrentTask(timer: Timer | undefined) {
	timer?.reset();
}

function getLineNumberOfSelectedTask(editor: Editor) {
	const origCursorPos = editor.getCursor();

	return origCursorPos.line;
}

function unpinExistingFile(tracker: TaskTracker | undefined) {
	if (tracker?.pinned) {
		tracker.togglePinned();
	}
}

async function loadTasksForSelectedFile(tracker: TaskTracker | undefined, view: MarkdownView | MarkdownFileInfo) {
	const file = view.file;
	if (file) {
		tracker?.setFile(file);
		await waitForTasksToBeLoaded(1000);
	}
}

function waitForTasksToBeLoaded(ms :number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
