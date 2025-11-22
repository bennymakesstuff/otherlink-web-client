import { createSignal, Show, For, onMount, onCleanup } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { otherlinkStore } from '../../stores/otherlinkStore';
import './OtherlinkSwitcher.css';

/**
 * OtherlinkSwitcher Component
 * Dropdown to select which otherlink dashboard to view
 */
export function OtherlinkSwitcher(props) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = createSignal(false);
  let dropdownRef;

  onMount(() => {
    // Load otherlinks if not already loaded
    if (otherlinkStore.otherlinks().length === 0 && !otherlinkStore.loading()) {
      otherlinkStore.loadOtherlinks();
    }

    // Add click outside listener
    const handleClickOutside = (event) => {
      if (dropdownRef && !dropdownRef.contains(event.target) && isOpen()) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    onCleanup(() => {
      document.removeEventListener('mousedown', handleClickOutside);
    });
  });

  const handleSelect = (otherlinkId) => {
    otherlinkStore.selectOtherlink(otherlinkId);
    setIsOpen(false);
    if (props.onSwitch) {
      props.onSwitch(otherlinkId);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen());
  };

  const handleManageClick = () => {
    setIsOpen(false);
    
    // If no otherlinks, navigate to create page
    if (otherlinkStore.otherlinks().length === 0) {
      navigate('/admin/create-otherlink');
    } else if (props.onManageClick) {
      props.onManageClick();
    } else {
      navigate('/admin/otherlinks');
    }
  };

  return (
    <div class="otherlink-switcher">
      <label class="switcher-label">Viewing Dashboard:</label>
      
      <div class="switcher-dropdown" ref={dropdownRef}>
        <button 
          class="switcher-button" 
          onClick={toggleDropdown}
          disabled={otherlinkStore.loading()}
        >
          <Show 
            when={!otherlinkStore.loading()} 
            fallback={<span class="switcher-loading">Loading...</span>}
          >
            <Show 
              when={otherlinkStore.selectedOtherlink()} 
              fallback={<span class="switcher-placeholder">No OtherLink Selected</span>}
            >
              <span class="switcher-selected">
                {otherlinkStore.selectedOtherlink()?.name}
              </span>
            </Show>
          </Show>
          <svg class={`switcher-icon ${isOpen() ? 'open' : ''}`} width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <Show when={isOpen()}>
          <div class="switcher-menu">
            <div class="switcher-menu-section">
              <div class="switcher-menu-header">Your OtherLinks</div>
              <Show 
                when={otherlinkStore.otherlinks().length > 0}
                fallback={
                  <div class="switcher-menu-empty">
                    No OtherLinks yet. Create one to get started!
                  </div>
                }
              >
                <For each={otherlinkStore.otherlinks()}>
                  {(otherlink) => (
                    <button
                      class={`switcher-menu-item ${otherlinkStore.selectedOtherlinkId() === otherlink.id ? 'active' : ''}`}
                      onClick={() => handleSelect(otherlink.id)}
                    >
                      <div class="switcher-menu-item-content">
                        <span class="switcher-menu-item-name">{otherlink.name}</span>
                        <Show when={!otherlink.active}>
                          <span class="switcher-menu-item-badge inactive">Inactive</span>
                        </Show>
                      </div>
                      <span class="switcher-menu-item-stats">
                        {otherlink.active_link_count || 0} / {otherlink.link_count || 0} links
                      </span>
                    </button>
                  )}
                </For>
              </Show>
            </div>
            
            <div class="switcher-menu-divider"></div>
            
            <button class="switcher-menu-action" onClick={() => { setIsOpen(false); navigate('/admin/create-otherlink'); }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2V14M2 8H14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Create New OtherLink
            </button>
            
            <button class="switcher-menu-action" onClick={handleManageClick}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 7.5L3 9.5L5 9.5L5 11.5L7 11.5L7 9.5L9 9.5L9 11.5L11 11.5L11 9.5L13 9.5L13 7.5L11 7.5L11 5.5L9 5.5L9 7.5L7 7.5L7 5.5L5 5.5L5 7.5L3 7.5Z" fill="currentColor"/>
              </svg>
              Manage All OtherLinks
            </button>
          </div>
        </Show>
      </div>
    </div>
  );
}

