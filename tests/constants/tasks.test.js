import test from 'node:test';
import assert from 'node:assert';
import { TASKS } from '../../src/constants/tasks.js';

test('TASKS should be an array', () => {
    assert.ok(Array.isArray(TASKS));
});

test('TASKS should have at least one item', () => {
    assert.ok(TASKS.length > 0);
});

test('each task should have value and label as non-empty strings', () => {
    for (const task of TASKS) {
        assert.ok(typeof task.value === 'string' && task.value.length > 0, `value inválido: ${JSON.stringify(task)}`);
        assert.ok(typeof task.label === 'string' && task.label.length > 0, `label inválido: ${JSON.stringify(task)}`);
    }
});

test('TASKS should not have duplicate values', () => {
    const values = TASKS.map(t => t.value);
    const uniqueValues = new Set(values);
    assert.strictEqual(values.length, uniqueValues.size);
});

test('TASKS should not have duplicate labels', () => {
    const labels = TASKS.map(t => t.label);
    const uniqueLabels = new Set(labels);
    assert.strictEqual(labels.length, uniqueLabels.size);
});

test('TASKS should include common expected tasks', () => {
    const values = TASKS.map(t => t.value);
    const expected = [
        'text-classification',
        'sentiment-analysis',
        'summarization',
        'translation',
        'text-generation',
        'image-classification',
        'object-detection',
        'audio-classification',
        'automatic-speech-recognition',
    ];
    for (const v of expected) {
        assert.ok(values.includes(v), `Tarefa esperada não encontrada: ${v}`);
    }
});

test('TASKS labels should be unique for each entry', () => {
    const labelMap = {};
    for (const task of TASKS) {
        if (labelMap[task.label]) {
            assert.fail(`Label duplicado: "${task.label}" nos values "${labelMap[task.label]}" e "${task.value}"`);
        }
        labelMap[task.label] = task.value;
    }
});
