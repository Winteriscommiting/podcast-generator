// Voice Clone Card component class
class VoiceCloneCard extends Component {
    constructor(voiceData, options = {}) {
        super();
        
        this.voice = voiceData;
        this.options = {
            showActions: options.showActions !== false,
            onPlay: options.onPlay || (() => {}),
            onEdit: options.onEdit || (() => {}),
            onDelete: options.onDelete || (() => {}),
            onSetDefault: options.onSetDefault || (() => {}),
            ...options
        };
        
        // Create the element immediately
        const tempDiv = window.document.createElement('div');
        tempDiv.innerHTML = this.render();
        this.element = tempDiv.firstElementChild;
        
        // Audio player for preview
        this.audio = null;
        this.isPlaying = false;
    }
    
    render() {
        const { voice } = this;
        const statusClass = this.getStatusClass(voice.status);
        const formattedDate = formatDate(voice.createdAt);
        const formattedSize = this.formatFileSize(voice.audioFileSize);
        const formattedDuration = this.formatDuration(voice.duration);
        
        return `
            <div class="voice-card" data-id="${voice._id}">
                <div class="voice-header">
                    <div class="voice-avatar">
                        <i class="fas ${this.getGenderIcon(voice.gender)}"></i>
                    </div>
                    <div class="voice-info">
                        <h4 class="voice-name">
                            ${voice.name}
                            ${voice.isDefault ? '<span class="badge badge-primary">Default</span>' : ''}
                        </h4>
                        <div class="voice-meta">
                            <span><i class="fas fa-globe"></i> ${voice.language}</span>
                            ${voice.accent ? `<span><i class="fas fa-microphone"></i> ${voice.accent}</span>` : ''}
                        </div>
                    </div>
                    <div class="voice-status ${statusClass}">
                        ${capitalize(voice.status)}
                    </div>
                </div>
                
                ${voice.description ? `
                <div class="voice-description">
                    ${voice.description}
                </div>
                ` : ''}
                
                <div class="voice-stats">
                    <div class="voice-stat">
                        <i class="fas fa-clock"></i>
                        <span>${formattedDuration}</span>
                    </div>
                    <div class="voice-stat">
                        <i class="fas fa-file-audio"></i>
                        <span>${formattedSize}</span>
                    </div>
                    <div class="voice-stat">
                        <i class="fas fa-calendar"></i>
                        <span>${formattedDate}</span>
                    </div>
                    ${voice.timesUsed > 0 ? `
                    <div class="voice-stat">
                        <i class="fas fa-headphones"></i>
                        <span>${voice.timesUsed} uses</span>
                    </div>
                    ` : ''}
                </div>
                
                ${voice.tags && voice.tags.length > 0 ? `
                <div class="voice-tags">
                    ${voice.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                ` : ''}
                
                ${this.options.showActions ? this.renderActions() : ''}
            </div>
        `;
    }
    
    renderActions() {
        const { voice } = this;
        
        return `
            <div class="voice-actions">
                ${voice.status === 'ready' || voice.status === 'uploaded' ? `
                    <button class="btn btn-icon btn-play" data-id="${voice._id}" title="Play Sample">
                        <i class="fas fa-play"></i>
                    </button>
                ` : ''}
                <button class="btn btn-icon btn-edit" data-id="${voice._id}" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                ${!voice.isDefault ? `
                    <button class="btn btn-icon btn-set-default" data-id="${voice._id}" title="Set as Default">
                        <i class="fas fa-star"></i>
                    </button>
                ` : ''}
                <button class="btn btn-icon btn-delete" data-id="${voice._id}" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }
    
    mount() {
        // Play button
        const playBtn = this.find('.btn-play');
        if (playBtn) {
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.togglePlay();
            });
        }
        
        // Edit button
        const editBtn = this.find('.btn-edit');
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.options.onEdit(this.voice);
            });
        }
        
        // Set default button
        const defaultBtn = this.find('.btn-set-default');
        if (defaultBtn) {
            defaultBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.options.onSetDefault(this.voice);
            });
        }
        
        // Delete button
        const deleteBtn = this.find('.btn-delete');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.options.onDelete(this.voice);
            });
        }
    }
    
    async togglePlay() {
        if (!this.audio) {
            // Create audio element
            this.audio = new Audio(this.voice.audioUrl);
            
            this.audio.addEventListener('ended', () => {
                this.isPlaying = false;
                this.updatePlayButton();
            });
            
            this.audio.addEventListener('error', (e) => {
                console.error('Error playing audio:', e);
                showToast('Failed to play audio', 'error');
                this.isPlaying = false;
                this.updatePlayButton();
            });
        }
        
        if (this.isPlaying) {
            this.audio.pause();
            this.isPlaying = false;
        } else {
            try {
                await this.audio.play();
                this.isPlaying = true;
                this.options.onPlay(this.voice);
            } catch (error) {
                console.error('Error playing audio:', error);
                showToast('Failed to play audio', 'error');
            }
        }
        
        this.updatePlayButton();
    }
    
    updatePlayButton() {
        const playBtn = this.find('.btn-play i');
        if (playBtn) {
            playBtn.className = this.isPlaying ? 'fas fa-pause' : 'fas fa-play';
        }
    }
    
    stopPlayback() {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
            this.isPlaying = false;
            this.updatePlayButton();
        }
    }
    
    updateStatus(status) {
        this.voice.status = status;
        
        const statusElement = this.find('.voice-status');
        if (statusElement) {
            statusElement.className = `voice-status ${this.getStatusClass(status)}`;
            statusElement.textContent = capitalize(status);
        }
    }
    
    updateVoiceData(voiceData) {
        this.voice = { ...this.voice, ...voiceData };
        
        // Update name
        const nameElement = this.find('.voice-name');
        if (nameElement) {
            nameElement.innerHTML = `
                ${this.voice.name}
                ${this.voice.isDefault ? '<span class="badge badge-primary">Default</span>' : ''}
            `;
        }
        
        // Update description
        const descElement = this.find('.voice-description');
        if (this.voice.description && descElement) {
            descElement.textContent = this.voice.description;
        }
        
        // Update tags
        const tagsElement = this.find('.voice-tags');
        if (this.voice.tags && this.voice.tags.length > 0 && tagsElement) {
            tagsElement.innerHTML = this.voice.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        }
    }
    
    getStatusClass(status) {
        const statusMap = {
            'uploaded': 'status-info',
            'processing': 'status-processing',
            'ready': 'status-success',
            'failed': 'status-error'
        };
        return statusMap[status] || 'status-info';
    }
    
    getGenderIcon(gender) {
        const iconMap = {
            'male': 'fa-male',
            'female': 'fa-female',
            'neutral': 'fa-user',
            'unknown': 'fa-user-circle'
        };
        return iconMap[gender] || 'fa-user-circle';
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
    
    formatDuration(seconds) {
        if (!seconds || seconds === 0) return 'Unknown';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}
