import test from 'node:test';
import assert from 'node:assert';
import { renderHook, act } from '@testing-library/preact';
import { useProgress } from '../../src/hooks/useProgress.js';

test('useProgress starts with empty files', () => {
    const { result } = renderHook(() => useProgress());
    assert.deepStrictEqual(result.current.files, []);
    assert.strictEqual(result.current.allDone, false);
});

test('useProgress adds files via handleProgress', () => {
    const { result } = renderHook(() => useProgress());

    act(() => {
        result.current.handleProgress({ file: 'model.bin', status: 'downloading', loaded: 0, total: 100 });
    });

    assert.strictEqual(result.current.files.length, 1);
    assert.strictEqual(result.current.files[0].file, 'model.bin');
    assert.strictEqual(result.current.files[0].status, 'downloading');
});

test('useProgress updates existing file on second handleProgress call', () => {
    const { result } = renderHook(() => useProgress());

    act(() => {
        result.current.handleProgress({ file: 'model.bin', status: 'downloading', loaded: 0, total: 100 });
    });
    act(() => {
        result.current.handleProgress({ file: 'model.bin', status: 'downloading', loaded: 50, total: 100 });
    });

    assert.strictEqual(result.current.files.length, 1);
    assert.strictEqual(result.current.files[0].loaded, 50);
});

test('useProgress filters out progress_total from files', () => {
    const { result } = renderHook(() => useProgress());

    act(() => {
        result.current.handleProgress({ file: 'progress_total', loaded: 500, total: 2000, status: 'downloading' });
    });
    act(() => {
        result.current.handleProgress({ file: 'model.bin', loaded: 100, total: 500, status: 'downloading' });
    });

    assert.strictEqual(result.current.files.length, 1);
    assert.strictEqual(result.current.files[0].file, 'model.bin');
});

test('useProgress allDone true when all files done', () => {
    const { result } = renderHook(() => useProgress());

    act(() => {
        result.current.handleProgress({ file: 'model.bin', status: 'done', loaded: 100, total: 100 });
    });

    assert.strictEqual(result.current.allDone, true);
});

test('useProgress allDone true when all files ready', () => {
    const { result } = renderHook(() => useProgress());

    act(() => {
        result.current.handleProgress({ file: 'model.bin', status: 'ready' });
    });

    assert.strictEqual(result.current.allDone, true);
});

test('useProgress allDone false when files still downloading', () => {
    const { result } = renderHook(() => useProgress());

    act(() => {
        result.current.handleProgress({ file: 'model.bin', status: 'downloading', loaded: 50, total: 100 });
    });

    assert.strictEqual(result.current.allDone, false);
});

test('useProgress resetProgress clears all files', () => {
    const { result } = renderHook(() => useProgress());

    act(() => {
        result.current.handleProgress({ file: 'model.bin', status: 'downloading', loaded: 0, total: 100 });
    });
    act(() => {
        result.current.resetProgress();
    });

    assert.strictEqual(result.current.files.length, 0);
    assert.strictEqual(result.current.allDone, false);
});

test('useProgress computes percent correctly', () => {
    const { result } = renderHook(() => useProgress());

    act(() => {
        result.current.handleProgress({ file: 'model.bin', loaded: 256, total: 1024, status: 'downloading' });
    });

    assert.strictEqual(result.current.files[0].percent, 25);
});

test('useProgress handles multiple distinct files', () => {
    const { result } = renderHook(() => useProgress());

    act(() => {
        result.current.handleProgress({ file: 'model.bin', status: 'downloading', loaded: 50, total: 100 });
    });
    act(() => {
        result.current.handleProgress({ file: 'config.json', status: 'downloading', loaded: 10, total: 50 });
    });

    assert.strictEqual(result.current.files.length, 2);
    assert.strictEqual(result.current.files[0].file, 'model.bin');
    assert.strictEqual(result.current.files[1].file, 'config.json');
});

test('useProgress transitions file to done', () => {
    const { result } = renderHook(() => useProgress());

    act(() => {
        result.current.handleProgress({ file: 'model.bin', status: 'downloading', loaded: 0, total: 100 });
    });
    act(() => {
        result.current.handleProgress({ file: 'model.bin', status: 'downloading', loaded: 50, total: 100 });
    });
    act(() => {
        result.current.handleProgress({ file: 'model.bin', status: 'done', loaded: 100, total: 100 });
    });

    assert.strictEqual(result.current.files.length, 1);
    assert.strictEqual(result.current.files[0].status, 'done');
    assert.strictEqual(result.current.files[0].loaded, 100);
});
