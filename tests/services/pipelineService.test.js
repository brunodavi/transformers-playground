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
    assert.strictEqual(typeof pipe, 'function', 'A pipeline carregada deve ser uma função');
    const output = await pipe('test input');
    assert.deepStrictEqual(output, { result: 'processed: test input' });

    cleanupPipeline();
});
