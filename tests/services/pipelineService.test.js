import test from 'node:test';
import assert from 'node:assert';
import { PipelineService } from '../../src/services/pipelineService.js';

test('PipelineService should throw error if window.pipeline is missing', async () => {
    const originalPipeline = globalThis.window?.pipeline;
    if (globalThis.window) {
        delete globalThis.window.pipeline;
    }

    await assert.rejects(async () => {
        await PipelineService.loadPipeline('text-classification', 'dummy-model');
    }, /Pipeline do Transformers.js não encontrado/);

    if (originalPipeline && globalThis.window) {
        globalThis.window.pipeline = originalPipeline;
    }
});
