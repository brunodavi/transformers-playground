const remap = new Map([
    ['https://esm.sh/preact', 'preact'],
    ['https://esm.sh/preact/hooks', 'preact/hooks'],
    ['https://esm.sh/htm', 'htm'],
    ['https://esm.sh/@testing-library/preact', '@testing-library/preact'],
]);

export function resolve(specifier, context, nextResolve) {
    if (remap.has(specifier)) {
        return nextResolve(remap.get(specifier), context);
    }
    if (specifier.startsWith('https://esm.sh/')) {
        const local = specifier.slice('https://esm.sh/'.length);
        return nextResolve(local, context);
    }
    return nextResolve(specifier, context);
}
