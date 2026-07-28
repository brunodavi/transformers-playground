import { h } from 'https://esm.sh/preact';
import htm from 'https://esm.sh/htm';

const html = htm.bind(h);

export function InferenceForm({ inputData, setInputData, loading, pipelineInstance, handleRunInference }) {
    return html`
        <article>
            <header><strong>2. Executar Inferência</strong></header>
            <form onSubmit=${handleRunInference}>
                <label>
                    Dados de Entrada (Input):
                    <textarea 
                        rows="3"
                        value=${inputData} 
                        onChange=${(e) => setInputData(e.target.value)}
                        placeholder="Digite o texto de entrada aqui..."
                        required
                    ></textarea>
                </label>

                <button type="submit" aria-busy=${loading} disabled=${!pipelineInstance || loading}>
                    Executar Pipeline
                </button>
            </form>
        </article>
    `;
}
