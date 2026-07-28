import test from 'node:test';
import assert from 'node:assert';
import { PipelineService } from '../../src/services/pipelineService.js';

const win = globalThis.window || globalThis;

function setupPipeline(mock) {
    win.pipeline = mock;
}

function cleanupPipeline() {
    delete win.pipeline;
}

test('PipelineService should throw error if window.pipeline is missing', async () => {
    cleanupPipeline();
    await assert.rejects(async () => {
        await PipelineService.loadPipeline('text-classification', 'dummy-model');
    }, /Pipeline do Transformers.js não encontrado/);
});

test('PipelineService should return a callable function pipeline', async () => {
    const mockFn = async (input) => ({ result: `processed: ${input}` });
    setupPipeline(() => mockFn);

    const pipe = await PipelineService.loadPipeline('text-classification', 'dummy-model');
    assert.ok(typeof pipe === 'function' || typeof pipe === 'object', 'pipeline deve ser function ou object');
    const fn = typeof pipe === 'function' ? pipe : pipe.__call__ || pipe.call || pipe.run;
    assert.ok(typeof fn === 'function', 'deve existir um método executável');
    const output = await fn('test input');
    assert.deepStrictEqual(output, { result: 'processed: test input' });

    cleanupPipeline();
});

test('PipelineService should return an object pipeline with __call__ method', async () => {
    const mockObj = { __call__: async (input) => ({ result: `called: ${input}` }) };
    setupPipeline(() => mockObj);

    const pipe = await PipelineService.loadPipeline('text-classification', 'dummy-model');
    assert.strictEqual(typeof pipe, 'object');
    assert.strictEqual(typeof pipe.__call__, 'function');
    const output = await pipe.__call__('test');
    assert.deepStrictEqual(output, { result: 'called: test' });

    cleanupPipeline();
});
