import { z } from 'zod';

const mk = (name: string, description = '', args = z.object({})) => ({
	// default arguments shape is an empty object so zod-to-json-schema emits type: 'object'
	shape: { name: { value: name }, description: { value: description }, arguments: args },
});

// Per-tool argument schemas
export const NavigateTool = mk(
	'navigate',
	'Navigate the browser tab to the specified url',
	z.object({ url: z.string().url().describe('The URL to navigate to') }),
);

export const GoBackTool = mk('goBack', 'Navigate back in the browser history');
export const GoForwardTool = mk('goForward', 'Navigate forward in the browser history');

export const PressKeyTool = mk(
	'pressKey',
	'Simulate pressing a keyboard key on the page',
	z.object({ key: z.string().describe('Key to press (e.g. Enter, ArrowDown, a)') }),
);

export const WaitTool = mk(
	'wait',
	'Wait for a specified duration (seconds)',
	z.object({ time: z.number().int().nonnegative().describe('Seconds to wait') }),
);

export const SnapshotTool = mk('snapshot', 'Capture an accessibility (ARIA) snapshot of the current page');

export const ClickTool = mk(
	'click',
	'Click an element identified by selector or accessibility identifier',
	z.object({ element: z.string().describe('Selector or accessibility identifier of the element to click') }),
);

export const DragTool = mk(
	'drag',
	'Drag an element from a start location to an end location',
	z.object({
		startElement: z.string().describe('Selector or id for start element'),
		endElement: z.string().describe('Selector or id for end element'),
	}),
);

export const HoverTool = mk(
	'hover',
	'Move the mouse over the specified element',
	z.object({ element: z.string().describe('Selector or accessibility identifier of the element to hover') }),
);

export const TypeTool = mk(
	'type',
	'Type text into an input or editable element',
	z.object({
		element: z.string().describe('Selector or accessibility identifier of the input'),
		text: z.string().describe('Text to type into the element'),
	}),
);

export const SelectOptionTool = mk(
	'selectOption',
	'Select an option inside a select element',
	z.object({ element: z.string().describe('Selector of the select element'), value: z.string().describe('Value of the option to select') }),
);

export const GetConsoleLogsTool = mk('getConsoleLogs', 'Return console logs produced by the page');
export const ScreenshotTool = mk('screenshot', 'Capture a PNG screenshot of the current page');
