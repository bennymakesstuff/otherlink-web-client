import { createSignal, onMount, Show, For } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { API } from '../api';
import { otherlinkStore } from '../stores/otherlinkStore';
import { OtherlinkFormModal } from '../components/Otherlink/OtherlinkFormModal';
import './Otherlinks.css';

/**
 * Otherlinks Management Page
 * List, edit, and delete otherlinks
 */
export function Otherlinks() {
  const navigate = useNavigate();
  
  const [loading, setLoading] = createSignal(true);
  const [otherlinks, setOtherlinks] = createSignal([]);
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [editingOtherlink, setEditingOtherlink] = createSignal(null);
  const [deletingId, setDeletingId] = createSignal(null);

  onMount(() => {
    loadOtherlinks();
  });

  const loadOtherlinks = async () => {
    try {
      setLoading(true);
      const response = await API.otherlink.getOtherlinks(1, 100);
      
      if (response.status && response.data.otherlinks) {
        setOtherlinks(response.data.otherlinks);
      }
    } catch (error) {
      console.error('Failed to load otherlinks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    navigate('/admin/create-otherlink');
  };

  const handleEdit = (otherlink) => {
    setEditingOtherlink(otherlink);
    setIsModalOpen(true);
  };

  const handleModalSuccess = (savedOtherlink) => {
    setIsModalOpen(false);
    setEditingOtherlink(null);
    
    // Update local state (only for edits now)
    setOtherlinks(otherlinks().map(o => o.id === savedOtherlink.id ? savedOtherlink : o));
    otherlinkStore.updateOtherlink(savedOtherlink);
  };

  const handleDelete = async (otherlink) => {
    if (!confirm(`Are you sure you want to delete "${otherlink.name}"? All links in this OtherLink will also be deleted.`)) {
      return;
    }

    try {
      setDeletingId(otherlink.id);
      const response = await API.otherlink.deleteOtherlink(otherlink.id);
      
      if (response.status) {
        setOtherlinks(otherlinks().filter(o => o.id !== otherlink.id));
        otherlinkStore.removeOtherlink(otherlink.id);
      } else {
        alert(response.message || 'Failed to delete otherlink');
      }
    } catch (error) {
      console.error('Failed to delete otherlink:', error);
      alert('An error occurred while deleting the otherlink');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSelect = (otherlink) => {
    otherlinkStore.selectOtherlink(otherlink.id);
    navigate('/admin/dashboard');
  };

  return (
    <div class="otherlinks-page">
      <div class="page-header">
        <div>
          <h1>Manage OtherLinks</h1>
          <p class="page-description">
            Create and manage your "Link in Bio" pages. Each OtherLink can contain multiple links.
          </p>
        </div>
        <button class="btn btn-primary" onClick={handleCreate}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2V14M2 8H14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Create OtherLink
        </button>
      </div>

      <Show when={loading()}>
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading OtherLinks...</p>
        </div>
      </Show>

      <Show when={!loading() && otherlinks().length === 0}>
        <div class="empty-state">
          <svg class="empty-icon" width="64" height="64" viewBox="0 0 64 64" fill="none">
            <rect x="12" y="16" width="40" height="32" rx="4" stroke="currentColor" stroke-width="3"/>
            <line x1="20" y1="24" x2="44" y2="24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="20" y1="32" x2="36" y2="32" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="20" y1="40" x2="40" y2="40" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <h2>No OtherLinks Yet</h2>
          <p>Create your first OtherLink to get started with managing your links.</p>
          <button class="btn btn-primary" onClick={handleCreate}>
            Create Your First OtherLink
          </button>
        </div>
      </Show>

      <Show when={!loading() && otherlinks().length > 0}>
        <div class="otherlinks-grid">
          <For each={otherlinks()}>
            {(otherlink) => (
              <div class={`otherlink-card ${!otherlink.active ? 'inactive' : ''}`}>
                <div class="otherlink-card-header">
                  <div class="otherlink-card-title-row">
                    <h3 class="otherlink-card-title">{otherlink.name}</h3>
                    <Show when={!otherlink.active}>
                      <span class="badge badge-inactive">Inactive</span>
                    </Show>
                  </div>
                  <Show when={otherlink.description}>
                    <p class="otherlink-card-description">{otherlink.description}</p>
                  </Show>
                </div>

                <div class="otherlink-card-stats">
                  <div class="stat">
                    <div class="stat-value">{otherlink.link_count || 0}</div>
                    <div class="stat-label">Total Links</div>
                  </div>
                  <div class="stat">
                    <div class="stat-value">{otherlink.active_link_count || 0}</div>
                    <div class="stat-label">Active Links</div>
                  </div>
                  <div class="stat">
                    <div class="stat-value">{otherlink.collaborator_count || 1}</div>
                    <div class="stat-label">Collaborators</div>
                  </div>
                </div>

                <div class="otherlink-card-footer">
                  <button 
                    class="btn btn-secondary btn-sm" 
                    onClick={() => handleSelect(otherlink)}
                  >
                    View Dashboard
                  </button>
                  <div class="otherlink-card-actions">
                    <button 
                      class="btn-icon" 
                      onClick={() => handleEdit(otherlink)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button 
                      class="btn-icon btn-icon-danger" 
                      onClick={() => handleDelete(otherlink)}
                      disabled={deletingId() === otherlink.id}
                      title="Delete"
                    >
                      {deletingId() === otherlink.id ? '⏳' : '🗑️'}
                    </button>
                  </div>
                </div>

                <Show when={otherlinkStore.selectedOtherlinkId() === otherlink.id}>
                  <div class="otherlink-card-badge">Currently Viewing</div>
                </Show>
              </div>
            )}
          </For>
        </div>
      </Show>

      <OtherlinkFormModal
        isOpen={isModalOpen()}
        otherlink={editingOtherlink()}
        onClose={() => {
          setIsModalOpen(false);
          setEditingOtherlink(null);
        }}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}

