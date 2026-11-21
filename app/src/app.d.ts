// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		interface PageState {
			// Character form target ('new' or an id) when opened by in-app navigation; closing goes back.
			form?: string;
		}
		// interface Platform {}
	}
}

export {};
