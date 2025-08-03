<script lang="ts">
import { Menu } from 'obsidian'
import { settings } from 'stores'

import TaskItemComponent from '@svelte/TaskItemComponent.svelte'
import type TaskTracker from '@components/TaskTracker'
import Tasks, { type TaskItem } from '@components/Tasks'

export let tasks: Tasks
export let tracker: TaskTracker
export let render: (content: string, el: HTMLElement) => void
const r = (content: string, el: HTMLElement) => {
    render(content, el)
}

let status = ''
let query = ''

const changeTaskName = (e: Event) => {
    let target = e.target as HTMLInputElement
    tracker.setTaskName(target.value)
}

const removeTask = () => {
    tracker.clear()
}

const changeComment = (e: Event) => {
    let target = e.target as HTMLInputElement
    tracker.setComment(target.value)
}

const progress = (item: TaskItem) => {
    if (!$settings.showTaskProgress) {
        return 0
    }
    if (item.expected > 0 && item.actual >= 0) {
        return ((item.actual / item.expected) * 100).toFixed(2)
    }
    return 0
}

const progressText = (item: TaskItem) => {
    let { actual, expected } = item
    if (expected > 0) {
        let unfinished = expected - actual
        let max = Math.max(expected, actual)
        if (max > 10) {
            if (unfinished > 0) {
                return `◌ x ${unfinished} 🍅 x ${actual}`
            } else {
                return `🍅 x ${expected}  🥫 x ${Math.abs(unfinished)}`
            }
        } else {
            if (unfinished > 0) {
                return `${'🍅'.repeat(actual)}${'◌'.repeat(unfinished)}`
            } else {
                return `${'🍅'.repeat(expected)}${'🥫'.repeat(
                    Math.abs(unfinished),
                )}`
            }
        }
    } else {
        return actual > 10
            ? `🍅 x ${actual}`
            : actual > 0
              ? `${'🍅'.repeat(actual)}`
              : `- -`
    }
}

const openFile = (e: MouseEvent) => {
    tracker.openFile(e)
}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->

{#if $tracker.file}
    <div class="pomodoro-tasks-wrapper">
        <div class="pomodoro-tasks-header">
            <span class="pomodoro-tasks-header-label">Task</span>
            <div class="pomodoro-tasks-right">
                <span class="pomodoro-tasks-file-name" on:click={openFile}>
                    {$tracker.file.name}
                </span>
            </div>
        </div>

        {#if $tasks.list.length > 0}
            <div class="pomodoro-tasks-active">
                {#if $tracker.task}
                    <div class="pomodoro-tasks-item">
                        <div class="pomodoro-tasks-name-row">
                            <span class="pomodoro-task-label">
                                {$tracker.task?.name}
                            </span>
                            <span
                                class="pomodoro-tasks-remove"
                                on:click={removeTask}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    class="lucide lucide-x"
                                    ><path d="M18 6 6 18" /><path
                                        d="m6 6 12 12" /></svg>
                            </span>
                        </div>
                        <input
                            class="pomodoro-comment-input"
                            type="text"
                            placeholder="Session comment..."
                            value={$tracker.comment}
                            on:input={changeComment} />
                        <div class="pomodoro-tasks-progress">
                            {progressText($tracker.task)}
                        </div>
                    </div>
                {/if}
            </div>
        {/if}
    </div>
{/if}

<style>
.pomodoro-tasks-wrapper {
    width: 100%;
    border: 1px solid var(--background-modifier-border);
    border-radius: 5px;
    margin-bottom: 2.5rem;
}

.pomodoro-tasks-header {
    display: flex;
    align-items: stretch; /* stretch children vertically */
    justify-content: space-between;
    height: 100%;
    background-color: var(--background-modifier-active-hover);
}

.pomodoro-tasks-left,
.pomodoro-tasks-right {
    display: flex;
    align-items: center;
    cursor: pointer;
    margin: 0.4rem;
}

.pomodoro-tasks-left {
    padding: 0.5rem 1.5rem 0.5rem 0.5rem; /* Larger click area */
}

.pomodoro-tasks-right {
    padding: 0rem 1rem 0rem 1.5rem; /* Larger click area */
}

.pomodoro-tasks-right:hover {
    background-color: rgba(255, 255, 255, 0.02); /* Optional hover feedback */
    border-radius: 5px;
}

.pomodoro-tasks-header-label {
    font-size: 1.1rem;
    padding-right: 1.4rem;
    letter-spacing: 0rem;
    font-weight: bold;
    text-transform: uppercase;
    padding: 0.5rem 1.5rem 0.5rem 1.25rem;
}

.pomodoro-tasks-file-name {
    margin-left: auto; /* push to the right */
    min-width: 0; /* allow ellipsis */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-style: italic;
    cursor: pointer;
}

.pomodoro-tasks-header .pomodoro-tasks-count {
    width: 50px;
}

.pomodoro-tasks-item {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 0.5rem 1rem;
    display: flex;
}

.pomodoro-tasks-wrapper input {
    width: 100%;
    font-size: 0.8rem;
    border: none;
    border-radius: 0;
    background: transparent;
}

.pomodoro-tasks-wrapper input:active {
    border: none;
    box-shadow: none;
}

.pomodoro-tasks-wrapper input:focus {
    border: none;
    box-shadow: none;
}

.pomodoro-tasks-name-row svg {
    margin-right: 5px;
}

.pomodoro-tasks-name-row svg {
    color: var(--color-blue);
}

.pomodoro-tasks-checked .pomodoro-tasks-name-row svg {
    color: var(--color-green);
}

.pomodoro-tasks-name-row {
    width: 100%;
    display: flex;
    align-items: baseline;
}

.pomodoro-comment-input {
    margin-top: 0.4rem;
    width: 100%;
    font-size: 0.85rem;
    padding: 0.3rem 0.5rem;
    border-radius: 0.3rem;
    border: 1px solid var(--background-modifier-border);
    background-color: var(--background-secondary);
    color: var(--text-normal);
}

.pomodoro-tasks-remove {
    cursor: pointer;
}
.pomodoro-tasks-progress {
    font-size: 0.7rem;
    color: var(--text-muted);
    text-align: end;
    text-wrap: nowrap;
    overflow: hidden;
}
</style>
