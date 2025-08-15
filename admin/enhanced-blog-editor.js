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
    
    init() {
        this.loadSampleData();
        this.setupEventListeners();
        this.renderBlogPosts();
    }
    
    // Sample blog data
    loadSampleData() {
        this.blogPosts = [
            {
                id: 1,
                title: "AI-Driven Software Development for Faster, Smarter Solutions",
                slug: "ai-driven-software-development",
                language: "en",
                status: "published",
                excerpt: "Explore how artificial intelligence is revolutionizing software development processes and enabling faster, more efficient solutions.",
                content: "The world of software development is evolving rapidly with the integration of artificial intelligence technologies. AI-driven development tools are transforming how we write, test, and deploy software, leading to faster development cycles and higher quality code.\n\nKey benefits of AI in software development include:\n- Automated code generation and suggestions\n- Intelligent bug detection and fixing\n- Predictive analytics for project management\n- Enhanced testing automation\n- Improved code review processes\n\nAs we move forward, AI will continue to play a crucial role in shaping the future of software development.",
                tags: ["AI", "Software Development", "Technology"],
                image: "https://example.com/ai-software-dev.jpg",
                date: "2024-01-20",
                author: "Pro-Lance Team"
            },
            {
                id: 2,
                title: "Daha Hızlı, Daha Akıllı Çözümler için AI Destekli Yazılım Geliştirme",
                slug: "ai-destekli-yazilim-gelistirme",
                language: "tr",
                status: "published",
                excerpt: "Yapay zeka teknolojilerinin yazılım geliştirme süreçlerini nasıl devrimleştirdiğini ve daha hızlı, verimli çözümler sağladığını keşfedin.",
                content: "Yazılım geliştirme dünyası, yapay zeka teknolojilerinin entegrasyonuyla hızla gelişiyor. AI destekli geliştirme araçları, yazılım yazma, test etme ve dağıtma şeklimizi dönüştürüyor ve daha hızlı geliştirme döngüleri ve daha yüksek kaliteli kod ile sonuçlanıyor.\n\nYazılım geliştirmede AI'nın temel faydaları şunları içerir:\n- Otomatik kod üretimi ve önerileri\n- Akıllı hata tespiti ve düzeltme\n- Proje yönetimi için tahmine dayalı analitik\n- Gelişmiş test otomasyonu\n- İyileştirilmiş kod inceleme süreçleri\n\nİleriye doğru hareket ederken, AI yazılım geliştirmenin geleceğini şekillendirmede kritik bir rol oynamaya devam edecek.",
                tags: ["AI", "Yazılım Geliştirme", "Teknoloji"],
                image: "https://example.com/ai-yazilim-gelistirme.jpg",
                date: "2024-01-20",
                author: "Pro-Lance Ekibi"
            },
            {
                id: 3,
                title: "SAP Implementation Best Practices",
                slug: "sap-implementation-best-practices",
                language: "en",
                status: "draft",
                excerpt: "Learn the essential best practices for successful SAP implementation projects.",
                content: "SAP implementation projects require careful planning and execution to ensure success. This comprehensive guide covers the key best practices that organizations should follow when implementing SAP solutions.\n\nKey areas covered include:\n- Project planning and governance\n- Change management strategies\n- Data migration best practices\n- User training and adoption\n- Testing and quality assurance\n- Go-live preparation and support\n\nFollowing these best practices can significantly increase the likelihood of a successful SAP implementation.",
                tags: ["SAP", "Implementation", "Best Practices"],
                image: "https://example.com/sap-implementation.jpg",
                date: "2024-01-15",
                author: "Pro-Lance Team"
            }
        ];
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
            refreshBtn.addEventListener('click', () => {
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
                    <div>
                        <strong>${post.title}</strong>
                        <br>
                        <small style="color: #666;">${post.excerpt}</small>
                    </div>
                </td>
                <td>${post.language.toUpperCase()}</td>
                <td>
                    <span class="status-badge ${post.status}">${post.status}</span>
                </td>
                <td>${this.formatDate(post.date)}</td>
                <td>
                    <button class="btn-action view" onclick="window.blogEditor.viewPost(${post.id})" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action edit" onclick="window.blogEditor.editPost(${post.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action delete" onclick="window.blogEditor.deletePost(${post.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
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
        const post = this.blogPosts.find(p => p.id === id);
        if (!post) {
            this.showNotification('Post not found!', 'error');
            return;
        }
        
        this.currentEditingId = id;
        this.showBlogForm();
        this.fillForm(post);
    }
    
    showBlogForm() {
        const formContainer = document.getElementById('blogEditorForm');
        if (formContainer) {
            formContainer.style.display = 'block';
        }
    }
    
    hideBlogForm() {
        const formContainer = document.getElementById('blogEditorForm');
        if (formContainer) {
            formContainer.style.display = 'none';
        }
        this.currentEditingId = null;
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
        
        if (titleField) titleField.value = post.title || '';
        if (slugField) slugField.value = post.slug || '';
        if (excerptField) excerptField.value = post.excerpt || '';
        if (contentField) contentField.value = post.content || '';
        if (tagsField) tagsField.value = post.tags ? post.tags.join(', ') : '';
        if (imageField) imageField.value = post.image || '';
        if (languageField) languageField.value = post.language || 'en';
        if (statusField) statusField.value = post.status || 'draft';
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
                tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag),
                image: formData.get('image'),
                language: formData.get('language'),
                status: formData.get('status'),
                date: new Date().toISOString().split('T')[0],
                author: 'Pro-Lance Team'
            };
            
            if (this.currentEditingId) {
                // Update existing post
                const index = this.blogPosts.findIndex(p => p.id === this.currentEditingId);
                if (index !== -1) {
                    this.blogPosts[index] = { ...this.blogPosts[index], ...postData };
                }
            } else {
                // Create new post
                postData.id = Math.max(...this.blogPosts.map(p => p.id), 0) + 1;
                this.blogPosts.push(postData);
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
        const post = this.blogPosts.find(p => p.id === id);
        if (!post) {
            this.showNotification('Post not found!', 'error');
            return;
        }
        
        this.showPreviewModal(post);
    }
    
    deletePost(id) {
        if (confirm('Are you sure you want to delete this blog post?')) {
            this.blogPosts = this.blogPosts.filter(p => p.id !== id);
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
document.addEventListener('DOMContentLoaded', () => {
    blogEditor = new BlogEditor();
    // Make it globally accessible
    window.blogEditor = blogEditor;
}); 