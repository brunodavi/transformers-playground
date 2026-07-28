import test from 'node:test';
import assert from 'node:assert';
import { h } from 'preact';
import htm from 'htm';
import { render, screen, cleanup } from '@testing-library/preact';
import { ProgressForm } from '../../src/components/ProgressForm.js';

const html = htm.bind(h);

test.afterEach(() => cleanup());

test('ProgressForm shows idle message when no files and not loading', () => {
    render(html`<${ProgressForm} files=${[]} allDone=${false} loading=${false} />`);

    const msg = screen.getByText('Nenhum download em andamento no momento.');
    assert.ok(msg, 'Mensagem de idle deve aparecer quando não há downloads');
});

test('ProgressForm shows downloading files', () => {
    const files = [
        { file: 'model.bin', status: 'downloading', loaded: 50, total: 100, percent: 50, loadedMB: '0.05', totalMB: '0.10' },
    ];

    render(html`<${ProgressForm} files=${files} allDone=${false} loading=${true} />`);

    const filename = screen.getByText(/model\.bin/);
    assert.ok(filename, 'Nome do arquivo deve aparecer');
    const percent = screen.getByText(/50%/);
    assert.ok(percent, 'Percentual deve aparecer');
});

test('ProgressForm shows completion message when allDone', () => {
    const files = [
        { file: 'model.bin', status: 'done', loaded: 100, total: 100, percent: 100, loadedMB: '0.10', totalMB: '0.10' },
    ];

    render(html`<${ProgressForm} files=${files} allDone=${true} loading=${false} />`);

    const done = screen.getByText('Download concluído!');
    assert.ok(done, 'Mensagem de conclusão deve aparecer');
});

test('ProgressForm shows indeterminate progress when file has no total', () => {
    const files = [
        { file: 'model.bin', status: 'downloading', loaded: 0, total: 0, percent: 0, loadedMB: '0.00', totalMB: '0.00' },
    ];

    render(html`<${ProgressForm} files=${files} allDone=${false} loading=${true} />`);

    const indeterminate = document.querySelector('progress[indeterminate]');
    assert.ok(indeterminate, 'Progress bar indeterminada deve aparecer quando não há total');
});
