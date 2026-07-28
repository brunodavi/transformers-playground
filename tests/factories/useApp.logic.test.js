import test from 'node:test';
import assert from 'node:assert';
import { runInference, createPipeline } from '../../src/factories/createPipeline.js';

const win = globalThis.window || globalThis;

function setupPipeline(mock) {
    win.pipeline = mock;
}

function cleanupPipeline() {
    delete win.pipeline;
}

// Simula a lógica central do useApp.handleLoadPipeline
async function simulateLoadPipeline(task, modelName) {
    if (!win.pipeline) {
        throw new Error('Pipeline do Transformers.js não encontrado no escopo global.');
    }
    const pipe = await win.pipeline(task, modelName);
    if (!pipe) {
        throw new Error('Pipeline retornou null/undefined.');
    }
    return pipe;
}

// Simula a lógica central do useApp.handleRunInference
async function simulateRunInference(pipe, input) {
    if (!pipe) {
        throw new Error('Por favor, carregue o pipeline primeiro.');
    }
    return await runInference(pipe, input);
}

test('useApp logic: load pipeline then run inference (function)', async () => {
    const mockFn = async (input) => ({ result: `inferred: ${input}` });
    setupPipeline(() => mockFn);

    const pipe = await simulateLoadPipeline('text-classification', 'some-model');
    assert.strictEqual(typeof pipe, 'function');

    const output = await simulateRunInference(pipe, 'test text');
    assert.deepStrictEqual(output, { result: 'inferred: test text' });

    cleanupPipeline();
});

test('useApp logic: load pipeline then run inference (object)', async () => {
    const mockObj = { __call__: async (input) => ({ result: `obj-inferred: ${input}` }) };
    setupPipeline(() => mockObj);

    const pipe = await simulateLoadPipeline('text-classification', 'some-model');
    assert.strictEqual(typeof pipe, 'object');

    const output = await simulateRunInference(pipe, 'test text');
    assert.deepStrictEqual(output, { result: 'obj-inferred: test text' });

    cleanupPipeline();
});

test('useApp logic: inference without loading should throw', async () => {
    await assert.rejects(
        () => simulateRunInference(null, 'test'),
        /Por favor, carregue o pipeline primeiro/
    );
});

test('useApp logic: load without pipeline global should throw', async () => {
    cleanupPipeline();
    await assert.rejects(
        () => simulateLoadPipeline('text-classification', 'any-model'),
        /Pipeline do Transformers.js não encontrado/
    );
});

test('useApp logic: inference with empty input should pass value to pipeline', async () => {
    const mockFn = async (input) => ({ result: `input was: "${input}"` });
    setupPipeline(() => mockFn);

    const pipe = await simulateLoadPipeline('text-classification', 'some-model');
    const output = await simulateRunInference(pipe, '');
    assert.deepStrictEqual(output, { result: 'input was: ""' });

    cleanupPipeline();
});

test('useApp logic: inference with object pipeline missing callable method', async () => {
    const pipe = { someData: true };
    await assert.rejects(
        () => simulateRunInference(pipe, 'test'),
        /Tipo de pipeline não suportado/
    );
});
