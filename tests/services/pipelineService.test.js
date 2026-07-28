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

test('PipelineService should throw error if loaded pipeline is not callable', async () => {
    const mockPipe = { not: 'a function' };
    setupPipeline(() => mockPipe);

    await assert.rejects(async () => {
        await PipelineService.loadPipeline('text-classification', 'dummy-model');
    }, /Pipeline carregado não é uma função/);

    cleanupPipeline();
});

test('PipelineService should return a callable pipeline after loading', async () => {
    const mockInference = async (input) => ({ result: `processed: ${input}` });
    setupPipeline(() => mockInference);

    const pipe = await PipelineService.loadPipeline('text-classification', 'dummy-model');
    console.log(`[DIAG] typeof pipe: ${typeof pipe}`);
    console.log(`[DIAG] pipe === null: ${pipe === null}`);
    console.log(`[DIAG] pipe === undefined: ${pipe === undefined}`);
    console.log(`[DIAG] pipe keys: ${Object.keys(pipe).join(', ') || '(none - é função)'}`);
    assert.strictEqual(typeof pipe, 'function', 'A pipeline carregada deve ser uma função');
    const output = await pipe('test input');
    assert.deepStrictEqual(output, { result: 'processed: test input' });

    cleanupPipeline();
});

test('PipelineService should throw if loaded pipeline is a non-callable object', async () => {
    const mockNonCallable = { run: async (x) => x, name: 'fake-pipeline' };
    setupPipeline(() => mockNonCallable);

    console.log(`[DIAG] typeof non-callable pipeline: ${typeof mockNonCallable}`);
    try {
        await PipelineService.loadPipeline('text-classification', 'dummy-model');
        assert.fail('Deveria ter lançado erro');
    } catch (err) {
        console.log(`[DIAG] error message: "${err.message}"`);
        assert.match(err.message, /Pipeline carregado não é uma função/);
    }

    cleanupPipeline();
});
