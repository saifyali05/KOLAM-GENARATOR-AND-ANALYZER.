// Main page functionality for Kolam Generator

// Global variables
let currentSection = 'generator';
let canvas, ctx;
let gridSize = { width: 8, height: 8 };
let currentColorScheme = 'traditional';
let generatedKolams = [];

// Color schemes
const colorSchemes = {
    traditional: ['#ff6b6b', '#ffd93d', '#54a0ff', '#5f27cd', '#00d2d3'],
    festival: ['#ff9f43', '#10ac84', '#ee5a24', '#feca57', '#ff6348'],
    monochrome: ['#2f3542', '#57606f', '#a4b0be', '#ced6e0', '#ddd']
};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializeCanvas();
    initializeEventListeners();
    initializeMonuments();
    showToast('Welcome to Kolam Generator! 🎨', 'info');
    
    // Initialize complexity slider
    updateComplexityValue();
});

// Initialize canvas
function initializeCanvas() {
    try {
        canvas = document.getElementById('kolamCanvas');
        if (!canvas) {
            console.error('Canvas element not found');
            return;
        }
        
        ctx = canvas.getContext('2d');
        clearCanvas();
        
        console.log('Canvas initialized successfully');
    } catch (error) {
        console.error('Error initializing canvas:', error);
        showToast('Error initializing canvas', 'error');
    }
}

// Initialize event listeners
function initializeEventListeners() {
    try {
        // Navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const target = this.getAttribute('href').substring(1);
                switchSection(target);
            });
        });
        
        // Color scheme selector
        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', function() {
                selectColorScheme(this.dataset.scheme);
            });
        });
        
        // Complexity slider
        const complexitySlider = document.getElementById('complexity');
        if (complexitySlider) {
            complexitySlider.addEventListener('input', updateComplexityValue);
        }
        
        // Grid size inputs
        const gridInputs = document.querySelectorAll('#gridWidth, #gridHeight');
        gridInputs.forEach(input => {
            input.addEventListener('change', updateGridSize);
        });
        
        // File upload for analyzer
        const imageInput = document.getElementById('imageInput');
        const uploadArea = document.getElementById('uploadArea');
        
        if (imageInput && uploadArea) {
            imageInput.addEventListener('change', handleFileUpload);
            
            // Drag and drop functionality
            uploadArea.addEventListener('dragover', function(e) {
                e.preventDefault();
                this.classList.add('dragover');
            });
            
            uploadArea.addEventListener('dragleave', function(e) {
                e.preventDefault();
                this.classList.remove('dragover');
            });
            
            uploadArea.addEventListener('drop', function(e) {
                e.preventDefault();
                this.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    handleFileUpload({ target: { files } });
                }
            });
            
            uploadArea.addEventListener('click', function() {
                imageInput.click();
            });
        }
        
        // Gallery filters
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                filterGallery(this.dataset.filter);
            });
        });
        
        console.log('Event listeners initialized successfully');
    } catch (error) {
        console.error('Error initializing event listeners:', error);
    }
}

// Switch between sections
function switchSection(sectionName) {
    try {
        // Update navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionName}`) {
                link.classList.add('active');
            }
        });
        
        // Update sections
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.classList.remove('active');
        });
        
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
            currentSection = sectionName;
        }
        
        // Initialize section-specific functionality
        if (sectionName === 'gallery') {
            loadGallery();
        }
    } catch (error) {
        console.error('Error switching section:', error);
    }
}

// Profile menu toggle
function toggleProfileMenu() {
    try {
        const profileMenu = document.getElementById('profileMenu');
        if (profileMenu) {
            profileMenu.classList.toggle('show');
        }
    } catch (error) {
        console.error('Error toggling profile menu:', error);
    }
}

// Close profile menu when clicking outside
document.addEventListener('click', function(e) {
    const profileMenu = document.getElementById('profileMenu');
    const profileBtn = document.querySelector('.profile-btn');
    
    if (profileMenu && !profileMenu.contains(e.target) && !profileBtn.contains(e.target)) {
        profileMenu.classList.remove('show');
    }
});

