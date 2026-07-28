import { useState } from 'https://esm.sh/preact/hooks';

export function useProgress() {
    const [progress, setProgress] = useState([]);

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
        progress,
        handleProgress,
        resetProgress
    };
}
