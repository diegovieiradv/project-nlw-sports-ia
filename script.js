const apiKeyInput = document.getElementById("apiKey");
const gameSelect = document.getElementById("gameSelect");
const questionInput = document.getElementById("questionInput");
const askButton = document.getElementById("askButton");
const form = document.getElementById("form");
const aiResponse = document.getElementById("aiResponse");

//AIzaSyDue-bUWbZCESTTzBlaejlnyM61g4VcK5A

const markDownToHTML = (text) => {
  const converter = new showdown.Converter();
  return converter.makeHtml(text);
};

const perguntarAI = async (question, game, apiKey) => {
  const model = "gemini-2.5-flash";
  const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const prompt = `
  ## Especialidade
  Você é um especialista assistente de meta para o jogo ${game}
  
  ## Tarefa
  Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, builds e dicas

  ## Regras
  - Se você não souber a resposta,  responda com 'Não sei' e não tente inventar uma resposta.
  - Se a pergunta não for sobre o jogo, responda com 'Essa pergunta não esta relacionada ao jogo'
  - Considere a data atual ${new Date().toLocaleDateString()}
  - Faça pesquisas atualizadas sobre o patch atual , baseado na data atual, para dar uma resposta coerente.
  - Nunca responda itens que você não tenha certeza de que existe no patch atual.

  ## Resposta
    - Economize na resposta, seja direto e responda no máximo 500 caracteres.
    - Responda em markdown.
    - Responda tudo em  listas.
    - Não precisa fazer nenhuma saudação ou despedida, apenas responda oque o usuário esta querendo
  ## Exemplo de resposta
  pergunta do usuário: Melhor build rengar jungle
  Resposta: A build mais atual é: \n\n **Itens:**\n\n coloque os itens aqui. \n\n** Runas:**\n\n exemplo de runas\n\n

  ---

  Aqui esta a pergunta do usuário: ${question}`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
  };

  const response = await fetch(geminiURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();

  if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
    return data.candidates[0].content.parts[0].text;
  } else if (data.error) {
    throw new Error(
      data.error.message || "Erro ao comunicar com a API do Gemini"
    );
  } else {
    throw new Error("Formato de resposta inesperado da API");
  }
};

const enviarFormulario = async (event) => {
  event.preventDefault();
  const apiKey = apiKeyInput.value;
  const game = gameSelect.value;
  const question = questionInput.value;

  if (apiKey == "" || game == "" || question == "") {
    alert("Por favor, preencha todos os campos");
    return;
  }

  askButton.disabled = true;
  askButton.innerHTML = "Perguntando...";
  askButton.classList.add("loading");

  try {
    const text = await perguntarAI(question, game, apiKey);
    aiResponse.querySelector(".response-content").innerHTML =
      markDownToHTML(text);
    aiResponse.classList.remove("hidden");
  } catch (error) {
    console.error("Erro:", error);
    aiResponse.querySelector(
      ".response-content"
    ).innerHTML = `<p style="color: #ff4444;">Erro: ${error.message}</p>`;
  } finally {
    askButton.disabled = false;
    askButton.innerHTML = "Perguntar";
    askButton.classList.remove("loading");
  }
};

form.addEventListener("submit", enviarFormulario);
