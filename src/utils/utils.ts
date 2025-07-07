import { type App, TFile, moment } from 'obsidian'
import { type TimerLog } from '@components/Logger'
import {
	TaskRegularExpressions,
	type TaskComponents,
} from '@serializers/TaskModels'

export {
	appHasDailyNotesPluginLoaded,
	appHasWeeklyNotesPluginLoaded,
} from 'obsidian-daily-notes-interface'

export function getTemplater(app: App) {
	return app.plugins.plugins['templater-obsidian']
}

export async function parseWithTemplater(
	app: App,
	tfile: TFile,
	templateContent: string,
	log: TimerLog,
) {
	const templater = getTemplater(app)

	if (!templater) return templateContent

	const preamble = `<%* const log = ${JSON.stringify(
		log,
	)}; log.begin = moment(log.begin); log.end = moment(log.end); %>`

	return await (
		templater.templater as {
			parse_template: (
				opt: { target_file: TFile; run_mode: number },
				content: string,
			) => Promise<string>
		}
	).parse_template(
		{ target_file: tfile, run_mode: 4 },
		`${preamble}${templateContent}`,
	)
}
const HASH_TAGS_REG_EXP = /(^|\s)#[^ !@#$%^&*(),.?":{}|<>]+/g

export function extractHashtags(description: string): string[] {
	return description.match(HASH_TAGS_REG_EXP)?.map((tag) => tag.trim()) ?? []
}

export function extractTaskComponents(line: string): TaskComponents | null {
	// Check the line to see if it is a markdown task.
	const regexMatch = line.match(TaskRegularExpressions.taskRegex)
	if (regexMatch === null) {
		return null
	}

	const indentation = regexMatch[1]
	const listMarker = regexMatch[2]

	// Get the status of the task.
	const statusString = regexMatch[3]
	const status = statusString

	// match[4] includes the whole body of the task after the brackets.
	let body = regexMatch[4].trim()

	// Match for block link and remove if found. Always expected to be
	// at the end of the line.
	const blockLinkMatch = body.match(TaskRegularExpressions.blockLinkRegex)
	const blockLink = blockLinkMatch !== null ? blockLinkMatch[0] : ''

	if (blockLink !== '') {
		body = body.replace(TaskRegularExpressions.blockLinkRegex, '').trim()
	}
	return { indentation, listMarker, status, body, blockLink }
}

/**
 * Takes a regex of the form 'key:: value' and turns it into a regex that can parse
 * Dataview inline field, i.e either;
 *     * (key:: value)
 *     * [key:: value]
 *
 * There can be an arbitrary amount of horizontal whitespace around the key value pair,
 * and after the '::'
 */
export function toInlineFieldRegex(innerFieldRegex: RegExp): RegExp {
	/**
	 * First, I'm sorry this looks so bad. Javascript's regex engine lacks some
	 * conveniences from other engines like PCRE (duplicate named groups)
	 * that would've made this easier to express in a readable way.
	 *
	 * The idea here is that we're trying to say, in English:
	 *
	 *     "{@link innerFieldRegex} can either be surrounded by square brackets `[]`
	 *     or parens `()`"
	 *
	 * But there is added complexity because we want to disallow mismatched pairs
	 *   (i.e. no `[key::value) or (key::value]`). And we have to take care to not
	 * introduce new capture groups, since innerFieldRegex may contain capture groups
	 * and depend on the numbering.
	 *
	 * We achieve this by using a variable length, positive lookahead to assert
	 * "Only match a the first element of the pair if the other element is somewhere further in the string".
	 *
	 * This is likely somewhat fragile.
	 *
	 */
	const fieldRegex = (
		[
			'(?:',
            /*     */ /(?=[^\]]+\])\[/, // Try to match '[' if there's a ']' later in the string
            /*    */ '|',
            /*     */ /(?=[^)]+\))\(/, // Otherwise, match '(' if there's a ')' later in the string
			')',
			/ */,
			innerFieldRegex,
			/ */,
			/[)\]]/,
			/(?: *,)?/, // Allow trailing comma, enables workaround from #1913 for rendering issue
			/$/, // Regexes are matched from the end of the string forwards
		] as const
	)
		.map((val) => (val instanceof RegExp ? val.source : val))
		.join('')
	return new RegExp(fieldRegex, innerFieldRegex.flags)
}
