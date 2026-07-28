import { h } from 'https://esm.sh/preact';
import { useState } from 'https://esm.sh/preact/hooks';
import htm from 'https://esm.sh/htm';
import { PipelineService } from '../services/pipelineService.js';

const html = htm.bind(h);

export function ModelInput({ value, onChange, label, placeholder, required }) {
    const [status, setStatus] = useState(null);

    const handleBlur = async () => {
        if (!value.trim()) return;
        setStatus('checking');
        const exists = await PipelineService.checkModelExists(value);
        setStatus(exists === null ? 'error' : exists ? 'valid' : 'invalid');
    };

    return html`
        <label>
            ${label}
            <input 
                type="text" 
                value=${value} 
                onInput=${(e) => onChange(e.target.value)}
                onBlur=${handleBlur}
                placeholder=${placeholder} 
                required=${required}
            />
            ${status === 'checking' && html`<small>Verificando...</small>`}
            ${status === 'valid' && html`<small style="color: green;">Modelo encontrado</small>`}
            ${status === 'invalid' && html`<small style="color: red;">Modelo não encontrado</small>`}
            ${status === 'error' && html`<small style="color: orange;">Erro ao verificar</small>`}
        </label>
    `;
}
