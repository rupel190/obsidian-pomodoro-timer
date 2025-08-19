import { Notice, Plugin, WorkspaceLeaf, Editor, MarkdownView } from 'obsidian'
import type { MarkdownFileInfo } from 'obsidian'
import StatusBar from '@svelte/StatusBarComponent.svelte'

import PomodoroSettings, { type Settings } from '@components/Settings'
import { TimerView, VIEW_TYPE_TIMER } from '@components/TimerView'
import Timer from '@components/Timer'
import Tasks from '@components/Tasks'
import Files from '@components/Files'
import TaskTracker from '@components/TaskTracker'

export default class PomodoroTimerPlugin extends Plugin {
	private settingTab?: PomodoroSettings

	public timer?: Timer

	public tasks?: Tasks
	public files?: Files

	public tracker?: TaskTracker

	async onload() {
		const settings = await this.loadData()
		this.settingTab = new PomodoroSettings(this, settings)
		this.addSettingTab(this.settingTab)
		this.tracker = new TaskTracker(this)
		this.timer = new Timer(this)
		this.tasks = new Tasks(this)
		this.files = new Files(this)

		this.registerView(VIEW_TYPE_TIMER, (leaf) => new TimerView(this, leaf))

		// ribbon
		this.addRibbonIcon('timer', 'Toggle timer panel', () => {
			let { workspace } = this.app
			let leaves = workspace.getLeavesOfType(VIEW_TYPE_TIMER)
			if (leaves.length > 0) {
				workspace.detachLeavesOfType(VIEW_TYPE_TIMER)
			} else {
				this.activateView()
			}
		})

		// status bar
		const status = this.addStatusBarItem()
		status.className = `${status.className} mod-clickable`
		new StatusBar({ target: status, props: { store: this.timer } })

		// commands
		this.addCommand({
			id: 'toggle-timer',
			name: 'Toggle timer',
			callback: () => {
				this.timer?.toggleTimer()
			},
		})

		this.addCommand({
			id: 'toggle-timer-panel',
			name: 'Toggle timer panel',
			callback: () => {
				let { workspace } = this.app
				let leaves = workspace.getLeavesOfType(VIEW_TYPE_TIMER)
				if (leaves.length > 0) {
					workspace.detachLeavesOfType(VIEW_TYPE_TIMER)
				} else {
					this.activateView()
				}
			},
		})

		this.addCommand({
			id: 'reset-timer',
			name: 'Reset timer',
			callback: () => {
				this.timer?.reset()
				new Notice('Timer reset')
			},
		})

		this.addCommand({
			id: 'toggle-mode',
			name: 'Toggle timer mode',
			callback: () => {
				this.timer?.toggleMode((t) => {
					new Notice(`Timer mode: ${t.mode}`)
				})
			},
		})

		this.addCommand({
			id: 'quick-start-selected-task',
			name: 'Quick Start Selected Task',
			editorCallback: (editor: Editor, _view: MarkdownView | MarkdownFileInfo) => {
				this.timer?.reset()
				this.tracker?.setToCurrentFile()
				let currentTask = this.tasks?.getTaskItemByLine(editor.getCursor().line)
				if (currentTask) {
					this.tracker?.active(currentTask)
					this.tracker?.togglePinned()
					this.timer?.start()
				}
			}
		})
	}


	public getSettings(): Settings {
		return (
			this.settingTab?.getSettings() || PomodoroSettings.DEFAULT_SETTINGS
		)
	}

	onunload() {
		this.settingTab?.unload()
		this.timer?.destroy()
		this.tasks?.destroy()
		this.files?.destroy()
		this.tracker?.destory()
	}
	async activateView() {
		let { workspace } = this.app

		let leaf: WorkspaceLeaf | null = null
		let leaves = workspace.getLeavesOfType(VIEW_TYPE_TIMER)

		if (leaves.length > 0) {
			leaf = leaves[0]
		} else {
			leaf = workspace.getRightLeaf(false)
			await leaf.setViewState({
				type: VIEW_TYPE_TIMER,
				active: true,
			})
		}

		workspace.revealLeaf(leaf)
	}
}
