import { createSignal, createEffect, onMount, on, Show, For } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { API } from '../api';
import { otherlinkStore } from '../stores/otherlinkStore';
import { LinkCard } from '../components/Link/LinkCard';
import { LinkFormModal } from '../components/Link/LinkFormModal';

export const Links = () => {
  const navigate = useNavigate();
  const [links, setLinks] = createSignal([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(null);
  const [searchTerm, setSearchTerm] = createSignal('');
  const [filterType, setFilterType] = createSignal('all');
  const [filterActive, setFilterActive] = createSignal('all');
  const [page, setPage] = createSignal(1);
  const [totalPages, setTotalPages] = createSignal(1);
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [modalMode, setModalMode] = createSignal('create');
  const [selectedLink, setSelectedLink] = createSignal(null);
  const [successMessage, setSuccessMessage] = createSignal('');

  const linkTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'url', label: 'URL' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'custom', label: 'Custom' }
  ];

  const loadLinks = async () => {
    const selectedOtherlinkId = otherlinkStore.selectedOtherlinkId();
    
    // Don't load if no otherlink is selected
    if (!selectedOtherlinkId) {
      setLinks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const filters = {};
      
      if (searchTerm()) {
        filters.search = searchTerm();
      }
      
      if (filterType() !== 'all') {
        filters.link_type = filterType();
      }
      
      if (filterActive() !== 'all') {
        filters.active = filterActive() === 'active';
      }

      const response = await API.otherlink.getOtherlinkLinks(selectedOtherlinkId, page(), 10, filters);
      
      if (response.data) {
        setLinks(response.data.links || []);
        setTotalPages(response.data.pagination?.total_pages || 1);
      }
    } catch (err) {
      console.error('Error loading links:', err);
      setError(err.message || 'Failed to load links');
    } finally {
      setLoading(false);
    }
  };

  // Initial load and load otherlinks if needed
  onMount(() => {
    if (otherlinkStore.otherlinks().length === 0) {
      otherlinkStore.loadOtherlinks();
    }
    loadLinks();
  });

  // Reload when filters or page changes (explicitly track only these dependencies)
  createEffect(
    on(
      [searchTerm, filterType, filterActive, page],
      () => {
        // Only reload if we've already loaded initially (prevent double load on mount)
        if (!loading()) {
          loadLinks();
        }
      },
      { defer: true } // Defer execution until after initial mount
    )
  );

  // Reload when selected otherlink changes
  createEffect(
    on(
      () => otherlinkStore.selectedOtherlinkId(),
      () => {
        setPage(1); // Reset to first page
        loadLinks();
      },
      { defer: true }
    )
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page
  };

  const handleFilterChange = (type, value) => {
    if (type === 'type') {
      setFilterType(value);
    } else if (type === 'active') {
      setFilterActive(value);
    }
    setPage(1); // Reset to first page
  };

  const handleCreateClick = () => {
    setSelectedLink(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEdit = (link) => {
    setModalMode('edit');
    setSelectedLink(link);
    setIsModalOpen(true);
  };

  const handleDelete = async (link) => {
    if (!confirm(`Are you sure you want to delete "${link.name}"?`)) {
      return;
    }

    try {
      await API.link.deleteLink(link.id);
      showSuccess('Link deleted successfully');
      await loadLinks();
    } catch (err) {
      console.error('Error deleting link:', err);
      alert('Failed to delete link: ' + (err.message || 'Unknown error'));
    }
  };

  const handleToggleActive = async (link) => {
    try {
      await API.link.updateLink(link.id, { active: !link.active });
      showSuccess(`Link ${link.active ? 'deactivated' : 'activated'} successfully`);
      await loadLinks();
    } catch (err) {
      console.error('Error toggling link status:', err);
      alert('Failed to update link: ' + (err.message || 'Unknown error'));
    }
  };

  const handleSaveLink = async (linkData) => {
    try {
      if (modalMode() === 'create') {
        await API.link.createLink(linkData);
        showSuccess('Link created successfully');
      } else {
        await API.link.updateLink(selectedLink().id, linkData);
        showSuccess('Link updated successfully');
      }
      
      await loadLinks();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving link:', err);
      throw err; // Re-throw to let modal handle it
    }
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages()) {
      setPage(newPage);
    }
  };

  const filteredLinks = () => {
    return links();
  };

  return (
    <div class="links-page">
      <Show 
        when={otherlinkStore.selectedOtherlinkId()}
        fallback={
          <div class="links-empty-state">
            <h2>No OtherLink Selected</h2>
            <p>Please select an OtherLink from the dashboard to manage its links.</p>
            <button class="btn btn-primary" onClick={() => navigate('/admin/dashboard')}>
              Go to Dashboard
            </button>
          </div>
        }
      >
        <div class="page-header">
          <div class="page-title-section">
            <h1>Links for "{otherlinkStore.selectedOtherlink()?.name}"</h1>
            <p class="page-subtitle">Manage links in this OtherLink</p>
          </div>
          <button class="btn btn-primary" onClick={handleCreateClick}>
            + Create Link
          </button>
        </div>

        <Show when={successMessage()}>
          <div class="alert alert-success">{successMessage()}</div>
        </Show>

      <div class="links-controls">
        <div class="search-bar">
          <input
            type="text"
            class="form-input search-input"
            placeholder="Search by name or shortcode..."
            value={searchTerm()}
            onInput={handleSearch}
          />
        </div>

        <div class="filters">
          <select
            class="form-select filter-select"
            value={filterType()}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <For each={linkTypes}>
              {(type) => <option value={type.value}>{type.label}</option>}
            </For>
          </select>

          <select
            class="form-select filter-select"
            value={filterActive()}
            onChange={(e) => handleFilterChange('active', e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      <Show
        when={!loading()}
        fallback={
          <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading links...</p>
          </div>
        }
      >
        <Show
          when={!error()}
          fallback={
            <div class="error-state">
              <p class="error-message">⚠️ {error()}</p>
              <button class="btn btn-secondary" onClick={loadLinks}>
                Try Again
              </button>
            </div>
          }
        >
          <Show
            when={filteredLinks().length > 0}
            fallback={
              <div class="empty-state">
                <div class="empty-state-icon">🔗</div>
                <h3>No links yet</h3>
                <p>Create your first link to get started</p>
                <button class="btn btn-primary" onClick={handleCreateClick}>
                  Create Your First Link
                </button>
              </div>
            }
          >
            <div class="links-grid">
              <For each={filteredLinks()}>
                {(link) => (
                  <LinkCard
                    link={link}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                  />
                )}
              </For>
            </div>

            <Show when={totalPages() > 1}>
              <div class="pagination">
                <button
                  class="btn btn-secondary btn-sm"
                  onClick={() => handlePageChange(page() - 1)}
                  disabled={page() === 1}
                >
                  ← Previous
                </button>
                
                <span class="pagination-info">
                  Page {page()} of {totalPages()}
                </span>

                <button
                  class="btn btn-secondary btn-sm"
                  onClick={() => handlePageChange(page() + 1)}
                  disabled={page() === totalPages()}
                >
                  Next →
                </button>
              </div>
            </Show>
          </Show>
        </Show>
      </Show>

        <LinkFormModal
          isOpen={isModalOpen()}
          mode={modalMode()}
          link={selectedLink()}
          onSave={handleSaveLink}
          onClose={() => setIsModalOpen(false)}
        />
      </Show>
    </div>
  );
};

