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
    const [inferenceTime, setInferenceTime] = useState(null);

    const { files, allDone, handleProgress, resetProgress } = useProgress();

    const changeTask = (newTask) => {
        setTask(newTask);
        setStatus('');
        setResult(null);
        setInferenceTime(null);
        setPipelineInstance(null);
        setLoading(false);
        resetProgress();
    };

    const handleLoadPipeline = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(`Carregando pipeline "${task}" com o modelo "${modelName}"...`);
        setResult(null);
        resetProgress();

        try {
            const pipe = await createPipeline(task, modelName, handleProgress);
            setPipelineInstance(typeof pipe === 'function' ? { __call__: pipe } : pipe);
            setStatus('Pipeline carregado com sucesso!');
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
        const start = performance.now();
        try {
            const output = await runInference(pipelineInstance, inputData);
            const elapsed = ((performance.now() - start) / 1000).toFixed(2);
            setInferenceTime(elapsed);
            setResult(output);
            setStatus(`Inferência concluída em ${elapsed}s`);
        } catch (err) {
            setInferenceTime(null);
            console.error(err);
            setStatus(`Erro na inferência: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return {
        task,
        setTask: changeTask,
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
    };
}