// Kolam Generator Functions
function generateKolam() {
    try {
        if (!canvas || !ctx) {
            showToast('Canvas not initialized', 'error');
            return;
        }
        
        const width = parseInt(document.getElementById('gridWidth').value);
        const height = parseInt(document.getElementById('gridHeight').value);
        const symmetry = document.getElementById('symmetry').value;
        const complexity = parseInt(document.getElementById('complexity').value);
        
        // Validate inputs
        if (width < 3 || width > 20 || height < 3 || height > 20) {
            showToast('Grid size must be between 3 and 20', 'error');
            return;
        }
        
        clearCanvas();
        
        // Generate pattern based on parameters
        const colors = colorSchemes[currentColorScheme];
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Generate base pattern
        generateBasePattern(centerX, centerY, width, height, complexity, colors, symmetry);
        
        showToast('Kolam pattern generated successfully!', 'success');
        
        // Save to generated kolams
        const kolamData = {
            id: Date.now(),
            width, height, symmetry, complexity,
            colorScheme: currentColorScheme,
            timestamp: new Date().toISOString(),
            type: 'generated'
        };
        
        generatedKolams.push(kolamData);
        localStorage.setItem('generatedKolams', JSON.stringify(generatedKolams));
        
    } catch (error) {
        console.error('Error generating Kolam:', error);
        showToast('Error generating Kolam pattern', 'error');
    }
}

function generateBasePattern(centerX, centerY, width, height, complexity, colors, symmetry) {
    const gridSpacing = Math.min(canvas.width / (width + 2), canvas.height / (height + 2));
    
    // Draw grid points
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            const x = centerX + (i - width/2) * gridSpacing;
            const y = centerY + (j - height/2) * gridSpacing;
            
            drawKolamElement(x, y, complexity, colors, i + j);
        }
    }
    
    // Apply symmetry
    applySymmetry(symmetry, centerX, centerY, colors);
}

function drawKolamElement(x, y, complexity, colors, seed) {
    const colorIndex = seed % colors.length;
    const color = colors[colorIndex];
    
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    const size = 8 + (complexity * 2);
    
    // Different patterns based on complexity
    if (complexity <= 3) {
        // Simple dots
        ctx.beginPath();
        ctx.arc(x, y, size/2, 0, Math.PI * 2);
        ctx.fill();
    } else if (complexity <= 6) {
        // Squares rotated
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((seed * Math.PI) / 4);
        ctx.fillRect(-size/2, -size/2, size, size);
        ctx.restore();
    } else {
        // Complex petals
        drawPetal(x, y, size, color, seed);
    }
}

function drawPetal(x, y, size, color, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotation * Math.PI) / 6);
    
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    
    for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.ellipse(0, -size/3, size/4, size/2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.rotate(Math.PI / 3);
    }
    
    ctx.restore();
}

function applySymmetry(symmetry, centerX, centerY, colors) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    switch (symmetry) {
        case 'bilateral':
            // Mirror horizontally
            for (let y = 0; y < canvas.height; y++) {
                for (let x = centerX; x < canvas.width; x++) {
                    const mirrorX = centerX - (x - centerX);
                    if (mirrorX >= 0) {
                        copyPixel(imageData, x, y, mirrorX, y);
                    }
                }
            }
            break;
        case 'radial':
            // 4-fold radial symmetry
            drawRadialSymmetry(4, centerX, centerY);
            break;
        case 'radial8':
            // 8-fold radial symmetry  
            drawRadialSymmetry(8, centerX, centerY);
            break;
    }
    
    ctx.putImageData(imageData, 0, 0);
}

function drawRadialSymmetry(folds, centerX, centerY) {
    const angleStep = (Math.PI * 2) / folds;
    
    for (let i = 1; i < folds; i++) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angleStep * i);
        ctx.translate(-centerX, -centerY);
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(canvas, 0, 0);
        ctx.restore();
    }
}

function copyPixel(imageData, srcX, srcY, destX, destY) {
    const srcIndex = (srcY * imageData.width + srcX) * 4;
    const destIndex = (destY * imageData.width + destX) * 4;
    
    imageData.data[destIndex] = imageData.data[srcIndex];
    imageData.data[destIndex + 1] = imageData.data[srcIndex + 1];
    imageData.data[destIndex + 2] = imageData.data[srcIndex + 2];
    imageData.data[destIndex + 3] = imageData.data[srcIndex + 3];
}

function clearCanvas() {
    try {
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    } catch (error) {
        console.error('Error clearing canvas:', error);
    }
}

