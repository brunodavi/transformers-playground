import test from 'node:test';
import assert from 'node:assert';
import { h } from 'preact';
import htm from 'htm';
import { render, screen, fireEvent, cleanup } from '@testing-library/preact';
import { PipelineForm } from '../../src/components/PipelineForm.js';

const html = htm.bind(h);

test.afterEach(() => cleanup());

test('PipelineForm renders task select and model input', () => {
    const setTask = () => {};
    const setModelName = () => {};
    const handleLoadPipeline = () => {};

    render(html`
        <${PipelineForm}
            task="text-classification"
            setTask=${setTask}
            modelName="Xenova/test-model"
            setModelName=${setModelName}
            loading=${false}
            handleLoadPipeline=${handleLoadPipeline}
        />
    `);

    const button = screen.getByText('Carregar Modelo');
    assert.ok(button, 'Botão de carregar deve estar presente');
    assert.strictEqual(button.disabled, false, 'Botão deve estar habilitado quando não estiver carregando');
});

test('PipelineForm disables button while loading', () => {
    const setTask = () => {};
    const setModelName = () => {};
    const handleLoadPipeline = () => {};

    render(html`
        <${PipelineForm}
            task="text-classification"
            setTask=${setTask}
            modelName="Xenova/test-model"
            setModelName=${setModelName}
            loading=${true}
            handleLoadPipeline=${handleLoadPipeline}
        />
    `);

    const button = screen.getByText('Carregar Modelo');
    assert.ok(button.disabled, 'Botão deve estar desabilitado durante loading');
});

test('PipelineForm submits form on button click', async () => {
    let submitted = false;
    const handleLoadPipeline = (e) => {
        e.preventDefault();
        submitted = true;
    };

    render(html`
        <${PipelineForm}
            task="text-classification"
            setTask=${() => {}}
            modelName="Xenova/test-model"
            setModelName=${() => {}}
            loading=${false}
            handleLoadPipeline=${handleLoadPipeline}
        />
    `);

    const form = document.querySelector('form');
    fireEvent.submit(form);
    assert.ok(submitted, 'handleLoadPipeline deve ser chamado ao submeter o form');
});
