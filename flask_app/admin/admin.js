// Blog posts data structure
let blogPosts = [
    {
        id: 1,
        title: "AI-Driven Software Development for Faster, Smarter Solutions",
        language: "en",
        date: "2024-01-20",
        status: "published",
        content: "The world of software development is evolving rapidly...",
        tags: ["AI", "Software Development"]
    },
    {
        id: 2,
        title: "Daha Hızlı, Daha Akıllı Çözümler için AI Destekli Yazılım Geliştirme",
        language: "tr",
        date: "2024-01-20",
        status: "published",
        content: "Yazılım geliştirme dünyası hızla gelişiyor...",
        tags: ["AI", "Yazılım Geliştirme"]
    }
];

// DOM Elements
const modal = document.getElementById('postModal');
const modalTitle = document.getElementById('modalTitle');
const blogPostForm = document.getElementById('blogPostForm');
const blogPostsList = document.getElementById('blogPostsList');

// Current editing post ID (null for new posts)
let currentEditingId = null;

// Initialize the admin panel
function init() {
    renderBlogPosts();
    setupEventListeners();
}

// Render blog posts table
function renderBlogPosts() {
    blogPostsList.innerHTML = '';
    blogPosts.forEach(post => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${post.title}</td>
            <td>${post.language.toUpperCase()}</td>
            <td>${formatDate(post.date)}</td>
            <td><span class="status-badge status-${post.status}">${post.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="edit-btn" onclick="editPost(${post.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="delete-btn" onclick="deletePost(${post.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
        blogPostsList.appendChild(row);
    });
}

// Setup event listeners
function setupEventListeners() {
    blogPostForm.addEventListener('submit', handleFormSubmit);
    window.onclick = (event) => {
        if (event.target === modal) {
            closeModal();
        }
    };
}

// Open modal for new post
function openNewPostModal() {
    currentEditingId = null;
    modalTitle.textContent = 'New Blog Post';
    blogPostForm.reset();
    modal.style.display = 'block';
}

// Open modal for editing
function editPost(id) {
    const post = blogPosts.find(p => p.id === id);
    if (!post) return;

    currentEditingId = id;
    modalTitle.textContent = 'Edit Blog Post';
    
    // Fill form with post data
    document.getElementById('postTitle').value = post.title;
    document.getElementById('postLanguage').value = post.language;
    document.getElementById('postContent').value = post.content;
    document.getElementById('postTags').value = post.tags.join(', ');
    
    modal.style.display = 'block';
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();

    const formData = {
        title: document.getElementById('postTitle').value,
        language: document.getElementById('postLanguage').value,
        content: document.getElementById('postContent').value,
        tags: document.getElementById('postTags').value.split(',').map(tag => tag.trim()),
        date: new Date().toISOString().split('T')[0],
        status: 'published'
    };

    if (currentEditingId) {
        // Update existing post
        const index = blogPosts.findIndex(p => p.id === currentEditingId);
        if (index !== -1) {
            blogPosts[index] = { ...blogPosts[index], ...formData };
        }
    } else {
        // Add new post
        const newPost = {
            id: blogPosts.length + 1,
            ...formData
        };
        blogPosts.push(newPost);
    }

    // Handle image upload if provided
    const imageFile = document.getElementById('postImage').files[0];
    if (imageFile) {
        // Here you would typically upload the image to your server
        console.log('Image would be uploaded:', imageFile.name);
    }

    renderBlogPosts();
    closeModal();
    showNotification(currentEditingId ? 'Post updated successfully!' : 'New post created successfully!');
}

// Delete post
function deletePost(id) {
    if (confirm('Are you sure you want to delete this post?')) {
        blogPosts = blogPosts.filter(post => post.id !== id);
        renderBlogPosts();
        showNotification('Post deleted successfully!');
    }
}

// Close modal
function closeModal() {
    modal.style.display = 'none';
    blogPostForm.reset();
    currentEditingId = null;
}

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Show notification
function showNotification(message) {
    // You can implement a more sophisticated notification system
    alert(message);
}

// Logout function
function logout() {
    // Implement logout logic here
    window.location.href = '../login.html';
}

// Initialize the admin panel when the page loads
document.addEventListener('DOMContentLoaded', init); 