function selectColorScheme(scheme) {
    try {
        currentColorScheme = scheme;
        
        // Update UI
        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.classList.remove('active');
            if (option.dataset.scheme === scheme) {
                option.classList.add('active');
            }
        });
        
        showToast(`Color scheme changed to ${scheme}`, 'info');
    } catch (error) {
        console.error('Error selecting color scheme:', error);
    }
}

function updateComplexityValue() {
    try {
        const slider = document.getElementById('complexity');
        const valueDisplay = document.getElementById('complexityValue');
        
        if (slider && valueDisplay) {
            valueDisplay.textContent = slider.value;
        }
    } catch (error) {
        console.error('Error updating complexity value:', error);
    }
}

function updateGridSize() {
    try {
        const width = parseInt(document.getElementById('gridWidth').value);
        const height = parseInt(document.getElementById('gridHeight').value);
        
        gridSize = { width, height };
    } catch (error) {
        console.error('Error updating grid size:', error);
    }
}

// Canvas tools
function downloadKolam() {
    try {
        if (!canvas) {
            showToast('No pattern to download', 'error');
            return;
        }
        
        const link = document.createElement('a');
        link.download = `kolam-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
        
        showToast('Kolam downloaded successfully!', 'success');
    } catch (error) {
        console.error('Error downloading Kolam:', error);
        showToast('Error downloading Kolam', 'error');
    }
}

function shareKolam() {
    showToast('Share functionality coming soon!', 'info');
}

function saveToGallery() {
    try {
        if (!canvas) {
            showToast('No pattern to save', 'error');
            return;
        }
        
        const kolamData = {
            id: Date.now(),
            image: canvas.toDataURL(),
            timestamp: new Date().toISOString(),
            type: 'saved'
        };
        
        let savedKolams = JSON.parse(localStorage.getItem('savedKolams') || '[]');
        savedKolams.push(kolamData);
        localStorage.setItem('savedKolams', JSON.stringify(savedKolams));
        
        showToast('Kolam saved to gallery!', 'success');
    } catch (error) {
        console.error('Error saving to gallery:', error);
        showToast('Error saving to gallery', 'error');
    }
}

// Image Analyzer Functions
function handleFileUpload(event) {
    try {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            showToast('Please select a valid image file', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            displayUploadedImage(e.target.result);
            document.getElementById('analyzeBtn').disabled = false;
        };
        reader.readAsDataURL(file);
        
        showToast('Image uploaded successfully', 'success');
    } catch (error) {
        console.error('Error handling file upload:', error);
        showToast('Error uploading image', 'error');
    }
}

function displayUploadedImage(imageSrc) {
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.innerHTML = `
        <img src="${imageSrc}" style="max-width: 100%; max-height: 200px; border-radius: 10px;">
        <p style="margin-top: 10px; color: rgba(255,255,255,0.7);">Image ready for analysis</p>
    `;
}

function analyzeImage() {
    try {
        showToast('Analyzing image...', 'info');
        
        // Simulate analysis process
        setTimeout(() => {
            const results = {
                gridSize: { width: 6, height: 6 },
                symmetry: 'radial',
                colors: ['#ff6b6b', '#ffd93d', '#54a0ff'],
                complexity: 7,
                confidence: 0.85
            };
            
            displayAnalysisResults(results);
            showToast('Image analysis completed!', 'success');
        }, 2000);
    } catch (error) {
        console.error('Error analyzing image:', error);
        showToast('Error analyzing image', 'error');
    }
}

function displayAnalysisResults(results) {
    const resultsContent = document.getElementById('resultsContent');
    resultsContent.innerHTML = `
        <div class="analysis-results">
            <div class="result-item">
                <strong>Grid Size:</strong> ${results.gridSize.width} × ${results.gridSize.height}
            </div>
            <div class="result-item">
                <strong>Symmetry:</strong> ${results.symmetry}
            </div>
            <div class="result-item">
                <strong>Complexity:</strong> ${results.complexity}/10
            </div>
            <div class="result-item">
                <strong>Confidence:</strong> ${(results.confidence * 100).toFixed(1)}%
            </div>
            <div class="result-item">
                <strong>Colors Detected:</strong>
                <div class="color-swatches">
                    ${results.colors.map(color => `<span style="background: ${color}; width: 20px; height: 20px; border-radius: 50%; display: inline-block; margin-right: 5px;"></span>`).join('')}
                </div>
            </div>
        </div>
    `;
}

function exportResults() {
    showToast('Export functionality coming soon!', 'info');
}

function recreatePattern() {
    showToast('Recreating pattern in generator...', 'info');
    switchSection('generator');
}

// Gallery Functions
function loadGallery() {
    try {
        const savedKolams = JSON.parse(localStorage.getItem('savedKolams') || '[]');
        const generatedKolams = JSON.parse(localStorage.getItem('generatedKolams') || '[]');
        
        const allKolams = [...savedKolams, ...generatedKolams];
        displayGalleryItems(allKolams);
    } catch (error) {
        console.error('Error loading gallery:', error);
        showToast('Error loading gallery', 'error');
    }
}

function filterGallery(filter) {
    try {
        const savedKolams = JSON.parse(localStorage.getItem('savedKolams') || '[]');
        const generatedKolams = JSON.parse(localStorage.getItem('generatedKolams') || '[]');
        
        let filteredKolams = [];
        
        switch (filter) {
            case 'all':
                filteredKolams = [...savedKolams, ...generatedKolams];
                break;
            case 'generated':
                filteredKolams = generatedKolams;
                break;
            case 'analyzed':
                // Filter analyzed patterns (placeholder)
                filteredKolams = [];
                break;
            case 'favorites':
                // Filter favorites (placeholder)
                filteredKolams = [];
                break;
        }
        
        displayGalleryItems(filteredKolams);
    } catch (error) {
        console.error('Error filtering gallery:', error);
    }
}

function displayGalleryItems(kolams) {
    const galleryGrid = document.getElementById('galleryGrid');
    
    if (kolams.length === 0) {
        galleryGrid.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.5); grid-column: 1/-1;">No patterns found</p>';
        return;
    }
    
    galleryGrid.innerHTML = kolams.map(kolam => `
        <div class="gallery-item">
            ${kolam.image ? `<img src="${kolam.image}" alt="Kolam pattern">` : '<div class="placeholder-image">Generated Pattern</div>'}
            <div class="item-info">
                <p>Created: ${new Date(kolam.timestamp).toLocaleDateString()}</p>
                <p>Type: ${kolam.type}</p>
            </div>
        </div>
    `).join('');
}

function logout() {
    showToast('Logging out...', 'info');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);
}

// Monument initialization with proper error handling
function initializeMonuments() {
    try {
        const monuments = document.querySelectorAll('.monument-image');
        
        if (monuments.length === 0) {
            console.log('No monuments found - decorative elements not available');
            return;
        }
        
        monuments.forEach((monument, index) => {
            monument.style.animationDelay = `${index * 0.5}s`;
            monument.style.opacity = '0.7';
            monument.style.visibility = 'visible';
        });
        
        console.log('Monument decorations initialized successfully');
    } catch (error) {
        console.error('Error initializing monuments:', error);
    }
}

// Toast notification system
function showToast(message, type = 'info') {
    try {
        const toast = document.getElementById('toast');
        if (!toast) {
            console.error('Toast element not found');
            return;
        }
        
        const toastIcon = toast.querySelector('.toast-icon');
        const toastMessage = toast.querySelector('.toast-message');
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        
        toastIcon.className = `toast-icon ${icons[type]}`;
        toastIcon.style.color = colors[type];
        toastMessage.textContent = message;
        
        toast.style.display = 'flex';
        toast.style.borderColor = colors[type];
        
        setTimeout(() => {
            hideToast();
        }, 4000);
    } catch (error) {
        console.error('Error showing toast:', error);
        alert(message);
    }
}

function hideToast() {
    try {
        const toast = document.getElementById('toast');
        if (!toast) return;
        
        toast.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            toast.style.display = 'none';
            toast.style.animation = '';
        }, 300);
    } catch (error) {
        console.error('Error hiding toast:', error);
    }
}

// Add CSS animation for slideOut
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .analysis-results {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    
    .result-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .color-swatches {
        display: flex;
        gap: 5px;
    }
    
    .gallery-item {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        padding: 15px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 0.3s ease;
    }
    
    .gallery-item:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-5px);
    }
    
    .gallery-item img,
    .placeholder-image {
        width: 100%;
        height: 150px;
        object-fit: cover;
        border-radius: 10px;
        margin-bottom: 10px;
        background: rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(255, 255, 255, 0.6);
    }
    
    .item-info {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.9rem;
    }
`;
document.head.appendChild(style);