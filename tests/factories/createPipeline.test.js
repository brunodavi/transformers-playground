import test from 'node:test';
import assert from 'node:assert';
import { createPipeline, runInference, checkModelExists } from '../../src/factories/createPipeline.js';

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

test('checkModelExists should return true when model exists', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({ ok: true });

    const result = await checkModelExists('Xenova/valid-model');
    assert.strictEqual(result, true);

    globalThis.fetch = originalFetch;
});

test('checkModelExists should return false when model does not exist', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({ ok: false });

    const result = await checkModelExists('Xenova/invalid-model');
    assert.strictEqual(result, false);

    globalThis.fetch = originalFetch;
});

test('checkModelExists should return null when fetch throws', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => { throw new Error('Network error'); };

    const result = await checkModelExists('Xenova/any-model');
    assert.strictEqual(result, null);

    globalThis.fetch = originalFetch;
});

test('checkModelExists should call fetch with correct URL and method', async () => {
    const originalFetch = globalThis.fetch;
    let calledUrl = '';
    let calledMethod = '';
    globalThis.fetch = async (url, opts) => {
        calledUrl = url;
        calledMethod = opts.method;
        return { ok: true };
    };

    await checkModelExists('Xenova/my-model');
    assert.strictEqual(calledUrl, 'https://huggingface.co/api/models/Xenova/my-model');
    assert.strictEqual(calledMethod, 'HEAD');

    globalThis.fetch = originalFetch;
});

test('createPipeline should pass progress_callback to pipeline', async () => {
    const win = globalThis.window || globalThis;
    let capturedOptions = null;
    const mockPipe = async () => ({ result: 'ok' });
    win.pipeline = async (task, model, options) => {
        capturedOptions = options;
        return mockPipe;
    };

    const callback = () => {};
    const result = await createPipeline('text-classification', 'some-model', callback);
    assert.strictEqual(result, mockPipe);
    assert.ok(capturedOptions !== null, 'options deve ser passado');
    assert.strictEqual(capturedOptions.progress_callback, callback);

    delete win.pipeline;
});

test('createPipeline should pass empty options when no callback', async () => {
    const win = globalThis.window || globalThis;
    let capturedOptions = null;
    const mockPipe = async () => ({ result: 'ok' });
    win.pipeline = async (task, model, options) => {
        capturedOptions = options;
        return mockPipe;
    };

    const result = await createPipeline('text-classification', 'some-model');
    assert.strictEqual(result, mockPipe);
    assert.deepStrictEqual(capturedOptions, {});

    delete win.pipeline;
});
