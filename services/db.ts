import { supabase } from './supabase';
import { Service, CaseStudy, Package, TeamMember, SiteSettings, BlogPost, ContactMessage, SocialLink, Page, PackageRequest, DashboardUser, Client, Invoice, Quote } from '../types';
import { settingsService } from './settingsService';

/* --- DATA MAPPERS --- */
const mapServiceFromDB = (row: any): Service => ({
  id: row.id,
  title: row.title || { ar: '', en: '' },
  description: row.description || { ar: '', en: '' },
  features: row.features || [],
  iconName: row.icon_name || 'HelpCircle',
  orderIndex: row.order_index
});
const mapServiceToDB = (item: Service) => ({ title: item.title, description: item.description, features: item.features, icon_name: item.iconName });

const mapPackageFromDB = (row: any): Package => ({
  id: row.id,
  name: row.name || { ar: '', en: '' },
  price: row.price || '',
  features: row.features || [],
  isPopular: row.is_popular || false,
  orderIndex: row.order_index
});
const mapPackageToDB = (item: Package) => ({ name: item.name, price: item.price, features: item.features, is_popular: item.isPopular });

const mapTeamFromDB = (row: any): TeamMember => ({
  id: row.id,
  name: row.name || { ar: '', en: '' },
  role: row.role || { ar: '', en: '' },
  image: row.image || '',
  linkedin: row.linkedin || '',
  orderIndex: row.order_index
});
const mapTeamToDB = (item: TeamMember) => ({ name: item.name, role: item.role, image: item.image, linkedin: item.linkedin });

const mapCaseFromDB = (row: any): CaseStudy => {
  let stats: any[] = [];

  if (Array.isArray(row.stats)) {
    stats = row.stats;
  } else if (typeof row.stats === 'string') {
    try {
      const parsed = JSON.parse(row.stats);
      if (Array.isArray(parsed)) {
        stats = parsed;
      }
    } catch {
      stats = [];
    }
  }

  return {
    id: row.id,
    client: row.client || '',
    title: row.title || { ar: '', en: '' },
    category: row.category || { ar: '', en: '' },
    result: row.result || { ar: '', en: '' },
    image: row.image || '',
    url: row.url || row.project_url || row.link || '',
    stats,
    orderIndex: row.order_index,
  };
};
const mapCaseToDB = (item: CaseStudy) => ({
  client: item.client,
  title: item.title,
  category: item.category,
  result: item.result,
  image: item.image,
  url: item.url || '',
  stats: item.stats || [],
  order_index: item.orderIndex || 0
});

const mapBlogFromDB = (row: any): BlogPost => ({
  id: row.id,
  title: row.title || { ar: '', en: '' },
  excerpt: row.excerpt || { ar: '', en: '' },
  content: row.content || { ar: '', en: '' },
  date: row.date || '',
  image: row.image || '',
  author: row.author || '',
  orderIndex: row.order_index
});
const mapBlogToDB = (item: BlogPost) => ({ title: item.title, excerpt: item.excerpt, content: item.content, date: item.date, image: item.image, author: item.author });

const mapPackageRequestFromDB = (row: any): PackageRequest => ({
  id: row.id,
  customerName: row.customer_name || '',
  phoneNumber: row.phone_number || '',
  email: row.email || '',
  packageName: row.package_name || '',
  packageId: row.package_id || '',
  createdAt: row.created_at || '',
  status: row.status || 'pending',
  notes: row.notes
});
const mapPackageRequestToDB = (item: Omit<PackageRequest, 'id' | 'createdAt'>) => ({
  customer_name: item.customerName,
  phone_number: item.phoneNumber,
  email: item.email,
  package_name: item.packageName,
  package_id: item.packageId,
  status: item.status,
  notes: item.notes
});


const mapMessageFromDB = (row: any): ContactMessage => ({
  id: row.id,
  name: row.name || '',
  phone: row.phone || '',
  createdAt: row.created_at
});

const mapUserFromDB = (row: any): DashboardUser => ({
  id: row.id,
  email: row.email,
  role: row.role,
  name: row.name,
  createdAt: row.created_at
});

const mapClientFromDB = (row: any): Client => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  company: row.company,
  createdAt: row.created_at
});

