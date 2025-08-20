// Enhanced Blog Editor JavaScript
class BlogEditor {
    constructor() {
        this.blogPosts = [];
        this.currentEditingId = null;
        this.currentFilters = {
            status: '',
            language: '',
            search: ''
        };
        
        this.init();
    }
    
    async init() {
        await this.loadSampleData();
        this.setupEventListeners();
        this.renderBlogPosts();
    }
    
    // Load blog data from API
    async loadSampleData() {
        try {
            const response = await fetch('/api/blog-posts');
            const data = await response.json();
            
            if (data.success) {
                this.blogPosts = data.blog_posts.map((post, index) => ({
                    id: post.id || `post-${index + 1}`, // Use original ID or generate one
                    title: post.title,
                    slug: post.slug || post.id,
                    language: post.language || 'tr',
                    status: post.status || 'active',
                    excerpt: post.excerpt || post.description || '',
                    content: post.content || post.description || '',
                    tags: post.tags || [],
                    image: post.image_url || post.image || '/images/placeholder.webp',
                    date: post.published_at || post.date || post.created_date || new Date().toISOString().split('T')[0],
                    author: post.author || "Pro-Lance Team",
                    url: post.url || ''
                }));
            } else {
                console.error('Failed to load blog posts:', data.message);
                this.blogPosts = [];
            }
        } catch (error) {
            console.error('Error loading blog posts:', error);
            this.blogPosts = [];
        }
    }
    
