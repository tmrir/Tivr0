// ... (باقي الكود)

  pages: {
    get: async (slug: string): Promise<Page | null> => {
        try {
            const res = await fetch(`/api/pages/${slug}`);
            if (!res.ok) return null;
            return await res.json();
        } catch {
            return null;
        }
    },
    getAll: async (): Promise<Page[]> => {
        try {
            const res = await fetch('/api/pages/list');
            if (!res.ok) return [];
            return await res.json();
        } catch {
            return [];
        }
    },
    save: async (slug: string, title: string, content: string) => {
        const res = await fetch('/api/pages/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug, title, content })
        });
        return res.ok;
    }
  }
};