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

  const pergunta = `Você é um especialista no jogo ${game}. Por favor, responda a seguinte pergunta sobre o jogo: ${question}`;

  const contents = {
    contents: [
      {
        parts: [
          {
            text: pergunta,
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
    body: JSON.stringify(contents),
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
