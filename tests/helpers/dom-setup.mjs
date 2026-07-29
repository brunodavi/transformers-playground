import { parseHTML } from 'linkedom';

const { document, window, HTMLElement, customElements, Event, CustomEvent } = parseHTML('<!DOCTYPE html><html><body><div id="app"></div></body></html>');

globalThis.document = document;
globalThis.window = window;
globalThis.HTMLElement = HTMLElement;
globalThis.customElements = customElements;
globalThis.Event = Event;
globalThis.CustomEvent = CustomEvent;

try {
    globalThis.navigator = { userAgent: 'node' };
} catch {
    Object.defineProperty(globalThis, 'navigator', {
        value: { userAgent: 'node' },
        writable: true,
        configurable: true,
    });
}

globalThis.self = window;
globalThis.location = new URL('http://localhost');
globalThis.getComputedStyle = () => ({});

if (globalThis.HTMLSelectElement && !('value' in HTMLSelectElement.prototype)) {
    Object.defineProperty(HTMLSelectElement.prototype, 'value', {
        get() {
            const opt = this.querySelector('option[selected]') || this.options?.[this.selectedIndex];
            return opt ? opt.value : '';
        },
        set(v) {
            const opt = this.querySelector(`option[value="${v}"]`);
            if (opt) opt.selected = true;
        },
        configurable: true,
    });
}

globalThis.pipeline = async (_task, _model, _options) => ({
    __call__: async (input) => ({ result: `processed: ${input}` }),
});
