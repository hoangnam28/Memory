const API_URL = process.env.NODE_ENV === 'production' 
    ? 'https://memory-2a4mnua72-hoangnam28s-projects.vercel.app'
    : 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    const albumSection = document.getElementById('albumSection');
    const photoSection = document.getElementById('photoSection');
    const albumList = document.getElementById('albumList');
    const albumForm = document.getElementById('albumForm');
    const backToAlbumsBtn = document.getElementById('backToAlbums');
    const currentAlbumName = document.getElementById('currentAlbumName');
    
    // Bootstrap Modal instances
    const albumModal = new bootstrap.Modal(document.getElementById('albumModal'));
    const lightboxModal = new bootstrap.Modal(document.getElementById('lightboxModal'));
    
    let currentAlbumId = null;

    // Load albums
    function loadAlbums() {
        fetch(`${API_URL}/api/albums`)
            .then(res => res.json())
            .then(albums => {
                albumList.innerHTML = '';
                if (albums.length === 0) {
                    albumList.innerHTML = '<div class="col-12"><div class="no-albums"><i class="bi bi-images fs-1 d-block mb-3"></i>No albums created yet</div></div>';
                    return;
                }

                albums.forEach(album => {
                    const col = document.createElement('div');
                    col.className = 'col-md-4 col-lg-3';
                    col.innerHTML = `
                        <div class="card album-card">
                            <div class="card-body">
                                <h5 class="card-title">${album.name}</h5>
                                <p class="card-text text-muted small">${album.description || 'No description'}</p>
                                <p class="card-text">
                                    <small class="text-muted">
                                        <i class="bi bi-image me-1"></i>${album.photo_count} photos
                                    </small>
                                </p>
                                <p class="card-text">
                                    <small class="text-muted">
                                        <i class="bi bi-calendar me-1"></i>${new Date(album.created_at).toLocaleDateString()}
                                    </small>
                                </p>
                            </div>
                        </div>
                    `;
                    col.querySelector('.album-card').addEventListener('click', () => openAlbum(album));
                    albumList.appendChild(col);
                });
            })
            .catch(error => console.error('Error:', error));
    }

    function createPhotoElement(photo) {
        const col = document.createElement('div');
        col.className = 'col-6 col-md-4 col-lg-3';
        col.innerHTML = `
            <div class="card photo-card">
                <img src="${photo.photo_url}" alt="${photo.title}">
                <div class="photo-overlay">
                    <h6 class="mb-1">${photo.title}</h6>
                    <small>${photo.description || ''}</small>
                </div>
            </div>
        `;

        col.querySelector('.photo-card').addEventListener('click', () => {
            const lightboxImg = document.querySelector('#lightboxModal img');
            const lightboxTitle = document.querySelector('#lightboxModal .modal-title');
            const lightboxDescription = document.querySelector('#lightboxModal .modal-footer p');
            
            lightboxImg.src = photo.photo_url;
            lightboxTitle.textContent = photo.title;
            lightboxDescription.textContent = photo.description || '';
            lightboxModal.show();
        });

        return col;
    }

    function openAlbum(album) {
        currentAlbumId = album.id;
        currentAlbumName.textContent = album.name;
        albumSection.style.display = 'none';
        photoSection.style.display = 'block';
        loadPhotos(album.id);
    }

    function loadPhotos(albumId) {
        const gallery = document.getElementById('gallery');
        gallery.innerHTML = '';
        fetch(`${API_URL}/api/photos/album/${albumId}`)
            .then(res => res.json())
            .then(photos => {
                if (photos.length === 0) {
                    gallery.innerHTML = '<div class="col-12"><div class="no-photos"><i class="bi bi-camera fs-1 d-block mb-3"></i>No photos in this album yet</div></div>';
                    return;
                }
                photos.forEach(photo => {
                    gallery.appendChild(createPhotoElement(photo));
                });
            })
            .catch(error => console.error('Error:', error));
    }

    // Album form submission
    albumForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(albumForm);
        const albumData = Object.fromEntries(formData);

        fetch(`${API_URL}/api/albums`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(albumData)
        })
            .then(res => res.json())
            .then(data => {
                albumModal.hide();
                albumForm.reset();
                loadAlbums();
                showToast('Album created successfully');
            })
            .catch(error => console.error('Error:', error));
    });

    // Photo upload form
    const uploadForm = document.getElementById('uploadForm');
    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(uploadForm);
        formData.append('album_id', currentAlbumId);

        fetch('/api/photos/upload', {
            method: 'POST',
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                showToast('Photo uploaded successfully');
                loadPhotos(currentAlbumId);
                uploadForm.reset();
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('Error uploading photo', 'error');
            });
    });

    // Back to albums button
    backToAlbumsBtn.addEventListener('click', () => {
        photoSection.style.display = 'none';
        albumSection.style.display = 'block';
        currentAlbumId = null;
    });

    // Helper function to show toast notifications
    function showToast(message, type = 'success') {
        const toastDiv = document.createElement('div');
        toastDiv.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0 position-fixed bottom-0 end-0 m-3`;
        toastDiv.setAttribute('role', 'alert');
        toastDiv.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        document.body.appendChild(toastDiv);
        const toast = new bootstrap.Toast(toastDiv);
        toast.show();
        toastDiv.addEventListener('hidden.bs.toast', () => toastDiv.remove());
    }

    // Get the create album button and modal
    const createAlbumBtn = document.getElementById('createAlbumBtn');

    // Add click event listener to the create album button
    createAlbumBtn.addEventListener('click', () => {
        albumModal.show();
    });

    // When modal is hidden, reset the form
    document.getElementById('albumModal').addEventListener('hidden.bs.modal', () => {
        albumForm.reset();
    });

    // Initial load
    loadAlbums();
});

// Delete photo function
function deletePhoto(id) {
    if (confirm('Are you sure you want to delete this photo?')) {
        fetch(`/api/photos/${id}`, {
            method: 'DELETE'
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                location.reload();
            })
            .catch(error => console.error('Error:', error));
    }
}

// Edit photo function
function editPhoto(id) {
    const newTitle = prompt('Enter new title:');
    const newDescription = prompt('Enter new description:');

    if (newTitle && newDescription) {
        fetch(`/api/photos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: newTitle,
                description: newDescription
            })
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                location.reload();
            })
            .catch(error => console.error('Error:', error));
    }
}
