# Transformers Playground

IA no navegador com Transformers.js, Preact + htm, PicoCSS. Sem build step.

## Comandos

| Comando | Descrição |
|---|---|
| `npm test` | Unitários (29 tests) — `node --test` puro |
| `npm run test:components` | Componentes + hooks (34 tests) — com loader ESM + linkedom |
| `npm run test:coverage` | Cobertura c8 nos unitários |
| `npm run test:mutation` | Stryker (só muta `createPipeline.js` e `tasks.js`) |
| `npm run lint` | ESLint — `max-len: 72` (mobile) |
| `npm run lint:fix` | Auto-fix ESLint |

## Arquitetura

- **`src/app.js`** — entrypoint, monta o App no `#app`
- **`src/components/`** — componentes puros Preact/htm (PicoCSS)
- **`src/hooks/`** — `useApp` (estado global), `useProgress` (download progress)
- **`src/factories/createPipeline.js`** — `createPipeline`, `runInference`, `checkModelExists`
- **`src/constants/`** — `TASKS` (array) e `TASK_MODELS` (map task → modelo)
- Imports no navegador usam `https://esm.sh/`; sem bundler

## Testes

**Unitários** (`tests/constants/`, `tests/factories/`): rodam com `node --test` puro, sem loader. Testam lógica pura com mocks manuais de `fetch` e `globalThis.pipeline`.

**Componentes + hooks** (`tests/components/`, `tests/hooks/`): rodam com `node --import` + `register-loader.mjs` (redireciona `https://esm.sh/` → pacotes npm locais) + `dom-setup.mjs` (linkedom, mock do `pipeline`). Usam `@testing-library/preact` (`render`, `renderHook`, `fireEvent`).

### Peculiaridades do DOM simulado (linkedom)

- `fireEvent.click` em `<button type="submit">` **não** dispara submit. Use `fireEvent.submit(form)`.
- `getByRole` não funciona sem `getComputedStyle`. Já mockado em `dom-setup.mjs`.
- `HTMLSelectElement.prototype.value` não existe no linkedom. Getter/setter adicionado em `dom-setup.mjs`.

### `useState` trap

Preact trata **qualquer função** passada ao setter como functional updater. `setPipelineInstance(someAsyncFn)` **chama** `someAsyncFn(null)`. Solução em `useApp.js`: `setPipelineInstance(typeof pipe === 'function' ? { __call__: pipe } : pipe)`. Mocks de teste devem usar objetos, não funções.

### Cobertura

100% stmts/funcs/lines em `constants/` e `factories/`. Branch `typeof window !== 'undefined'` em `createPipeline.js:2` não coberta (sempre `window` nos testes). `useProgress.js` e `useApp.js` não instrumentados pelo c8.

### Stryker

Só cobre `createPipeline.js` (97.5%) e `tasks.js` (100%). `useProgress.js` e componentes fora do escopo.

### Sem teste

`ModelInput` (src/components/ModelInput.js) — sem testes.
