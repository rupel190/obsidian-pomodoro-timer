import PomodoroSettings from '@components/Settings'
import { writable } from 'svelte/store'

export const settings = PomodoroSettings.settings

export default {
	settings,
}
