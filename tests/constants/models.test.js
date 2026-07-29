import test from 'node:test';
import assert from 'node:assert';
import { TASKS } from '../../src/constants/tasks.js';
import { TASK_MODELS } from '../../src/constants/models.js';

test('TASK_MODELS should be an object', () => {
    assert.ok(typeof TASK_MODELS === 'object' && TASK_MODELS !== null && !Array.isArray(TASK_MODELS));
});

test('TASK_MODELS should have an entry for every task in TASKS', () => {
    for (const task of TASKS) {
        assert.ok(
            Object.hasOwn(TASK_MODELS, task.value),
            `Faltando modelo recomendado para: ${task.value}`,
        );
    }
});

test('each model should be a non-empty string', () => {
    for (const [task, model] of Object.entries(TASK_MODELS)) {
        assert.ok(typeof model === 'string' && model.length > 0, `Modelo inválido para ${task}: ${JSON.stringify(model)}`);
    }
});

test('TASK_MODELS should not have extra entries not in TASKS', () => {
    const taskValues = TASKS.map(t => t.value);
    for (const key of Object.keys(TASK_MODELS)) {
        assert.ok(taskValues.includes(key), `Chave "${key}" não existe em TASKS`);
    }
});

test('all model values should start with Xenova/', () => {
    for (const [task, model] of Object.entries(TASK_MODELS)) {
        assert.ok(model.startsWith('Xenova/'), `Modelo para ${task} não começa com Xenova/: ${model}`);
    }
});
