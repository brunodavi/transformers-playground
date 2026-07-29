import test from 'node:test';
import assert from 'node:assert';
import { h } from 'preact';
import htm from 'htm';
import { render, screen, cleanup } from '@testing-library/preact';
import { TaskSelect } from '../../src/components/TaskSelect.js';
import { TASKS } from '../../src/constants/tasks.js';

const html = htm.bind(h);

test.afterEach(() => cleanup());

test('TaskSelect renders all tasks as options', () => {
    render(html`
        <${TaskSelect}
            tasks=${TASKS}
            value="text-classification"
            onChange=${() => {}}
            label="Task:"
            allowCustom=${false}
        />
    `);

    for (const task of TASKS.slice(0, 3)) {
        const option = screen.getByText(task.label);
        assert.ok(option, `Opção "${task.label}" deve estar presente`);
    }
});

test('TaskSelect shows custom input when allowCustom and value is custom', () => {
    render(html`
        <${TaskSelect}
            tasks=${TASKS}
            value="my-custom-task"
            onChange=${() => {}}
            label="Task:"
            allowCustom=${true}
        />
    `);

    const input = screen.getByPlaceholderText('Digite o ID da tarefa personalizada');
    assert.ok(input, 'Input personalizado deve aparecer quando valor não está na lista');
    assert.strictEqual(input.value, 'my-custom-task', 'Input deve exibir o valor personalizado');
});

test('TaskSelect does not show custom input when allowCustom is false', () => {
    render(html`
        <${TaskSelect}
            tasks=${TASKS}
            value="my-custom-task"
            onChange=${() => {}}
            label="Task:"
            allowCustom=${false}
        />
    `);

    const input = screen.queryByPlaceholderText('Digite o ID da tarefa personalizada');
    assert.strictEqual(input, null, 'Input personalizado não deve aparecer quando allowCustom é false');
});

test('TaskSelect calls onChange when selecting a task', () => {
    let changedValue = null;
    const onChange = (v) => { changedValue = v; };

    render(html`
        <${TaskSelect}
            tasks=${TASKS}
            value="text-classification"
            onChange=${onChange}
            label="Task:"
            allowCustom=${false}
        />
    `);

    const select = document.querySelector('select');
    Object.defineProperty(select, 'value', {
        value: 'summarization',
        writable: true,
        configurable: true,
    });
    select.dispatchEvent(new Event('change', { bubbles: true }));
    assert.strictEqual(changedValue, 'summarization');
});
