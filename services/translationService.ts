
/**
 * Simple translation service using a free public API.
 */
export const translateText = async (text: string, from: string = 'ar', to: string = 'en'): Promise<string> => {
    if (!text) return '';

    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Translation request failed');

        const data = await response.json();
        // Google Translate API returns an array of arrays [[["trans", "orig", ...], ["trans2", "orig2", ...]]]
        if (data && data[0]) {
            return data[0].map((item: any) => item[0]).join('');
        }
        return '';
    } catch (error) {
        console.error('Translation error:', error);
        return '';
    }
};
