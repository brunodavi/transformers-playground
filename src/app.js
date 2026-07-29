import { h, render } from 'https://esm.sh/preact';
import htm from 'https://esm.sh/htm';
import { useApp } from './hooks/useApp.js';
import { PipelineForm } from './components/PipelineForm.js';
import { InferenceForm } from './components/InferenceForm.js';
import { ProgressForm } from './components/ProgressForm.js';

const html = htm.bind(h);

function App() {
    const {
        task,
        setTask,
        modelName,
        setModelName,
        inputData,
        setInputData,
        loading,
        status,
        result,
        inferenceTime,
        pipelineInstance,
        files,
        allDone,
        handleLoadPipeline,
        handleRunInference,
    } = useApp();

    return html`
        <div>
            <${PipelineForm} 
                task=${task} 
                setTask=${setTask} 
                modelName=${modelName} 
                setModelName=${setModelName} 
                loading=${loading} 
                handleLoadPipeline=${handleLoadPipeline} 
            />

            <${ProgressForm}
                files=${files}
                allDone=${allDone}
                loading=${loading} 
            />

            <${InferenceForm} 
                inputData=${inputData} 
                setInputData=${setInputData} 
                loading=${loading} 
                pipelineInstance=${pipelineInstance} 
                handleRunInference=${handleRunInference} 
            />

            ${status && html`<p><em>Status: ${status}</em></p>`}

            ${result !== null && html`
                <article>
                    <header><strong>Resultado</strong></header>
                    ${inferenceTime !== null && html`
                        <small>Tempo: ${inferenceTime}s</small>
                    `}
                    <pre><code>${JSON.stringify(result, null, 2)}</code></pre>
                </article>
            `}
        </div>
    `;
}

render(html`<${App} />`, document.getElementById('app'));
