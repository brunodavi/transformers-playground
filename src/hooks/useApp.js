import { useState } from 'https://esm.sh/preact/hooks';
import { useProgress } from './useProgress.js';
import { createPipeline, runInference } from '../factories/createPipeline.js';

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
            const pipe = await createPipeline(task, modelName, handleProgress);
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

        if (!pipelineInstance) {
            setStatus('Por favor, carregue o pipeline primeiro.');
            return;
        }

        setLoading(true);
        setStatus('Executando inferência...');
        try {
            const output = await runInference(pipelineInstance, inputData);
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
