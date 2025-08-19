import PomodoroTimerPlugin from 'main'
import { type CachedMetadata, type TFile, type App, type HeadingCache } from 'obsidian'
import type { Unsubscriber } from 'svelte/motion'
import { writable, derived, type Readable, type Writable } from 'svelte/store'

export type FileStore = {
	file: TFile | null
	headings: HeadingCache[]
}

export default class Files implements Readable<FileStore> {
	private plugin: PomodoroTimerPlugin

	private _store: Writable<FileStore>

	public subscribe

	private unsubscribers: Unsubscriber[] = []

	private state: FileStore = {
		file: null,
		headings: [],
	}

	constructor(plugin: PomodoroTimerPlugin) {
		this.plugin = plugin

		this._store = writable(this.state)

		this.unsubscribers.push(
			this._store.subscribe((state) => {
				this.state = state
			}),
		)

		this.unsubscribers.push(
			derived(this.plugin.tracker!, ($tracker) => {
				return $tracker.file?.path
			}).subscribe(() => {
				let file = this.plugin.tracker?.file
				if (file) {
					this.loadFileHeadings(file)
				} else {
					this.clearHeadings()
				}
			}),
		)

		this.subscribe = this._store.subscribe


		// File switching happens here
		this.plugin.registerEvent(
			plugin.app.metadataCache.on(
				'changed',
				(file: TFile, content: string, cache: CachedMetadata) => {
					if (
						file.extension === 'md' &&
						file == this.plugin.tracker!.file
					) {
						let headings = resolveHeadings(
							content,
							cache,
						)
						this._store.update((state) => {
							state.file = file
							state.headings = headings
							return state
						})

					}
				},
			),
		)
	}

	public loadFileHeadings(file: TFile) {
		if (file.extension == 'md') {
			this.plugin.app.vault.cachedRead(file).then((c) => {
				let headings = resolveHeadings(
					c,
					this.plugin.app.metadataCache.getFileCache(file),
				)

				this._store.update(() => ({
					file: file,
					headings: headings,
				}))
			})
		} else {
			this._store.update(() => ({
				file: null,
				headings: [],
			}))
		}
	}

	public getHeadingByText(headingText: string) {
		return this.state.headings.find((heading) => heading.heading === headingText)
	}

	public clearHeadings() {
		this._store.update(() => ({
			file: null,
			headings: [],
		}))
	}

	public destroy() {
		for (let unsub of this.unsubscribers) {
			unsub()
		}
	}
}

export function resolveHeadings(
	content: string,
	metadata: CachedMetadata | null,
): HeadingCache[] {
	if (!content || !metadata) {
		return []
	}

	return metadata.headings || []
}
