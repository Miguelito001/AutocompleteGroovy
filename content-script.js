// Injeta o código no contexto da página
console.log('Iniciando a injeção de script...');
const script = document.createElement('script');
script.src = chrome.runtime.getURL('injected-script.js'); // Aponta para o arquivo injetado
console.log('🚀 Injetando script...');
script.onload = function () {
    console.log('🚀 Script injetado com sucesso');
    this.remove(); // Remove o script após a injeção
};
(document.head || document.documentElement).appendChild(script);
