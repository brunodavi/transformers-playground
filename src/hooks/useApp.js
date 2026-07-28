import { useState } from 'https://esm.sh/preact/hooks';
import { useProgress } from './useProgress.js';
import { PipelineService } from '../services/pipelineService.js';

export function useApp() {
    const [task, setTask] = useState('text-classification');
    const [modelName, setModelName] = useState('Xenova/distilbert-base-uncased-finetuned-sst-2-english');
    const [inputData, setInputData] = useState('I love using transformers.js!');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [result, setResult] = useState(null);
    const [pipelineInstance, setPipelineInstance] = useState(null);

    const { files, allDone, handleProgress, resetProgress } = useProgress();

    const handleLoadPipeline = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(`Carregando pipeline "${task}" com o modelo "${modelName}"...`);
        setResult(null);
        resetProgress();

        try {
            const pipe = await PipelineService.loadPipeline(task, modelName, handleProgress);
            console.log('[DIAG] pipe loaded, typeof:', typeof pipe);
            console.log('[DIAG] pipe keys:', typeof pipe === 'function' ? '(function)' : Object.keys(pipe));
            setPipelineInstance(pipe);
            setStatus(`Pipeline carregado com sucesso!`);
        } catch (err) {
            console.error(err);
            setStatus(`Erro ao carregar pipeline: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleRunInference = async (e) => {
        e.preventDefault();
        console.log('[DIAG] pipelineInstance:', pipelineInstance);
        console.log('[DIAG] typeof pipelineInstance:', typeof pipelineInstance);

        if (!pipelineInstance) {
            setStatus('Por favor, carregue o pipeline primeiro.');
            return;
        }

        if (typeof pipelineInstance !== 'function') {
            const msg = 'Pipeline carregado não é uma função executável (tipo: ' + typeof pipelineInstance + ').';
            console.error('[DIAG]', msg, pipelineInstance);
            setStatus(`Erro na inferência: ${msg}`);
            return;
        }

        setLoading(true);
        setStatus('Executando inferência...');
        try {
            const output = await pipelineInstance(inputData);
            setResult(output);
            setStatus('Inferência concluída com sucesso!');
        } catch (err) {
            console.error(err);
            setStatus(`Erro na inferência: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return {
        task,
        setTask,
        modelName,
        setModelName,
        inputData,
        setInputData,
        loading,
        status,
        result,
        pipelineInstance,
        files,
        allDone,
        handleLoadPipeline,
        handleRunInference
    };
}
