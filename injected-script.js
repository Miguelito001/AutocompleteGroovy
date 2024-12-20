(async function () {
    'use strict';

    const DELAY = 300; // Delay para processar o comando
    const UPDATE_INTERVAL = 12000; // Intervalo para atualização do JSON em milissegundos
    let typingTimer;
    let METHOD_MAP = {};
    const JSON_URL = `https://raw.githubusercontent.com/Miguelito001/funcoes/main/funcoe.json`;

    // Função para carregar o METHOD_MAP a partir do JSON remoto
    async function loadMethodMap() {
        try {
            const response = await fetch(`${JSON_URL}?timestamp=${Date.now()}`); // Adiciona timestamp para evitar cache
            if (!response.ok) {
                throw new Error(`Erro ao buscar o JSON: ${response.statusText}`);
            }
            METHOD_MAP = await response.json();
            console.log("✅ METHOD_MAP atualizado com sucesso:", METHOD_MAP);
        } catch (error) {
            console.error("❌ Falha ao carregar METHOD_MAP:", error);
        }
    }

    // Atualiza o METHOD_MAP periodicamente
    function startPeriodicUpdate() {
        loadMethodMap(); // Carrega a versão inicial do JSON
        setInterval(loadMethodMap, UPDATE_INTERVAL); // Atualiza o JSON a cada 2 minutos
    }

    // Monitora o DOM para detectar elementos CodeMirror
    function waitForEditorInitialization() {
        const cmElements = document.querySelectorAll('.CodeMirror');
        console.log("🔍 Observando elementos CodeMirror:", cmElements);

        cmElements.forEach(cmElement => {
            if (!cmElement.dataset.listenerAdded) {
                cmElement.dataset.listenerAdded = 'true';
                console.log("⏳ Aguardando inicialização do editor:", cmElement);

                const interval = setInterval(() => {
                    if (cmElement.CodeMirror && typeof cmElement.CodeMirror.getValue === 'function') {
                        clearInterval(interval);
                        console.log("✅ Editor CodeMirror inicializado:", cmElement);
                        addListenersToEditor(cmElement);
                    } else {
                        console.log("⏳ Editor ainda não pronto, verificando novamente...");
                    }
                }, 500); // Verifica a cada 500ms
            }
        });
    }

    // Adiciona listeners ao editor CodeMirror
    function addListenersToEditor(cmElement) {
        const editor = cmElement.CodeMirror;

        if (editor && typeof editor.getValue === 'function') {
            console.log("🔗 Editor do CodeMirror configurado corretamente:", editor);

            const textarea = cmElement.querySelector('textarea');
            if (textarea) {
                textarea.addEventListener('keyup', () => {
                    clearTimeout(typingTimer);
                    typingTimer = setTimeout(() => handleInput(editor), DELAY);
                });
            } else {
                console.error("❌ Textarea não encontrado no CodeMirror.");
            }
        } else {
            console.error("❌ O editor do CodeMirror não foi configurado corretamente ou não é suportado:", cmElement);
        }
    }

    // Processa o input do usuário
    function handleInput(editor) {
        const cursor = editor.getCursor();
        const content = editor.getLine(cursor.line);
        console.log(`📝 Linha atual: "${content}"`);

        const lastWord = extractLastWord(content, cursor.ch);
        console.log(`🔍 Última palavra detectada: "${lastWord}"`);

        if (METHOD_MAP[lastWord]) {
            console.log(`✅ Substituindo "${lastWord}" por:\n"${METHOD_MAP[lastWord]}"`);
            replaceMethod(editor, lastWord, METHOD_MAP[lastWord], cursor);
        } else {
            console.warn(`❓ Comando "${lastWord}" não encontrado no METHOD_MAP.`);
        }
    }

    // Extrai a última palavra iniciada com "/"
    function extractLastWord(content, cursorPos) {
        const beforeCursor = content.slice(0, cursorPos);
        const match = beforeCursor.match(/\/[\w.]*$/);
        return match ? match[0] : '';
    }

    // Realiza a substituição no editor
    function replaceMethod(editor, method, replacement, cursor) {
        const lineContent = editor.getLine(cursor.line);
        const methodIndex = lineContent.lastIndexOf(method);

        if (methodIndex !== -1) {
            const startPos = { line: cursor.line, ch: methodIndex };
            const endPos = { line: cursor.line, ch: methodIndex + method.length };

            editor.replaceRange(replacement, startPos, endPos);
            console.log("✨ Substituição realizada com sucesso.");
        }
    }

    // Inicia a atualização periódica do METHOD_MAP
    startPeriodicUpdate();

    // Observa o DOM e inicia o monitoramento
    setInterval(waitForEditorInitialization, 1000); // Verifica a cada 1 segundo
})();
