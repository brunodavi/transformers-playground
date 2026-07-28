import { h } from 'https://esm.sh/preact';
import htm from 'https://esm.sh/htm';

const html = htm.bind(h);

export function PipelineForm({ task, setTask, modelName, setModelName, loading, handleLoadPipeline }) {
    return html`
        <article>
            <header><strong>1. Configurar e Carregar Pipeline</strong></header>
            <form onSubmit=${handleLoadPipeline}>
                <label>
                    Tarefa (Task):
                    <select value=${task} onChange=${(e) => setTask(e.target.value)}>
                        <option value="text-classification">Text Classification</option>
                        <option value="sentiment-analysis">Sentiment Analysis</option>
                        <option value="summarization">Summarization</option>
                        <option value="translation">Translation</option>
                        <option value="feature-extraction">Feature Extraction</option>
                    </select>
                </label>

                <label>
                    Nome do Modelo (Hugging Face):
                    <input 
                        type="text" 
                        value=${modelName} 
                        onChange=${(e) => setModelName(e.target.value)} 
                        placeholder="ex: Xenova/distilbert-base-uncased-finetuned-sst-2-english" 
                        required
                    />
                </label>

                <button type="submit" aria-busy=${loading} disabled=${loading}>
                    Carregar Modelo
                </button>
            </form>
        </article>
    `;
}
