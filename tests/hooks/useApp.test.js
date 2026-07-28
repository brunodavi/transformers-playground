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

test('useApp logic: pipeline returning non-json result', async () => {
    const mockFn = async (input) => input.toUpperCase();
    setupPipeline(() => mockFn);

    const pipe = await simulateLoadPipeline('text-classification', 'some-model');
    const output = await simulateRunInference(pipe, 'hello');
    assert.strictEqual(output, 'HELLO');

    cleanupPipeline();
});

test('useApp logic: pipeline that throws during inference', async () => {
    const mockFn = async () => { throw new Error('Model failed'); };
    setupPipeline(() => mockFn);

    const pipe = await simulateLoadPipeline('text-classification', 'some-model');
    await assert.rejects(
        () => simulateRunInference(pipe, 'test'),
        /Model failed/
    );

    cleanupPipeline();
});

test('useApp logic: model name with special characters', async () => {
    const mockFn = async (input) => ({ result: input });
    const modelName = 'Xenova/bert-base-multilingual-uncased-sentiment';
    setupPipeline((task, model) => {
        assert.strictEqual(model, modelName);
        return mockFn;
    });

    const pipe = await simulateLoadPipeline('sentiment-analysis', modelName);
    const output = await simulateRunInference(pipe, 'olá mundo');
    assert.deepStrictEqual(output, { result: 'olá mundo' });

    cleanupPipeline();
});

test('useApp logic: object pipeline only has run method', async () => {
    const mockObj = { run: async (input) => ({ result: `run: ${input}` }) };
    setupPipeline(() => mockObj);

    const pipe = await simulateLoadPipeline('text-classification', 'some-model');
    const output = await simulateRunInference(pipe, 'fallback');
    assert.deepStrictEqual(output, { result: 'run: fallback' });

    cleanupPipeline();
});

test('useApp logic: object pipeline only has call method', async () => {
    const mockObj = { call: async (input) => ({ result: `call: ${input}` }) };
    setupPipeline(() => mockObj);

    const pipe = await simulateLoadPipeline('text-classification', 'some-model');
    const output = await simulateRunInference(pipe, 'via-call');
    assert.deepStrictEqual(output, { result: 'call: via-call' });

    cleanupPipeline();
});

test('useApp logic: load pipeline with progress callback', async () => {
    let progressCalled = false;
    const mockFn = async (input) => ({ result: input });
    setupPipeline((task, model, options) => {
        if (options && options.progress_callback) {
            options.progress_callback({ file: 'model.bin', status: 'done' });
            progressCalled = true;
        }
        return mockFn;
    });

    const options = { progress_callback: () => {} };
    const pipe = await createPipeline('text-classification', 'some-model', options.progress_callback);
    assert.strictEqual(typeof pipe, 'function');
    assert.ok(progressCalled);

    cleanupPipeline();
});
