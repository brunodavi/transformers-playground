import { h } from 'https://esm.sh/preact';
import htm from 'https://esm.sh/htm';

const html = htm.bind(h);

export function ProgressForm({ progress, loading }) {
    return html`
        <article>
            <header><strong>Progresso do Download do Modelo</strong></header>
            ${!loading && progress.length === 0 && html`
                <p>Nenhum download em andamento no momento.</p>
            `}
            ${progress.length > 0 && html`
                <div>
                    ${progress.map((item, index) => html`
                        <div key=${index} style="margin-bottom: 1rem;">
                            <small><strong>${item.file || item.name || 'Arquivo'}</strong> - ${item.status || 'Baixando'}</small>
                            ${item.total ? html`
                                <progress value=${item.loaded} max=${item.total}></progress>
                                <small>${Math.round((item.loaded / item.total) * 100)}% (${(item.loaded / 1024 / 1024).toFixed(2)} MB / ${(item.total / 1024 / 1024).toFixed(2)} MB)</small>
                            ` : html`
                                <progress indeterminate></progress>
                            `}
                        </div>
                    `)}
                </div>
            `}
        </article>
    `;
}