const mapInvoiceFromDB = (row: any): Invoice => ({
  id: row.id,
  clientId: row.client_id,
  clientName: row.client_name,
  amount: row.amount,
  currency: row.currency,
  status: row.status,
  dueDate: row.due_date,
  items: row.items || [],
  createdAt: row.created_at
});

const mapQuoteFromDB = (row: any): Quote => ({
  id: row.id,
  clientId: row.client_id,
  clientName: row.client_name,
  total: row.total,
  status: row.status,
  validUntil: row.valid_until,
  items: row.items || [],
  createdAt: row.created_at
});

/* --- SERVER SEED TRIGGER --- */
let seedUnavailable = false;
const triggerServerSeed = async () => {
  if (seedUnavailable) return false;
  try {
    // In local/preview environments (vite preview), serverless functions may not exist.
    // Avoid calling the endpoint to prevent console noise and unnecessary retries.
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
      seedUnavailable = true;
      return false;
    }
  } catch {
    // ignore
  }
  try {
    const res = await fetch('/api/seed', { method: 'POST' });
    if (!res.ok) {
      // If endpoint is missing/disabled in this environment, stop retrying.
      if (res.status === 404) seedUnavailable = true;
      return false;
    }
    return true;
  } catch (e) {
    seedUnavailable = true;
    return false;
  }
};

/* --- SAFE FETCH HELPER WITH FALLBACK --- */
const fetchWithOrder = async (table: string, mapper: Function) => {
  let { data, error } = await supabase
    .from(table)
    .select('*')
    .order('order_index', { ascending: true });

  if (error || !data) {
    const res = await supabase.from(table).select('*').order('created_at', { ascending: true });
    data = res.data;
    error = res.error;
  }

  if (!error && (!data || data.length === 0)) {
    await triggerServerSeed();
    const { data: retry } = await supabase.from(table).select('*').order('created_at', { ascending: true });
    return retry?.map(row => mapper(row)) || [];
  }

  return data?.map(row => mapper(row)) || [];
}

