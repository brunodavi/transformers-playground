import { h } from 'https://esm.sh/preact';
import htm from 'https://esm.sh/htm';

const html = htm.bind(h);

export function InferenceForm({ inputData, setInputData, inferenceLoading, pipelineInstance, handleRunInference }) {
    return html`
        <article>
            <header><strong>Executar Inferência</strong></header>
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

                <button type="submit" aria-busy=${inferenceLoading} disabled=${!pipelineInstance || inferenceLoading}>
                    ${inferenceLoading ? 'Executando...' : 'Executar Pipeline'}
                </button>
            </form>
        </article>
    `;
}
