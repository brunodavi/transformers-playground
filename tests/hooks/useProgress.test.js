import test from 'node:test';
import assert from 'node:assert';
// Removemos importações que carregam URLs https durante o teste node

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
});
