import test from 'node:test';
import assert from 'node:assert';

test('useProgress mock logic test', () => {
    let state = [];
    const setState = (updater) => {
        state = typeof updater === 'function' ? updater(state) : updater;
    };

    const handleProgress = (info) => {
        setState((prev) => {
            const index = prev.findIndex(p => p.file === info.file);
            if (index !== -1) {
                const updated = [...prev];
                updated[index] = info;
                return updated;
            } else {
                return [...prev, info];
            }
        });
    };

    handleProgress({ file: 'model.json', status: 'downloading' });
    assert.strictEqual(state.length, 1);
    assert.strictEqual(state[0].file, 'model.json');

    handleProgress({ file: 'model.json', status: 'done' });
    assert.strictEqual(state.length, 1);
    assert.strictEqual(state[0].status, 'done');

    handleProgress({ file: 'progress_total', loaded: 100, total: 500, status: 'downloading' });
    assert.strictEqual(state.length, 2);
    const files = state.filter(i => i.file !== 'progress_total');
    assert.strictEqual(files.length, 1);

    const allDone = files.length > 0 && files.every(i => i.status === 'done');
    assert.strictEqual(allDone, true);
});

test('useProgress should handle multiple distinct files', () => {
    let state = [];
    const setState = (updater) => {
        state = typeof updater === 'function' ? updater(state) : updater;
    };

    const handleProgress = (info) => {
        setState((prev) => {
            const index = prev.findIndex(p => p.file === info.file);
            if (index !== -1) {
                const updated = [...prev];
                updated[index] = info;
                return updated;
            } else {
                return [...prev, info];
            }
        });
    };

    handleProgress({ file: 'model.bin', status: 'downloading', loaded: 50, total: 100 });
    handleProgress({ file: 'config.json', status: 'downloading', loaded: 10, total: 50 });
    handleProgress({ file: 'tokenizer.json', status: 'downloading', loaded: 0, total: 30 });

    assert.strictEqual(state.length, 3);
    assert.strictEqual(state[0].file, 'model.bin');
    assert.strictEqual(state[1].file, 'config.json');
    assert.strictEqual(state[2].file, 'tokenizer.json');
});

test('useProgress should transition files to done status', () => {
    let state = [];
    const setState = (updater) => {
        state = typeof updater === 'function' ? updater(state) : updater;
    };

    const handleProgress = (info) => {
        setState((prev) => {
            const index = prev.findIndex(p => p.file === info.file);
            if (index !== -1) {
                const updated = [...prev];
                updated[index] = info;
                return updated;
            } else {
                return [...prev, info];
            }
        });
    };

    handleProgress({ file: 'model.bin', status: 'downloading', loaded: 0, total: 100 });
    handleProgress({ file: 'model.bin', status: 'downloading', loaded: 50, total: 100 });
    handleProgress({ file: 'model.bin', status: 'done', loaded: 100, total: 100 });

    assert.strictEqual(state.length, 1);
    assert.strictEqual(state[0].status, 'done');
    assert.strictEqual(state[0].loaded, 100);
});

test('useProgress reset should clear all progress', () => {
    let state = [];
    const setState = (updater) => {
        state = typeof updater === 'function' ? updater(state) : updater;
    };

    const handleProgress = (info) => {
        setState((prev) => {
            const index = prev.findIndex(p => p.file === info.file);
            if (index !== -1) {
                const updated = [...prev];
                updated[index] = info;
                return updated;
            } else {
                return [...prev, info];
            }
        });
    };

    const resetProgress = () => {
        setState([]);
    };

    handleProgress({ file: 'model.bin', status: 'downloading' });
    handleProgress({ file: 'config.json', status: 'downloading' });
    assert.strictEqual(state.length, 2);

    resetProgress();
    assert.strictEqual(state.length, 0);
});

test('useProgress should handle progress_total without adding to files', () => {
    let state = [];
    const setState = (updater) => {
        state = typeof updater === 'function' ? updater(state) : updater;
    };

    const handleProgress = (info) => {
        setState((prev) => {
            const index = prev.findIndex(p => p.file === info.file);
            if (index !== -1) {
                const updated = [...prev];
                updated[index] = info;
                return updated;
            } else {
                return [...prev, info];
            }
        });
    };

    const files = () => state
        .filter(i => i.file && i.file !== 'progress_total')
        .map(i => ({
            ...i,
            percent: i.total ? Math.round((i.loaded / i.total) * 100) : 0,
            loadedMB: (i.loaded / 1024 / 1024).toFixed(2),
            totalMB: i.total ? (i.total / 1024 / 1024).toFixed(2) : null,
        }));

    handleProgress({ file: 'progress_total', loaded: 500, total: 2000, status: 'downloading' });
    handleProgress({ file: 'model.bin', loaded: 100, total: 500, status: 'downloading' });

    const result = files();
    assert.strictEqual(result.length, 1, 'progress_total deve ser filtrado');
    assert.strictEqual(result[0].file, 'model.bin');
});

test('useProgress should handle ready status as done', () => {
    let state = [];
    const setState = (updater) => {
        state = typeof updater === 'function' ? updater(state) : updater;
    };

    const handleProgress = (info) => {
        setState((prev) => {
            const index = prev.findIndex(p => p.file === info.file);
            if (index !== -1) {
                const updated = [...prev];
                updated[index] = info;
                return updated;
            } else {
                return [...prev, info];
            }
        });
    };

    const finished = (status) => status === 'done' || status === 'ready';
    const allDone = () => {
        const files = state.filter(i => i.file && i.file !== 'progress_total');
        return files.length > 0 && files.every(i => finished(i.status));
    };

    handleProgress({ file: 'model.bin', status: 'ready' });
    handleProgress({ file: 'config.json', status: 'ready' });

    assert.strictEqual(allDone(), true);
});

test('useProgress should compute percent correctly', () => {
    let state = [];
    const setState = (updater) => {
        state = typeof updater === 'function' ? updater(state) : updater;
    };

    const handleProgress = (info) => {
        setState((prev) => {
            const index = prev.findIndex(p => p.file === info.file);
            if (index !== -1) {
                const updated = [...prev];
                updated[index] = info;
                return updated;
            } else {
                return [...prev, info];
            }
        });
    };

    const files = () => state
        .filter(i => i.file && i.file !== 'progress_total')
        .map(i => ({
            ...i,
            percent: i.total ? Math.round((i.loaded / i.total) * 100) : 0,
        }));

    handleProgress({ file: 'model.bin', loaded: 256, total: 1024, status: 'downloading' });
    const result = files();
    assert.strictEqual(result[0].percent, 25);
});
