import { useState, useEffect } from 'react';
import { cms, search } from '../api/client';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';

const EPISODES_PER_PAGE = 10;

export default function CMS() {
  const [programs, setPrograms] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [searchEpisodes, setSearchEpisodes] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEpisodes, setTotalEpisodes] = useState(0);

  // Modals
  const [programModal, setProgramModal] = useState({ open: false, program: null });
  const [episodeModal, setEpisodeModal] = useState({ open: false, episode: null });
  const [actionMenu, setActionMenu] = useState({ open: false, id: null, type: null });

  // Load programs on mount
  useEffect(() => {
    loadPrograms();
  }, []);

  // Load episodes when program is selected or page changes
  useEffect(() => {
    if (selectedProgram) {
      loadEpisodes(selectedProgram.id, currentPage);
    } else {
      setEpisodes([]);
      setCurrentPage(1);
      setTotalPages(1);
      setTotalEpisodes(0);
    }
  }, [selectedProgram, currentPage]);

  // Search with debounce (only trigger after 2+ characters)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery);
      } else if (searchQuery.trim().length === 0) {
        loadPrograms();
        setSearchEpisodes([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await cms.getPrograms();
      setPrograms(data.data || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadEpisodes = async (programId, page = 1) => {
    try {
      setLoadingEpisodes(true);
      const data = await cms.getEpisodes(programId, { page, limit: EPISODES_PER_PAGE });
      setEpisodes(data.data || data);
      if (data.meta) {
        setTotalPages(data.meta.totalPages);
        setTotalEpisodes(data.meta.total);
      }
    } catch (err) {
      console.error('Failed to load episodes:', err);
    } finally {
      setLoadingEpisodes(false);
    }
  };

  const performSearch = async (query) => {
    try {
      setLoading(true);
      setError(null);
      const data = await search.all(query);
      setPrograms(data.programs || []);
      setSearchEpisodes(data.episodes || []);
      setSelectedProgram(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProgramAction = async (action, id) => {
    try {
      switch (action) {
        case 'publish':
          await cms.publishProgram(id);
          break;
        case 'unpublish':
          await cms.unpublishProgram(id);
          break;
        case 'archive':
          await cms.archiveProgram(id);
          break;
        case 'restore':
          await cms.restoreProgram(id);
          break;
        case 'delete':
          if (confirm('Delete this program?')) {
            await cms.deleteProgram(id);
          } else return;
          break;
      }
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery);
      } else {
        loadPrograms();
      }
    } catch (err) {
      alert(err.message);
    }
    setActionMenu({ open: false, id: null, type: null });
  };

  const handleEpisodeAction = async (action, id) => {
    try {
      switch (action) {
        case 'publish':
          await cms.publishEpisode(id);
          break;
        case 'unpublish':
          await cms.unpublishEpisode(id);
          break;
        case 'archive':
          await cms.archiveEpisode(id);
          break;
        case 'restore':
          await cms.restoreEpisode(id);
          break;
        case 'delete':
          if (confirm('Delete this episode?')) {
            await cms.deleteEpisode(id);
          } else return;
          break;
      }
      if (selectedProgram) {
        loadEpisodes(selectedProgram.id, currentPage);
      }
    } catch (err) {
      alert(err.message);
    }
    setActionMenu({ open: false, id: null, type: null });
  };

  const handleSaveProgram = async (data) => {
    try {
      if (programModal.program) {
        await cms.updateProgram(programModal.program.id, data);
      } else {
        await cms.createProgram(data);
      }
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery);
      } else {
        loadPrograms();
      }
      setProgramModal({ open: false, program: null });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveEpisode = async (data) => {
    try {
      if (episodeModal.episode) {
        await cms.updateEpisode(episodeModal.episode.id, data);
      } else {
        await cms.createEpisode({ ...data, programId: selectedProgram.id });
      }
      loadEpisodes(selectedProgram.id, currentPage);
      setEpisodeModal({ open: false, episode: null });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSelectProgram = (program) => {
    if (selectedProgram?.id === program.id) {
      setSelectedProgram(null);
    } else {
      setSelectedProgram(program);
      setCurrentPage(1);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div>
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search programs and episodes..."
            className="w-full px-4 py-3 pl-12 bg-white border border-gray-light rounded-xl focus:outline-none focus:ring-2 focus:ring-off-black focus:border-transparent"
            dir="auto"
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-mid"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-off-black border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Programs Section */}
      {!loading && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Programs</h2>
            <button
              onClick={() => setProgramModal({ open: true, program: null })}
              className="px-4 py-2 bg-off-black text-off-white text-sm font-medium rounded-lg hover:bg-accent transition-colors"
            >
              + New Program
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-light">
            {programs.map((program, idx) => (
              <div
                key={program.id}
                className={`flex items-center justify-between p-4 ${
                  idx > 0 ? 'border-t border-gray-light' : ''
                } ${selectedProgram?.id === program.id ? 'bg-gray-50' : ''}`}
              >
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => handleSelectProgram(program)}
                >
                  <div className="flex items-center gap-3">
                    {program.thumbnailUrl && (
                      <img src={program.thumbnailUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    )}
                    <div>
                      <h3 className="font-medium text-off-black" dir="auto">{program.title}</h3>
                      <p className="text-xs text-gray-mid">{program.slug}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={program.status} />
                  <button
                    onClick={() => setProgramModal({ open: true, program })}
                    className="px-3 py-1 text-sm border border-gray-light rounded-lg hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setActionMenu({
                        open: actionMenu.id === program.id ? false : true,
                        id: program.id,
                        type: 'program'
                      })}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                    {actionMenu.open && actionMenu.id === program.id && actionMenu.type === 'program' && (
                      <ActionMenu
                        status={program.status}
                        onAction={(action) => handleProgramAction(action, program.id)}
                        onClose={() => setActionMenu({ open: false, id: null, type: null })}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
            {programs.length === 0 && (
              <p className="text-gray-mid text-center py-8">No programs found</p>
            )}
          </div>
        </div>
      )}

      {/* Episodes Section (when program is selected) */}
      {selectedProgram && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Episodes - {selectedProgram.title}
              {totalEpisodes > 0 && (
                <span className="text-sm font-normal text-gray-mid ml-2">
                  ({totalEpisodes} episodes)
                </span>
              )}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEpisodeModal({ open: true, episode: null })}
                className="px-4 py-2 bg-off-black text-off-white text-sm font-medium rounded-lg hover:bg-accent transition-colors"
              >
                + New Episode
              </button>
              <button
                onClick={() => setSelectedProgram(null)}
                className="text-sm text-gray-mid hover:text-off-black"
              >
                Close
              </button>
            </div>
          </div>

          {loadingEpisodes ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-off-black border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl border border-gray-light">
                {episodes.map((episode, idx) => (
                  <div
                    key={episode.id}
                    className={`flex items-center justify-between p-4 ${
                      idx > 0 ? 'border-t border-gray-light' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-sm text-gray-mid w-8">#{episode.episodeNumber}</span>
                      {episode.thumbnailUrl && (
                        <img src={episode.thumbnailUrl} alt="" className="w-16 h-10 rounded object-cover" />
                      )}
                      <div className="min-w-0">
                        <h4 className="font-medium text-off-black truncate" dir="auto">{episode.title}</h4>
                        <p className="text-xs text-gray-mid">{episode.slug}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge status={episode.status} />
                      <button
                        onClick={() => setEpisodeModal({ open: true, episode })}
                        className="px-3 py-1 text-sm border border-gray-light rounded-lg hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setActionMenu({
                            open: actionMenu.id === episode.id ? false : true,
                            id: episode.id,
                            type: 'episode'
                          })}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                        {actionMenu.open && actionMenu.id === episode.id && actionMenu.type === 'episode' && (
                          <ActionMenu
                            status={episode.status}
                            onAction={(action) => handleEpisodeAction(action, episode.id)}
                            onClose={() => setActionMenu({ open: false, id: null, type: null })}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {episodes.length === 0 && (
                  <p className="text-gray-mid text-center py-8">No episodes yet</p>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg border border-gray-light hover:bg-gray-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === 'number' && handlePageChange(page)}
                      disabled={page === '...'}
                      className={`min-w-[40px] px-3 py-2 rounded-lg border transition-colors ${
                        page === currentPage
                          ? 'bg-off-black text-white border-off-black'
                          : page === '...'
                          ? 'border-transparent cursor-default'
                          : 'border-gray-light hover:bg-gray-light'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg border border-gray-light hover:bg-gray-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Search results episodes */}
      {searchQuery && !selectedProgram && searchEpisodes.length > 0 && !loading && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Episodes</h2>
          <div className="bg-white rounded-xl border border-gray-light">
            {searchEpisodes.map((episode, idx) => (
              <div
                key={episode.id}
                className={`flex items-center justify-between p-4 ${
                  idx > 0 ? 'border-t border-gray-light' : ''
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-sm text-gray-mid w-8">#{episode.episodeNumber}</span>
                  {episode.thumbnailUrl && (
                    <img src={episode.thumbnailUrl} alt="" className="w-16 h-10 rounded object-cover" />
                  )}
                  <div className="min-w-0">
                    <h4 className="font-medium text-off-black truncate" dir="auto">{episode.title}</h4>
                    <p className="text-xs text-gray-mid">{episode.slug}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={episode.status} />
                  <button
                    onClick={() => setEpisodeModal({ open: true, episode })}
                    className="px-3 py-1 text-sm border border-gray-light rounded-lg hover:bg-gray-50"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Program Modal */}
      <Modal
        isOpen={programModal.open}
        onClose={() => setProgramModal({ open: false, program: null })}
        title={programModal.program ? 'Edit Program' : 'New Program'}
      >
        <ProgramForm
          program={programModal.program}
          onSave={handleSaveProgram}
          onCancel={() => setProgramModal({ open: false, program: null })}
        />
      </Modal>

      {/* Episode Modal */}
      <Modal
        isOpen={episodeModal.open}
        onClose={() => setEpisodeModal({ open: false, episode: null })}
        title={episodeModal.episode ? 'Edit Episode' : 'New Episode'}
      >
        <EpisodeForm
          episode={episodeModal.episode}
          onSave={handleSaveEpisode}
          onCancel={() => setEpisodeModal({ open: false, episode: null })}
        />
      </Modal>
    </div>
  );
}

function ActionMenu({ status, onAction, onClose }) {
  return (
    <>
      <div className="fixed inset-0" onClick={onClose} />
      <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-light py-1 z-10">
        {status !== 'published' && (
          <button onClick={() => onAction('publish')} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">
            Publish
          </button>
        )}
        {status === 'published' && (
          <button onClick={() => onAction('unpublish')} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">
            Unpublish
          </button>
        )}
        {status !== 'archived' && (
          <button onClick={() => onAction('archive')} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">
            Archive
          </button>
        )}
        {status === 'archived' && (
          <button onClick={() => onAction('restore')} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">
            Restore
          </button>
        )}
        <button onClick={() => onAction('delete')} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">
          Delete
        </button>
      </div>
    </>
  );
}

function ProgramForm({ program, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: program?.title || '',
    slug: program?.slug || '',
    description: program?.description || '',
    type: program?.type || 'video',
    category: program?.category || 'podcast',
    language: program?.language || 'ar',
    thumbnailUrl: program?.thumbnailUrl || '',
    youtubeId: program?.youtubeId || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-off-black"
          required
          dir="auto"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Slug</label>
        <input
          type="text"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="w-full px-3 py-2 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-off-black"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-off-black"
          rows={3}
          dir="auto"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-off-black"
          >
            <option value="video">Video</option>
            <option value="podcast">Podcast</option>
            <option value="documentary">Documentary</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Language</label>
          <select
            value={form.language}
            onChange={(e) => setForm({ ...form, language: e.target.value })}
            className="w-full px-3 py-2 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-off-black"
          >
            <option value="ar">Arabic</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
        <input
          type="url"
          value={form.thumbnailUrl}
          onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
          className="w-full px-3 py-2 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-off-black"
        />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm border border-gray-light rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-off-black text-off-white text-sm font-medium rounded-lg hover:bg-accent"
        >
          Save
        </button>
      </div>
    </form>
  );
}

function EpisodeForm({ episode, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: episode?.title || '',
    slug: episode?.slug || '',
    description: episode?.description || '',
    episodeNumber: episode?.episodeNumber || 1,
    thumbnailUrl: episode?.thumbnailUrl || '',
    videoUrl: episode?.videoUrl || '',
    youtubeId: episode?.youtubeId || '',
    duration: episode?.duration || 0,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, episodeNumber: parseInt(form.episodeNumber) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-off-black"
          required
          dir="auto"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="w-full px-3 py-2 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-off-black"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Episode #</label>
          <input
            type="number"
            value={form.episodeNumber}
            onChange={(e) => setForm({ ...form, episodeNumber: e.target.value })}
            className="w-full px-3 py-2 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-off-black"
            min={1}
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-off-black"
          rows={3}
          dir="auto"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Video URL</label>
        <input
          type="url"
          value={form.videoUrl}
          onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
          className="w-full px-3 py-2 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-off-black"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
        <input
          type="url"
          value={form.thumbnailUrl}
          onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
          className="w-full px-3 py-2 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-off-black"
        />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm border border-gray-light rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-off-black text-off-white text-sm font-medium rounded-lg hover:bg-accent"
        >
          Save
        </button>
      </div>
    </form>
  );
}
