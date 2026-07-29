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

test('useApp: changing task after load failure clears error status', async () => {
    const win = globalThis.window || globalThis;
    win.pipeline = async () => {
        throw new Error('Model not found');
    };

    const { result } = renderHook(() => useApp());

    const loadEvent = { preventDefault: () => {} };
    await act(async () => {
        await result.current.handleLoadPipeline(loadEvent);
    });

    assert.ok(result.current.status.includes('Model not found'), 'Status deve conter erro');
    assert.strictEqual(result.current.loading, false);

    act(() => {
        result.current.setTask('summarization');
    });

    assert.strictEqual(result.current.status, '');
    assert.strictEqual(result.current.result, null);
    assert.strictEqual(result.current.loading, false);
    assert.deepStrictEqual(result.current.files, []);
});

test('useApp: changing task after successful load clears pipeline and status', async () => {
    const mockPipelineObj = {
        __call__: async (_input) => ({ label: 'POSITIVE', score: 0.98 }),
    };

    const win = globalThis.window || globalThis;
    win.pipeline = async () => mockPipelineObj;

    const { result } = renderHook(() => useApp());

    const loadEvent = { preventDefault: () => {} };
    await act(async () => {
        await result.current.handleLoadPipeline(loadEvent);
    });

    assert.ok(result.current.status.includes('sucesso'), 'Status deve indicar sucesso');
    assert.ok(result.current.pipelineInstance !== null, 'Pipeline deve estar carregado');

    act(() => {
        result.current.setTask('translation');
    });

    assert.strictEqual(result.current.status, '');
    assert.strictEqual(result.current.result, null);
    assert.strictEqual(result.current.pipelineInstance, null);
    assert.strictEqual(result.current.loading, false);
    assert.deepStrictEqual(result.current.files, []);
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

test('useApp: after pipeline load fails with progress done, changing task and loading another model works', async () => {
    const win = globalThis.window || globalThis;
    win.pipeline = async (task, model, options) => {
        if (options?.progress_callback) {
            options.progress_callback({ file: 'model.safetensors', status: 'progress', progress: 50 });
            options.progress_callback({ file: 'model.safetensors', status: 'done', progress: 100 });
        }
        throw new Error('Failed to load model');
    };

    const { result } = renderHook(() => useApp());

    const loadEvent = { preventDefault: () => {} };
    await act(async () => {
        await result.current.handleLoadPipeline(loadEvent);
    });

    assert.strictEqual(result.current.pipelineInstance, null);
    assert.ok(result.current.status.includes('Failed to load model'), 'Status deve conter erro');
    assert.strictEqual(result.current.loading, false);
    assert.ok(result.current.files.length > 0, 'Progress files devem ter sido registrados');

    act(() => {
        result.current.setTask('summarization');
    });

    assert.strictEqual(result.current.status, '');
    assert.strictEqual(result.current.pipelineInstance, null);
    assert.strictEqual(result.current.loading, false);
    assert.deepStrictEqual(result.current.files, []);

    win.pipeline = async (task, model, options) => {
        if (options?.progress_callback) {
            options.progress_callback({ file: 'config.json', status: 'progress', progress: 30 });
            options.progress_callback({ file: 'config.json', status: 'done', progress: 100 });
        }
        return {
            __call__: async (input) => ({ result: `processed: ${input}` }),
        };
    };

    await act(async () => {
        await result.current.handleLoadPipeline(loadEvent);
    });

    assert.ok(result.current.pipelineInstance !== null, 'pipelineInstance deve ser carregado');
    assert.ok(result.current.status.includes('sucesso'), 'Status deve indicar sucesso');
    assert.strictEqual(result.current.loading, false);
    assert.ok(result.current.files.length > 0, 'Progress files devem refletir novo download');
});
