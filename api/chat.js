
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "Chave da IA não configurada."
    });
  }

  const { message, tool = "Chat" } = req.body || {};

  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({
      error: "Escreva uma mensagem."
    });
  }

  if (message.length > 4000) {
    return res.status(413).json({
      error: "Mensagem muito longa."
    });
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-5.5",
          instructions:
            "Você é a ZAZA'S AI, uma assistente criativa. " +
            "Responda em português brasileiro, com clareza, " +
            "educação e criatividade. A ferramenta escolhida é: " +
            String(tool).slice(0, 30) +
            ". Não diga que gerou imagens ou vídeos.",
          input: message.trim(),
          max_output_tokens: 700,
          store: false
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({
        error: "Não foi possível conectar à inteligência artificial."
      });
    }

    return res.status(200).json({
      reply: data.output_text || "Tente novamente."
    });

  } catch (error) {
    return res.status(500).json({
      error: "Erro interno. Tente novamente."
    });
  }
};
