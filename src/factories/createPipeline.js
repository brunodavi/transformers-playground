export async function createPipeline(task, modelName, progressCallback) {
    const win = typeof window !== 'undefined' ? window : globalThis;
    if (!win.pipeline) {
        throw new Error('Pipeline do Transformers.js não encontrado no escopo global.');
    }

    const options = {};
    if (progressCallback) {
        options.progress_callback = progressCallback;
    }

    return await win.pipeline(task, modelName, options);
}

export async function runInference(pipe, input) {
    if (!pipe) {
        throw new Error('Pipeline não carregado.');
    }

    const fn = typeof pipe === 'function' ? pipe : pipe.__call__ || pipe.call || pipe.run;
    if (typeof fn !== 'function') {
        throw new Error('Tipo de pipeline não suportado: ' + typeof pipe);
    }

    return await fn(input);
}
