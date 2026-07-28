import { h } from 'https://esm.sh/preact';
import htm from 'https://esm.sh/htm';

const html = htm.bind(h);

export function ProgressForm({ files, allDone, loading }) {
    return html`
        <article>
            <header><strong>Progresso do Download do Modelo</strong></header>
            ${!loading && files.length === 0 && html`
                <p>Nenhum download em andamento no momento.</p>
            `}
            ${files.length > 0 && !allDone && html`
                <div>
                    ${files.map((item, index) => html`
                        <div key=${index} style="margin-bottom: 1rem;">
                            <small><strong>${item.file || item.name || 'Arquivo'}</strong> - ${item.status || 'Baixando'}</small>
                            ${item.total ? html`
                                <progress value=${item.loaded} max=${item.total}></progress>
                                <small>${item.percent}% (${item.loadedMB} MB / ${item.totalMB} MB)</small>
                            ` : html`
                                <progress indeterminate></progress>
                            `}
                        </div>
                    `)}
                </div>
            `}
            ${allDone && html`
                <p>Download concluído!</p>
            `}
        </article>
    `;
}
