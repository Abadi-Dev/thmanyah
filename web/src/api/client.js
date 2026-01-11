const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Discovery endpoints
export const discovery = {
  getPrograms: () => request('/discovery/programs'),
  getProgram: (slug) => request(`/discovery/programs/${slug}`),
  getEpisodes: (slug, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/discovery/programs/${slug}/episodes${query ? `?${query}` : ''}`);
  },
  getFeatured: () => request('/discovery/featured'),
};

// Search endpoints
export const search = {
  all: (q) => request(`/search?q=${encodeURIComponent(q)}`),
  programs: (q) => request(`/search/programs?q=${encodeURIComponent(q)}`),
  episodes: (q) => request(`/search/episodes?q=${encodeURIComponent(q)}`),
};

// CMS endpoints
export const cms = {
  // Programs
  getPrograms: () => request('/cms/programs'),
  getProgram: (id) => request(`/cms/programs/${id}`),
  createProgram: (data) => request('/cms/programs', { method: 'POST', body: data }),
  updateProgram: (id, data) => request(`/cms/programs/${id}`, { method: 'PATCH', body: data }),
  deleteProgram: (id) => request(`/cms/programs/${id}`, { method: 'DELETE' }),
  publishProgram: (id) => request(`/cms/programs/${id}/publish`, { method: 'PATCH' }),
  unpublishProgram: (id) => request(`/cms/programs/${id}/unpublish`, { method: 'PATCH' }),
  archiveProgram: (id) => request(`/cms/programs/${id}/archive`, { method: 'PATCH' }),
  restoreProgram: (id) => request(`/cms/programs/${id}/restore`, { method: 'PATCH' }),

  // Episodes
  getEpisodes: (programId, params = {}) => {
    const queryParams = new URLSearchParams();
    if (programId) queryParams.set('programId', programId);
    if (params.page) queryParams.set('page', params.page);
    if (params.limit) queryParams.set('limit', params.limit);
    const query = queryParams.toString();
    return request(`/cms/episodes${query ? `?${query}` : ''}`);
  },
  getEpisode: (id) => request(`/cms/episodes/${id}`),
  createEpisode: (data) => request('/cms/episodes', { method: 'POST', body: data }),
  updateEpisode: (id, data) => request(`/cms/episodes/${id}`, { method: 'PATCH', body: data }),
  deleteEpisode: (id) => request(`/cms/episodes/${id}`, { method: 'DELETE' }),
  publishEpisode: (id) => request(`/cms/episodes/${id}/publish`, { method: 'PATCH' }),
  unpublishEpisode: (id) => request(`/cms/episodes/${id}/unpublish`, { method: 'PATCH' }),
  archiveEpisode: (id) => request(`/cms/episodes/${id}/archive`, { method: 'PATCH' }),
  restoreEpisode: (id) => request(`/cms/episodes/${id}/restore`, { method: 'PATCH' }),
};
