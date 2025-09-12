// Azure OpenAI configuration via environment variables
const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT as string | undefined;
const apiKey = import.meta.env.VITE_AZURE_OPENAI_KEY as string | undefined;
const deployment = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT as string | undefined; // Azure requires a deployment name
const apiVersion = (import.meta.env.VITE_AZURE_OPENAI_API_VERSION as string | undefined) || '2024-04-01-preview';
const modelName = (import.meta.env.VITE_AZURE_OPENAI_MODEL as string | undefined) || 'gpt-4.1-mini';

const SYSTEM_PROMPT_TEMPLATE = `Sen isim etimolojisi, cinsiyet sınıflandırması ve dini metinler konusunda uzman bir dil ve kültür araştırmacısısın.

Lütfen şu ismi analiz et: "{isim}"

1. **Köken ve Dilsel Yapı**: İsmin kültürel veya dilsel kökenini belirt (örneğin Türkçe, Arapça, Farsça, Slavca vb.). Eğer birden fazla olası köken varsa, her birini kısaca açıkla.

2. **Anlam ve Tarihsel Bağlam**: İsmin bilinen anlamını ve varsa tarihsel veya kültürel önemini belirt.

3. **Cinsiyet Sınıflandırması**: İsmin genellikle erkek, kadın veya uniseks olup olmadığını belirt. Eğer bölgeye veya kültüre göre değişiyorsa, nasıl değiştiğini açıkla.

4. **Kullanım ve Popülerlik**: İsmin günümüzde yaygın olarak kullanıldığı yerleri ve varsa dikkat çeken kullanım eğilimlerini veya tanınmış kişileri belirt.

5. **Kur’an’da Geçip Geçmediği**: Bu ismin Kur’an’da geçip geçmediğini kontrol et. Eğer geçiyorsa, hangi bağlamda ve hangi ayette geçtiğini belirt. Geçmiyorsa, Kur’an’daki bir kelimeden veya kavramdan türetilip türetilmediğini açıkla.

Bilgileri kısa ama açıklayıcı şekilde sun. Tarafsız ve saygılı bir dil kullan.`;

interface AzureChatChoice { message?: { role: string; content?: string }; }
interface AzureChatResponse { choices?: AzureChatChoice[]; }

export async function analyzeNameWithAI(name: string): Promise<string> {
  if (!endpoint || !apiKey || !deployment) {
    return 'Azure OpenAI yapılandırması eksik (endpoint / key / deployment).';
  }

  const base = endpoint.replace(/\/?$/, '');
  const url = `${base}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

  const userPrompt = SYSTEM_PROMPT_TEMPLATE.replace('{isim}', name);

  const body: Record<string, unknown> = {
    messages: [
      { role: 'system', content: 'Türkçe yanıt veren yardımcı bir asistansın.' },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.4,
    top_p: 0.9,
    max_tokens: 600,
    stream: false,
    model: modelName
  };

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify(body)
    });
  } catch {
    return 'Azure OpenAI isteği gönderilemedi.';
  }

  if (!res.ok) {
    return `Azure OpenAI isteği başarısız (HTTP ${res.status})`;
  }
  let json: AzureChatResponse;
  try {
    json = await res.json();
  } catch {
    return 'Azure OpenAI yanıtı çözümlenemedi.';
  }
  const content = json.choices?.[0]?.message?.content?.trim();
  return content || 'Herhangi bir içerik alınamadı.';
}
