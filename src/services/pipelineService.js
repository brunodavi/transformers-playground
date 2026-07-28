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

        return await win.pipeline(task, modelName, options);
    }
}
