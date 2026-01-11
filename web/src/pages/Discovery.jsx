import { useState, useEffect } from 'react';
import { discovery, search } from '../api/client';
import ProgramCard from '../components/ProgramCard';
import EpisodeCard from '../components/EpisodeCard';

const EPISODES_PER_PAGE = 10;

export default function Discovery() {
  const [programs, setPrograms] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEpisodes, setTotalEpisodes] = useState(0);

  // Load programs
  useEffect(() => {
    loadPrograms();
  }, []);

  // Load episodes when program is selected or page changes
  useEffect(() => {
    if (selectedProgram) {
      loadEpisodes(selectedProgram.slug, currentPage);
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
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await discovery.getPrograms();
      setPrograms(data.data || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadEpisodes = async (slug, page = 1) => {
    try {
      setLoadingEpisodes(true);
      const data = await discovery.getEpisodes(slug, { page, limit: EPISODES_PER_PAGE });
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
      setEpisodes(data.episodes || []);
      setSelectedProgram(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProgramClick = (program) => {
    if (selectedProgram?.id === program.id) {
      setSelectedProgram(null);
    } else {
      setSelectedProgram(program);
      setCurrentPage(1); // Reset to first page when selecting new program
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
      <div className="mb-8">
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
        <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-xl">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-off-black border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Programs Grid */}
      {!loading && (
        <>
          <h2 className="text-lg font-semibold mb-4">Programs</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {programs.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                onClick={() => handleProgramClick(program)}
                isSelected={selectedProgram?.id === program.id}
              />
            ))}
          </div>

          {programs.length === 0 && (
            <p className="text-gray-mid text-center py-8">No programs found</p>
          )}
        </>
      )}

      {/* Episodes */}
      {selectedProgram && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Episodes - {selectedProgram.title}
              {totalEpisodes > 0 && (
                <span className="text-sm font-normal text-gray-mid ml-2">
                  ({totalEpisodes} episodes)
                </span>
              )}
            </h2>
            <button
              onClick={() => setSelectedProgram(null)}
              className="text-sm text-gray-mid hover:text-off-black"
            >
              Close
            </button>
          </div>

          {loadingEpisodes ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-off-black border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {episodes.map((episode) => (
                  <EpisodeCard key={episode.id} episode={episode} />
                ))}
                {episodes.length === 0 && (
                  <p className="text-gray-mid text-center py-8">No episodes found</p>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  {/* Previous button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg border border-gray-light hover:bg-gray-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Page numbers */}
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

                  {/* Next button */}
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
      {searchQuery && !selectedProgram && episodes.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Episodes</h2>
          <div className="space-y-3">
            {episodes.map((episode) => (
              <EpisodeCard key={episode.id} episode={episode} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
