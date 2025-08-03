<script lang="ts">
import { Menu } from 'obsidian'
import { settings } from 'stores'
import { extractProgressText } from '@utils/utils'

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

$: filtered = $tasks
    ? $tasks.list.filter((item) => {
          let statusMatch = true
          let textMatch = true
          if (query) {
              textMatch = item.name.toLowerCase().includes(query.toLowerCase())
          }
          if (status) {
              if (status === 'todo') statusMatch = !item.checked
              if (status === 'completed') statusMatch = item.checked
          }

          return statusMatch && textMatch
      })
    : []

const activeTask = (task: TaskItem) => {
    tracker.active(task)
}

const togglePinned = () => {
    tracker.togglePinned()
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

const openFile = (e: MouseEvent) => {
    tracker.openFile(e)
}

const showTaskMenu = (task: TaskItem) => (e: MouseEvent) => {
    const menu = new Menu()
    menu.addItem((item) => {
        item.setTitle('Goto').onClick(() => {
            tracker.openTask(e, task)
        })
    })
    menu.showAtMouseEvent(e)
}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->

{#if $tracker.file}
    <div class="pomodoro-tasks-wrapper">
        <div class="pomodoro-tasks-header">
            <div class="pomodoro-tasks-left">
                <span class="pomodoro-tasks-pin" on:click={togglePinned}>
                    {#if !$tracker.filePinned}
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
                            class="lucide lucide-pin"
                            ><line x1="12" x2="12" y1="17" y2="22" /><path
                                d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" /></svg>
                    {:else}
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
                            class="lucide lucide-pin-off"
                            ><line x1="2" x2="22" y1="2" y2="22" /><line
                                x1="12"
                                x2="12"
                                y1="17"
                                y2="22" /><path
                                d="M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h12" /><path
                                d="M15 9.34V6h1a2 2 0 0 0 0-4H7.89" /></svg>
                    {/if}
                </span>
                <span class="pomodoro-tasks-header-label">File</span>
            </div>
            <div class="pomodoro-tasks-right">
                <span class="pomodoro-tasks-file-name" on:click={openFile}>
                    {$tracker.file.name}
                </span>
            </div>
        </div>

        {#if $tasks.list.length > 0}
            <div class="pomodoro-tasks-toolbar">
                <div class="pomodoro-tasks-filters">
                    <span
                        on:click={() => (status = '')}
                        class="pomodoro-tasks-filter {status === ''
                            ? 'filter-active'
                            : ''}">All</span>
                    <span
                        on:click={() => (status = 'todo')}
                        class="pomodoro-tasks-filter {status === 'todo'
                            ? 'filter-active'
                            : ''}">Todo</span>
                    <span
                        on:click={() => (status = 'completed')}
                        class="pomodoro-tasks-filter {status === 'completed'
                            ? 'filter-active'
                            : ''}">Completed</span>
                </div>
                <span class="pomodoro-tasks-count">
                    {filtered.length} tasks
                </span>
            </div>

            <div class="pomodoro-tasks-text-filter">
                <input type="text" bind:value={query} placeholder="Search..." />
            </div>
        {/if}

        {#if filtered.length > 0}
            <div class="pomodoro-tasks-list">
                {#each filtered as item}
                    <div
                        on:click={() => {
                            activeTask(item)
                        }}
                        on:contextmenu={showTaskMenu(item)}
                        style="background: linear-gradient(to right, rgba(var(--color-green-rgb),0.25) {progress(
                            item,
                        )}%, transparent 0%)"
                        class="pomodoro-tasks-item {item.checked
                            ? 'pomodoro-tasks-checked'
                            : ''}">
                        <div class="pomodoro-tasks-name-row">
                            {#if item.checked}
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
                                    class="lucide lucide-check"
                                    ><path d="M20 6 9 17l-5-5" /></svg>
                            {:else}
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
                                    class="lucide lucide-circle"
                                    ><circle cx="12" cy="12" r="10" /></svg>
                            {/if}
                            <TaskItemComponent
                                render={r}
                                content={item.description} />
                        </div>
                        <div class="pomodoro-tasks-progress">
                            {extractProgressText(item)}
                        </div>
                    </div>
                {/each}
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

.pomodoro-tasks-left:hover,
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

.pomodoro-tasks-list,
.pomodoro-tasks-active {
    border-top: 1px solid var(--background-modifier-border);
    width: 100%;
}

.pomodoro-tasks-item {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 0.5rem 1rem;
    display: flex;
}

.pomodoro-tasks-list .pomodoro-tasks-item {
    cursor: pointer;
}
.pomodoro-tasks-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.pomodoro-tasks-count {
    color: var(--text-faint);
    font-size: 0.8rem;
    text-wrap: nowrap;
    padding-right: 1rem;
}
.pomodoro-tasks-filters {
    padding: 0.5rem 1rem;
}

.pomodoro-tasks-text-filter {
    border-top: 1px solid var(--background-modifier-border);
    padding: 0.5rem 0rem;
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

.pomodoro-tasks-text-filter input {
    height: 0.8rem;
}

.pomodoro-tasks-filter {
    font-size: 0.8rem;
    padding: 1px 7px;
    border-radius: 10px;
    cursor: pointer;
    color: var(--text-muted);
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

.filter-active {
    background-color: var(--interactive-accent);
    color: var(--text-on-accent-inverted);
}

.pomodoro-tasks-item + .pomodoro-tasks-item {
    border-top: 1px solid var(--background-modifier-border);
}

.pomodoro-tasks-checked .pomodoro-tasks-name-row {
    text-decoration: line-through;
    color: var(--text-muted);
}

.pomodoro-tasks-pin {
    cursor: pointer;
    padding-right: 3px;
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
