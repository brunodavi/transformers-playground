export class PipelineService {
    static async loadPipeline(task, modelName, progressCallback) {
        const win = typeof window !== 'undefined' ? window : globalThis;
        if (!win.pipeline) {
            throw new Error('Pipeline do Transformers.js não encontrado no escopo global.');
        }

        const options = {};
        if (progressCallback) {
            options.progress_callback = progressCallback;
        }

        const pipe = await win.pipeline(task, modelName, options);

        if (typeof pipe !== 'function') {
            throw new Error('Pipeline carregado não é uma função.');
        }

        return pipe;
    }

    static async checkModelExists(modelName) {
        try {
            const res = await fetch(`https://huggingface.co/api/models/${modelName}`, {
                method: 'HEAD',
            });
            return res.ok;
        } catch {
            return null;
        }
    }
}
