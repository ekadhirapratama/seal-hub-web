// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		interface PageState {
			// Set when the character form was opened by in-app navigation, so closing can go back.
			formOpen?: boolean;
		}
		// interface Platform {}
	}
}

export {};