    setupEventListeners() {
        // Filter event listeners
        const statusFilter = document.getElementById('statusFilter');
        const languageFilter = document.getElementById('languageFilter');
        const searchFilter = document.getElementById('searchFilter');
        const refreshBtn = document.getElementById('refreshBtn');
        const addNewBtn = document.getElementById('addNewBtn');
        
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.currentFilters.status = e.target.value;
                this.renderBlogPosts();
            });
        }
        
        if (languageFilter) {
            languageFilter.addEventListener('change', (e) => {
                this.currentFilters.language = e.target.value;
                this.renderBlogPosts();
            });
        }
        
        if (searchFilter) {
            searchFilter.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value;
                this.renderBlogPosts();
            });
        }
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                await this.loadSampleData();
                this.renderBlogPosts();
                this.showNotification('Blog posts refreshed!', 'success');
            });
        }
        
        if (addNewBtn) {
            addNewBtn.addEventListener('click', () => {
                this.openNewPostForm();
            });
        }
        
        // Form submission
        const blogForm = document.getElementById('blogForm');
        if (blogForm) {
            blogForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.savePost();
            });
        }
        
        // Auto-generate slug from title
        const blogTitle = document.getElementById('blogTitle');
        if (blogTitle) {
            blogTitle.addEventListener('input', (e) => {
                const slug = this.generateSlug(e.target.value);
                const blogSlug = document.getElementById('blogSlug');
                if (blogSlug) {
                    blogSlug.value = slug;
                }
            });
        }
    }
    
    renderBlogPosts() {
        const container = document.getElementById('blogPostsList');
        if (!container) {
            console.error('Blog posts container not found');
            return;
        }
        
        container.innerHTML = '';
        
        const filteredPosts = this.getFilteredPosts();
        
        if (filteredPosts.length === 0) {
            container.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #666;">No blog posts found matching your filters.</td></tr>';
            return;
        }
        
        filteredPosts.forEach(post => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="blog-title">${post.title}</div>
                    <div class="blog-meta">${post.excerpt || post.description || 'No excerpt available'}</div>
                </td>
                <td>
                    <span class="language-badge ${post.language}">${post.language.toUpperCase()}</span>
                </td>
                <td>
                    <span class="status-badge ${post.status}">${post.status}</span>
                </td>
                <td>${this.formatDate(post.date || post.published_at)}</td>
                <td>
                    <div class="blog-actions">
                        <button class="edit-btn" onclick="window.blogEditor.editPost('${post.id}')" title="Edit">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="delete-btn" onclick="window.blogEditor.deletePost('${post.id}')" title="Delete">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            `;
            container.appendChild(row);
        });
    }
    
    getFilteredPosts() {
        return this.blogPosts.filter(post => {
            // Status filter
            if (this.currentFilters.status && post.status !== this.currentFilters.status) {
                return false;
            }
            
            // Language filter
            if (this.currentFilters.language && post.language !== this.currentFilters.language) {
                return false;
            }
            
            // Search filter
            if (this.currentFilters.search) {
                const searchTerm = this.currentFilters.search.toLowerCase();
                return post.title.toLowerCase().includes(searchTerm) || 
                       post.excerpt.toLowerCase().includes(searchTerm) ||
                       post.content.toLowerCase().includes(searchTerm);
            }
            
            return true;
        });
    }
    
    openNewPostForm() {
        this.currentEditingId = null;
        this.showBlogForm();
        this.clearForm();
    }
    
    editPost(id) {
        console.log('Edit post called with id:', id); // Debug log
        console.log('Available posts:', this.blogPosts); // Debug log
        
        // Convert id to string for comparison
        const idString = String(id);
        
        const post = this.blogPosts.find(p => String(p.id) === idString);
        if (!post) {
            console.error('Post not found for id:', idString); // Debug log
            console.log('Available IDs:', this.blogPosts.map(p => p.id)); // Debug log
            this.showNotification('Post not found!', 'error');
            return;
        }
        
        console.log('Found post to edit:', post); // Debug log
        
        this.currentEditingId = id;
        this.showBlogForm();
        this.fillForm(post);
    }
    
    showBlogForm() {
        const formContainer = document.getElementById('blogEditor');
        if (formContainer) {
            formContainer.style.display = 'block';
            // Scroll to form
            formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    hideBlogForm() {
        const formContainer = document.getElementById('blogEditor');
        if (formContainer) {
            formContainer.style.display = 'none';
        }
        this.currentEditingId = null;
        this.clearForm();
    }
    
    clearForm() {
        const form = document.getElementById('blogForm');
        if (form) {
            form.reset();
            const titleField = document.getElementById('blogTitle');
            const slugField = document.getElementById('blogSlug');
            const excerptField = document.getElementById('blogExcerpt');
            const contentField = document.getElementById('blogContent');
            const tagsField = document.getElementById('blogTags');
            const imageField = document.getElementById('blogImage');
            const languageField = document.getElementById('blogLanguage');
            const statusField = document.getElementById('blogStatus');
            
            if (titleField) titleField.value = '';
            if (slugField) slugField.value = '';
            if (excerptField) excerptField.value = '';
            if (contentField) contentField.value = '';
            if (tagsField) tagsField.value = '';
            if (imageField) imageField.value = '';
            if (languageField) languageField.value = 'en';
            if (statusField) statusField.value = 'draft';
        }
    }
    
    fillForm(post) {
        const titleField = document.getElementById('blogTitle');
        const slugField = document.getElementById('blogSlug');
        const excerptField = document.getElementById('blogExcerpt');
        const contentField = document.getElementById('blogContent');
        const tagsField = document.getElementById('blogTags');
        const imageField = document.getElementById('blogImage');
        const languageField = document.getElementById('blogLanguage');
        const statusField = document.getElementById('blogStatus');
        
        console.log('Filling form with post data:', post); // Debug log
        
        if (titleField) titleField.value = post.title || '';
        if (slugField) slugField.value = post.slug || post.id || '';
        if (excerptField) excerptField.value = post.excerpt || post.description || '';
        if (contentField) contentField.value = post.content || post.description || '';
        if (tagsField) tagsField.value = post.tags ? post.tags.join(', ') : '';
        if (imageField) imageField.value = post.image || '';
        if (languageField) languageField.value = post.language || 'tr';
        if (statusField) statusField.value = post.status || 'active';
        
        // Update editor title
        const editorTitle = document.getElementById('editorTitle');
        if (editorTitle) {
            editorTitle.textContent = post.title ? `Edit: ${post.title}` : 'Edit Blog Post';
        }
    }
    
    async savePost() {
        try {
            const form = document.getElementById('blogForm');
            if (!form) {
                this.showNotification('Form not found!', 'error');
                return;
            }
            
            const formData = new FormData(form);
            
            const postData = {
                title: formData.get('title'),
                slug: formData.get('slug'),
                excerpt: formData.get('excerpt'),
                content: formData.get('content'),
                description: formData.get('excerpt') || formData.get('content'), // API için description alanı
                tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag),
                image: formData.get('image'),
                language: formData.get('language'),
                status: formData.get('status'),
                date: new Date().toISOString().split('T')[0],
                author: 'Pro-Lance Team'
            };
            
            console.log('Saving post data:', postData); // Debug log
            
            if (this.currentEditingId) {
                // Update existing post
                const currentIdString = String(this.currentEditingId);
                const index = this.blogPosts.findIndex(p => String(p.id) === currentIdString);
                if (index !== -1) {
                    this.blogPosts[index] = { ...this.blogPosts[index], ...postData };
                    console.log('Updated post at index:', index, this.blogPosts[index]);
                }
            } else {
                // Create new post
                const maxId = Math.max(...this.blogPosts.map(p => {
                    const numId = parseInt(p.id);
                    return isNaN(numId) ? 0 : numId;
                }), 0);
                postData.id = (maxId + 1).toString();
                this.blogPosts.push(postData);
                console.log('Created new post:', postData);
            }
            
            this.hideBlogForm();
            this.renderBlogPosts();
            this.showNotification(`Blog post ${this.currentEditingId ? 'updated' : 'created'} successfully!`, 'success');
            
        } catch (error) {
            console.error('Error saving post:', error);
            this.showNotification('Error saving blog post: ' + error.message, 'error');
        }
    }
    
    viewPost(id) {
        const idString = String(id);
        const post = this.blogPosts.find(p => String(p.id) === idString);
        if (!post) {
            this.showNotification('Post not found!', 'error');
            return;
        }
        
        this.showPreviewModal(post);
    }
    
    deletePost(id) {
        if (confirm('Are you sure you want to delete this blog post?')) {
            const idString = String(id);
            this.blogPosts = this.blogPosts.filter(p => String(p.id) !== idString);
            this.renderBlogPosts();
            this.showNotification('Blog post deleted successfully!', 'success');
        }
    }
    
    showPreviewModal(postData) {
        const modal = document.createElement('div');
        modal.className = 'preview-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 800px; max-height: 80vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3>${postData.title}</h3>
                    <button onclick="this.closest('.preview-modal').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>Excerpt:</strong> ${postData.excerpt}
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>Tags:</strong> ${postData.tags.join(', ')}
                </div>
                <div style="white-space: pre-wrap; line-height: 1.6;">${postData.content}</div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        if (!notification) {
            console.error('Notification element not found');
            return;
        }
        
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Initialize blog editor when DOM is loaded and make it globally accessible
let blogEditor;
document.addEventListener('DOMContentLoaded', async () => {
    blogEditor = new BlogEditor();
    // Make it globally accessible
    window.blogEditor = blogEditor;
}); 