/* --- DB SERVICE EXPORT --- */
export const db = {
  reorder: async (table: string, items: any[]) => {
    try {
      await fetch('/api/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table, items })
      });
    } catch (e) {
      console.error('Reorder failed', e);
    }
  },

  services: {
    getAll: async () => await fetchWithOrder('services', mapServiceFromDB),
    save: async (item: Service) => {
      const payload = mapServiceToDB(item);
      if (item.id && item.id !== 'new') (payload as any).id = item.id;
      return await supabase.from('services').upsert([payload]);
    },
    delete: async (id: string) => await supabase.from('services').delete().eq('id', id)
  },

  packages: {
    getAll: async () => await fetchWithOrder('packages', mapPackageFromDB),
    save: async (item: Package) => {
      const payload = mapPackageToDB(item);
      if (item.id && item.id !== 'new') (payload as any).id = item.id;
      return await supabase.from('packages').upsert([payload]);
    },
    delete: async (id: string) => await supabase.from('packages').delete().eq('id', id)
  },

  team: {
    getAll: async () => await fetchWithOrder('team_members', mapTeamFromDB),
    save: async (item: TeamMember) => {
      const payload = mapTeamToDB(item);
      if (item.id && item.id !== 'new') (payload as any).id = item.id;
      return await supabase.from('team_members').upsert([payload]);
    },
    delete: async (id: string) => await supabase.from('team_members').delete().eq('id', id)
  },

  caseStudies: {
    getAll: async () => await fetchWithOrder('case_studies', mapCaseFromDB),
    save: async (item: CaseStudy) => {
      const payload = mapCaseToDB(item);
      if (item.id && item.id !== 'new') (payload as any).id = item.id;

      const res = await supabase.from('case_studies').upsert([payload]);
      if (res.error && (res.error as any).code === 'PGRST204' && /\burl\b/i.test(res.error.message || '')) {
        const retryPayload = { ...(payload as any) };
        delete retryPayload.url;
        return await supabase.from('case_studies').upsert([retryPayload]);
      }

      return res;
    },
    delete: async (id: string) => await supabase.from('case_studies').delete().eq('id', id)
  },

  blog: {
    getAll: async () => {
      const { data, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
      if (!error && (!data || data.length === 0)) {
        await triggerServerSeed();
        const { data: retry } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
        return retry?.map(mapBlogFromDB) || [];
      }
      return data?.map(mapBlogFromDB) || [];
    },
    save: async (item: BlogPost) => {
      const payload = mapBlogToDB(item);
      if (item.id && item.id !== 'new') (payload as any).id = item.id;
      return await supabase.from('blog_posts').upsert([payload]);
    },
    delete: async (id: string) => await supabase.from('blog_posts').delete().eq('id', id)
  },

  messages: {
    getAll: async (): Promise<ContactMessage[]> => {
      const { data } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
      return data?.map(mapMessageFromDB) || [];
    },
    send: async (name: string, phone: string) => {
      return await supabase.from('contact_messages').insert([{ name, phone }]);
    },
    delete: async (id: string) => await supabase.from('contact_messages').delete().eq('id', id)
  },

  settings: {
    get: async (): Promise<SiteSettings> => {
      return await settingsService.getSettings();
    },
    save: async (newSettings: SiteSettings) => {
      return await settingsService.saveSettings(newSettings);
    }
  },

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
  },

  packageRequests: {
    getAll: async (): Promise<PackageRequest[]> => {
      const { data, error } = await supabase
        .from('package_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(mapPackageRequestFromDB);
    },

    create: async (request: Omit<PackageRequest, 'id' | 'createdAt'>): Promise<PackageRequest> => {
      const { data, error } = await supabase
        .from('package_requests')
        .insert(mapPackageRequestToDB(request))
        .select()
        .single();

      if (error) throw error;
      return mapPackageRequestFromDB(data);
    },

    updateStatus: async (id: string, status: PackageRequest['status']): Promise<void> => {
      const { error } = await supabase
        .from('package_requests')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('package_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
    }
  },

  users: {
    getAll: async (): Promise<DashboardUser[]> => {
      const { data, error } = await supabase.from('dashboard_users').select('*').order('created_at', { ascending: false });
      if (error) return [];
      return data.map(mapUserFromDB);
    },
    getByEmail: async (email: string): Promise<DashboardUser | null> => {
      const { data, error } = await supabase.from('dashboard_users').select('*').eq('email', email).single();
      if (error || !data) return null;
      return mapUserFromDB(data);
    },
    save: async (user: Partial<DashboardUser>) => {
      const payload = {
        email: user.email,
        role: user.role,
        name: user.name
      };
      if (user.id && user.id !== 'new') (payload as any).id = user.id;
      return await supabase.from('dashboard_users').upsert([payload]);
    },
    delete: async (id: string) => await supabase.from('dashboard_users').delete().eq('id', id)
  },

  clients: {
    getAll: async () => {
      const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
      return data?.map(mapClientFromDB) || [];
    },
    save: async (item: Partial<Client>) => {
      const payload = {
        name: item.name,
        email: item.email,
        phone: item.phone,
        company: item.company
      };
      if (item.id && item.id !== 'new') (payload as any).id = item.id;
      return await supabase.from('clients').upsert([payload]);
    },
    delete: async (id: string) => await supabase.from('clients').delete().eq('id', id)
  },

  invoices: {
    getAll: async () => {
      const { data } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
      return data?.map(mapInvoiceFromDB) || [];
    },
    save: async (item: Partial<Invoice>) => {
      const payload = {
        client_id: item.clientId,
        client_name: item.clientName,
        amount: item.amount,
        currency: item.currency,
        status: item.status,
        due_date: item.dueDate,
        items: item.items
      };
      if (item.id && item.id !== 'new') (payload as any).id = item.id;
      return await supabase.from('invoices').upsert([payload]);
    },
    delete: async (id: string) => await supabase.from('invoices').delete().eq('id', id)
  },

  quotes: {
    getAll: async () => {
      const { data } = await supabase.from('quotes').select('*').order('created_at', { ascending: false });
      return data?.map(mapQuoteFromDB) || [];
    },
    save: async (item: Partial<Quote>) => {
      const payload = {
        client_id: item.clientId,
        client_name: item.clientName,
        total: item.total,
        status: item.status,
        valid_until: item.validUntil,
        items: item.items
      };
      if (item.id && item.id !== 'new') (payload as any).id = item.id;
      return await supabase.from('quotes').upsert([payload]);
    },
    delete: async (id: string) => await supabase.from('quotes').delete().eq('id', id)
  }
};