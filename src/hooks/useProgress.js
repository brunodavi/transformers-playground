import { useState, useMemo } from 'https://esm.sh/preact/hooks';

const toMB = (bytes) => (bytes / 1024 / 1024).toFixed(2);
const toPercent = (loaded, total) => Math.round((loaded / total) * 100);

export function useProgress() {
    const [progress, setProgress] = useState([]);

    const files = useMemo(() => progress
        .filter(i => i.file && i.file !== 'progress_total')
        .map(i => ({
            ...i,
            percent: i.total ? toPercent(i.loaded, i.total) : 0,
            loadedMB: toMB(i.loaded || 0),
            totalMB: i.total ? toMB(i.total) : null,
        })), [progress]);

    const finished = (status) => status === 'done' || status === 'ready';
    const allDone = useMemo(() => files.length > 0 && files.every(i => finished(i.status)), [files]);

    const handleProgress = (info) => {
        setProgress((prev) => {
            const index = prev.findIndex(p => p.file === info.file);
            if (index !== -1) {
                const updated = [...prev];
                updated[index] = info;
                return updated;
            } else {
                return [...prev, info];
            }
        });
    };

    const resetProgress = () => {
        setProgress([]);
    };

    return {
        files,
        allDone,
        handleProgress,
        resetProgress
    };
}
