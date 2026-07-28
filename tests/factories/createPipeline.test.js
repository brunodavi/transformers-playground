import test from 'node:test';
import assert from 'node:assert';
import { createPipeline, runInference } from '../../src/factories/createPipeline.js';

const win = globalThis.window || globalThis;

function setupPipeline(mock) {
    win.pipeline = mock;
}

function cleanupPipeline() {
    delete win.pipeline;
}

test('createPipeline should throw if window.pipeline is missing', async () => {
    cleanupPipeline();
    await assert.rejects(() =>
        createPipeline('text-classification', 'dummy-model'),
        /Pipeline do Transformers.js não encontrado/
    );
});

test('createPipeline should return a function pipeline', async () => {
    const mockFn = async (input) => ({ result: `processed: ${input}` });
    setupPipeline(() => mockFn);

    const pipe = await createPipeline('text-classification', 'dummy-model');
    assert.ok(pipe !== undefined && pipe !== null, 'pipeline não deve ser null/undefined');
    assert.ok(typeof pipe === 'function', 'pipeline deve ser uma função');

    cleanupPipeline();
});

test('createPipeline should return an object pipeline', async () => {
    const mockObj = { __call__: async (input) => ({ result: `called: ${input}` }) };
    setupPipeline(() => mockObj);

    const pipe = await createPipeline('text-classification', 'dummy-model');
    assert.strictEqual(typeof pipe, 'object');

    cleanupPipeline();
});

test('runInference should call function pipeline directly', async () => {
    const mockFn = async (input) => ({ result: `processed: ${input}` });
    const output = await runInference(mockFn, 'hello');
    assert.deepStrictEqual(output, { result: 'processed: hello' });
});

test('runInference should call __call__ on object pipeline', async () => {
    const mockObj = { __call__: async (input) => ({ result: `called: ${input}` }) };
    const output = await runInference(mockObj, 'hello');
    assert.deepStrictEqual(output, { result: 'called: hello' });
});

test('runInference should call call method on object pipeline', async () => {
    const mockObj = { call: async (input) => ({ result: `call: ${input}` }) };
    const output = await runInference(mockObj, 'hello');
    assert.deepStrictEqual(output, { result: 'call: hello' });
});

test('runInference should call run method on object pipeline', async () => {
    const mockObj = { run: async (input) => ({ result: `run: ${input}` }) };
    const output = await runInference(mockObj, 'hello');
    assert.deepStrictEqual(output, { result: 'run: hello' });
});

test('runInference should prioritize __call__ over call and run', async () => {
    const mockObj = {
        __call__: async (input) => ({ result: `__call__: ${input}` }),
        call: async (input) => ({ result: `call: ${input}` }),
        run: async (input) => ({ result: `run: ${input}` }),
    };
    const output = await runInference(mockObj, 'hello');
    assert.deepStrictEqual(output, { result: '__call__: hello' });
});

test('runInference should throw if pipe is null', async () => {
    await assert.rejects(() => runInference(null, 'test'), /Pipeline não carregado/);
});

test('runInference should throw if pipe is undefined', async () => {
    await assert.rejects(() => runInference(undefined, 'test'), /Pipeline não carregado/);
});

test('runInference should throw if pipe is object without callable methods', async () => {
    await assert.rejects(() => runInference({}, 'test'), /Tipo de pipeline não suportado/);
});
