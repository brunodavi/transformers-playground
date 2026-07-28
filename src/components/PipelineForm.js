import { h } from 'https://esm.sh/preact';
import htm from 'https://esm.sh/htm';
import { TASKS } from '../constants/tasks.js';
import { TASK_MODELS } from '../constants/models.js';
import { TaskSelect } from './TaskSelect.js';
import { ModelInput } from './ModelInput.js';

const html = htm.bind(h);

export function PipelineForm({ task, setTask, modelName, setModelName, loading, handleLoadPipeline }) {
    const handleTaskChange = (newTask) => {
        setTask(newTask);
        const recommended = TASK_MODELS[newTask];
        if (recommended) {
            setModelName(recommended);
        }
    };

    return html`
        <article>
            <header><strong>Configurar e Carregar Pipeline</strong></header>
            <form onSubmit=${handleLoadPipeline}>
                <${TaskSelect}
                    label="Tarefa (Task):"
                    tasks=${TASKS}
                    value=${task}
                    onChange=${handleTaskChange}
                    allowCustom=${true}
                />

                <${ModelInput}
                    label="Nome do Modelo (Hugging Face):"
                    value=${modelName}
                    onChange=${setModelName}
                    placeholder="ex: Xenova/distilbert-base-uncased-finetuned-sst-2-english"
                    required=${true}
                />

                <button type="submit" aria-busy=${loading} disabled=${loading}>
                    Carregar Modelo
                </button>
            </form>
        </article>
    `;
}
