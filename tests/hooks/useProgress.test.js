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
