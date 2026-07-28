import { h } from 'https://esm.sh/preact';
import htm from 'https://esm.sh/htm';

const html = htm.bind(h);

export function TaskSelect({ tasks, value, onChange, label, allowCustom }) {
    const isCustom = !tasks.some(t => t.value === value);

    return html`
        <label>
            ${label}
            <select
                value=${isCustom && allowCustom ? '' : value}
                onChange=${(e) => {
                    if (e.target.value) {
                        onChange(e.target.value);
                    }
                }}
            >
                ${allowCustom && html`<option value="">Personalizado...</option>`}
                ${tasks.map(task => html`
                    <option value=${task.value}>${task.label}</option>
                `)}
            </select>
            ${allowCustom && isCustom && html`
                <input
                    type="text"
                    value=${value}
                    onInput=${(e) => onChange(e.target.value)}
                    placeholder="Digite o ID da tarefa personalizada"
                    style="margin-top: 0.5rem;"
                />
            `}
        </label>
    `;
}
