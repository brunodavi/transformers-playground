import test from 'node:test';
import assert from 'node:assert';
import { renderHook, act } from '@testing-library/preact';
import { useApp } from '../../src/hooks/useApp.js';

test.afterEach(() => {
    const win = globalThis.window || globalThis;
    delete win.pipeline;
});

test('useApp: load pipeline and run inference with mocked pipeline', async () => {
    const mockPipelineObj = {
        __call__: async (input) => ({
            label: 'POSITIVE',
            score: 0.98,
            input,
        }),
    };

    const win = globalThis.window || globalThis;
    win.pipeline = async (task, model, options) => {
        if (options && options.progress_callback) {
            options.progress_callback({ file: 'model.bin', status: 'done' });
        }
        return mockPipelineObj;
    };

    const { result } = renderHook(() => useApp());

    assert.strictEqual(result.current.task, 'text-classification');
    assert.strictEqual(result.current.loading, false);
    assert.strictEqual(result.current.result, null);
    assert.strictEqual(result.current.pipelineInstance, null);

    const loadEvent = { preventDefault: () => {} };
    await act(async () => {
        await result.current.handleLoadPipeline(loadEvent);
    });

    assert.ok(result.current.pipelineInstance !== null, 'pipelineInstance deve ser carregado');
    assert.strictEqual(result.current.loading, false);
    assert.ok(result.current.status.includes('sucesso'), 'Status deve indicar sucesso');

    act(() => {
        result.current.setInputData('I love this product!');
    });

    const inferEvent = { preventDefault: () => {} };
    await act(async () => {
        await result.current.handleRunInference(inferEvent);
    });

    assert.strictEqual(result.current.loading, false);
    assert.deepStrictEqual(result.current.result, {
        label: 'POSITIVE',
        score: 0.98,
        input: 'I love this product!',
    });
    assert.ok(result.current.status.includes('sucesso'), 'Status deve indicar inferência concluída');
});

test('useApp: run inference without loading pipeline should show error', () => {
    const { result } = renderHook(() => useApp());

    assert.strictEqual(result.current.pipelineInstance, null);

    const inferEvent = { preventDefault: () => {} };
    act(() => {
        result.current.handleRunInference(inferEvent);
    });

    assert.strictEqual(result.current.loading, false);
    assert.ok(result.current.status.includes('carregue o pipeline'), 'Status deve pedir para carregar pipeline');
});

test('useApp: pipeline loading failure should set error status', async () => {
    const win = globalThis.window || globalThis;
    win.pipeline = async () => {
        throw new Error('Model not found');
    };

    const { result } = renderHook(() => useApp());

    const loadEvent = { preventDefault: () => {} };
    await act(async () => {
        await result.current.handleLoadPipeline(loadEvent);
    });

    assert.strictEqual(result.current.pipelineInstance, null);
    assert.strictEqual(result.current.loading, false);
    assert.ok(result.current.status.includes('Model not found'), 'Status deve conter mensagem de erro');
});

test('useApp: pipeline inference failure should set error status', async () => {
    const mockPipelineObj = {
        __call__: async () => {
            throw new Error('Inference failed');
        },
    };

    const win = globalThis.window || globalThis;
    win.pipeline = async () => mockPipelineObj;

    const { result } = renderHook(() => useApp());

    const loadEvent = { preventDefault: () => {} };
    await act(async () => {
        await result.current.handleLoadPipeline(loadEvent);
    });

    assert.ok(result.current.pipelineInstance !== null);

    const inferEvent = { preventDefault: () => {} };
    await act(async () => {
        await result.current.handleRunInference(inferEvent);
    });

    assert.strictEqual(result.current.loading, false);
    assert.ok(result.current.status.includes('Inference failed'), 'Status deve conter erro da inferência');
});
