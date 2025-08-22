<script lang="ts">
import type TaskTracker from '@components/TaskTracker'
import Tasks, { type TaskItem } from '@components/Tasks'
import { extractProgressText } from '@utils/utils'

export let tasks: Tasks
export let tracker: TaskTracker
export let render: (content: string, el: HTMLElement) => void
const r = (content: string, el: HTMLElement) => {
    render(content, el)
}

let selectedHeading = ''

$: if (selectedHeading !== '') {
    tracker.setFileHeading(selectedHeading)
}

// TODO: Hook into event where the actual task name was changed and trigger an immediate reload
// const changeTaskName = (e: Event) => {
//     let target = e.target as HTMLInputElement
//     tracker.setTaskName(target.value)
// }

const removeTask = () => {
    tracker.clear()
}

const changeComment = (e: Event) => {
    let target = e.target as HTMLInputElement
    tracker.setComment(target.value)
}

// const openFile = (e: MouseEvent) => {
//     tracker.openFile(e)
// }

const openTask = (e: MouseEvent) => {
    tracker.openTask(e, tracker.task)
}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->

<!-- <span> -->
<!--     {$tracker.task} -->
<!-- </span> -->

{#if $tracker.task}
    <div class="pomodoro-tasks-wrapper">
        <div class="pomodoro-tasks-header">
            <div class="pomodoro-tasks-left">
                <span class="pomodoro-tasks-header-label">Task</span>
            </div>
            <div class="pomodoro-tasks-right">
                <span class="pomodoro-tasks-file-name" on:click={openTask}>
                    {$tracker.task?.fileName}
                </span>
            </div>
        </div>

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
                        {extractProgressText($tracker.task)}
                    </div>
                </div>
            {/if}
        </div>
    </div>
{/if}

<style>
.pomodoro-comment-input {
    margin: 1.5rem 2rem 1rem 0rem;
    width: 100%;
    font-size: 0.85rem;
    padding: 0.3rem 0.5rem;
    border-radius: 0.3rem;
    background-color: var(--background-secondary);
    color: var(--text-normal);
}

.pomodoro-tasks-remove {
    cursor: pointer;
}
</style>
