import test from 'node:test';
import assert from 'node:assert';
import { h } from 'preact';
import htm from 'htm';
import { render, screen, fireEvent, cleanup } from '@testing-library/preact';
import { InferenceForm } from '../../src/components/InferenceForm.js';

const html = htm.bind(h);

test.afterEach(() => cleanup());

test('InferenceForm renders textarea and execute button', () => {
    render(html`
        <${InferenceForm}
            inputData="test input"
            setInputData=${() => {}}
            loading=${false}
            pipelineInstance=${{}}
            handleRunInference=${() => {}}
        />
    `);

    const button = screen.getByText('Executar Pipeline');
    assert.ok(button, 'Botão de execução deve estar presente');
    assert.strictEqual(button.disabled, false, 'Botão deve estar habilitado com pipeline carregado');
});

test('InferenceForm disables button when no pipeline loaded', () => {
    render(html`
        <${InferenceForm}
            inputData="test input"
            setInputData=${() => {}}
            loading=${false}
            pipelineInstance=${null}
            handleRunInference=${() => {}}
        />
    `);

    const button = screen.getByText('Executar Pipeline');
    assert.ok(button.disabled, 'Botão deve estar desabilitado sem pipeline carregado');
});

test('InferenceForm disables button while loading', () => {
    render(html`
        <${InferenceForm}
            inputData="test input"
            setInputData=${() => {}}
            loading=${true}
            pipelineInstance=${{}}
            handleRunInference=${() => {}}
        />
    `);

    const button = screen.getByText('Executar Pipeline');
    assert.ok(button.disabled, 'Botão deve estar desabilitado durante loading');
});

test('InferenceForm calls handleRunInference on submit', () => {
    let submitted = false;
    const handleRunInference = (e) => {
        e.preventDefault();
        submitted = true;
    };

    render(html`
        <${InferenceForm}
            inputData="test input"
            setInputData=${() => {}}
            loading=${false}
            pipelineInstance=${{}}
            handleRunInference=${handleRunInference}
        />
    `);

    const form = document.querySelector('form');
    fireEvent.submit(form);
    assert.ok(submitted, 'handleRunInference deve ser chamado ao submeter o form');
});

test('InferenceForm updates textarea value when inputData changes', () => {
    const { rerender } = render(html`
        <${InferenceForm}
            inputData="initial"
            setInputData=${() => {}}
            loading=${false}
            pipelineInstance=${{}}
            handleRunInference=${() => {}}
        />
    `);

    const textarea = screen.getByPlaceholderText('Digite o texto de entrada aqui...');
    assert.ok(textarea, 'Textarea deve estar presente');
    assert.strictEqual(textarea.value, 'initial', 'Textarea deve exibir o valor inicial');

    rerender(html`
        <${InferenceForm}
            inputData="updated"
            setInputData=${() => {}}
            loading=${false}
            pipelineInstance=${{}}
            handleRunInference=${() => {}}
        />
    `);

    assert.strictEqual(textarea.value, 'updated', 'Textarea deve atualizar quando inputData muda');
});
