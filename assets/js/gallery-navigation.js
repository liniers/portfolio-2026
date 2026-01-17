// NAVEGACIÓN DE GALERÍA EN QUICK-VIEW
// Este archivo añade funcionalidad de navegación entre proyectos relacionados

// Variables globales para la navegación
let currentProjectIndex = 0;
let relatedProjects = [];
let currentProject = null;

// Función para obtener proyectos relacionados (mismo cliente y categoría)
function getRelatedProjects(trabajo) {
    if (!trabajo) return [];
    
    // Filtrar proyectos con el mismo cliente y categoría
    const related = trabajosData.filter(t => 
        //t.cliente === trabajo.cliente && 
        t.categoria === trabajo.categoria
    );
    
    console.log(`Proyectos relacionados encontrados: ${related.length} para ${trabajo.cliente} - ${trabajo.categoria}`);
    
    return related;
}

// Función para actualizar el contador de progreso
function updateProjectCounter(currentIndex, totalProjects, currentProject) {
    const counter = document.querySelector('.project-counter');
    if (counter && totalProjects > 0 && currentProject) {
        counter.textContent = `${currentProject.categoria}. ${currentIndex + 1}/${totalProjects}`;
    }
}

// Función para actualizar los botones de navegación
function updateNavigationButtons(currentIndex, totalProjects) {
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (prevBtn) {
        prevBtn.disabled = currentIndex === 0;
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentIndex === totalProjects - 1;
    }
}

// Función para navegar entre proyectos
function navigateToProject(direction) {
    if (relatedProjects.length === 0) return;
    
    // Calcular nuevo índice
    if (direction === 'next') {
        currentProjectIndex = Math.min(currentProjectIndex + 1, relatedProjects.length - 1);
    } else if (direction === 'prev') {
        currentProjectIndex = Math.max(currentProjectIndex - 1, 0);
    }
    
    // Obtener el nuevo proyecto
    const newProject = relatedProjects[currentProjectIndex];
    
    // Actualizar el contenido del quick-view
    updateQuickViewWithProject(newProject);
    
    // Actualizar contador y botones
    updateProjectCounter(currentProjectIndex, relatedProjects.length, newProject);
    updateNavigationButtons(currentProjectIndex, relatedProjects.length);
}

// Función para actualizar el quick-view con un nuevo proyecto
function updateQuickViewWithProject(trabajo) {
    const quickView = document.querySelector('.quick-view');
    if (!quickView) return;
    
    // Marcar el thumb del nuevo proyecto como visitado
    const newThumb = document.querySelector(`[data-work-id="${trabajo.id}"]`);
    if (newThumb && window.visitedThumbs && !window.visitedThumbs.includes(newThumb)) {
        window.visitedThumbs.push(newThumb);
        // Aplicar borderRadius al thumb visitado
        gsap.to(newThumb, {
            borderRadius: '4rem',
            duration: 0.4,
            ease: 'power2.out'
        });
    }
    
    const mediaContainer = quickView.querySelector('.media');
    const workTitle = quickView.querySelector('.work-title');
    const workDetails = quickView.querySelector('.work-details');
    const workInfoEl = quickView.querySelector('.work-info');
    
    // Limpiar contenido anterior
    mediaContainer.innerHTML = '';
    mediaContainer.style.backgroundImage = '';
    
    // Detectar si es vídeo o imagen
    const isVideo = /\.(mp4|webm|ogg)$/i.test(trabajo.thumbnail);
    
    if (isVideo) {
        const video = document.createElement('video');
        video.src = `assets/img/${trabajo.thumbnail}`;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.style.width = '100%';
        video.style.height = 'auto';
        video.style.display = 'block';
        
        // Crear contenedor de controles de video
        const videoControls = document.createElement('div');
        videoControls.className = 'video-controls';
        
        // Botón Play/Pause
        const playPauseBtn = document.createElement('button');
        playPauseBtn.className = 'video-control-btn play-pause-btn';
        playPauseBtn.setAttribute('data-state', 'playing');
        playPauseBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
        </svg>`;
        
        playPauseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (video.paused) {
                video.play();
                playPauseBtn.setAttribute('data-state', 'playing');
                playPauseBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>`;
            } else {
                video.pause();
                playPauseBtn.setAttribute('data-state', 'paused');
                playPauseBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z"/>
                </svg>`;
            }
        });
        
        // Botón Mute/Unmute
        const muteBtn = document.createElement('button');
        muteBtn.className = 'video-control-btn mute-btn';
        muteBtn.setAttribute('data-state', 'muted');
        muteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
            <line x1="23" y1="9" x2="17" y2="15" stroke="white" stroke-width="2"/>
            <line x1="17" y1="9" x2="23" y2="15" stroke="white" stroke-width="2"/>
        </svg>`;
        
        muteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            video.muted = !video.muted;
            if (video.muted) {
                muteBtn.setAttribute('data-state', 'muted');
                muteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                    <line x1="23" y1="9" x2="17" y2="15" stroke="white" stroke-width="2"/>
                    <line x1="17" y1="9" x2="23" y2="15" stroke="white" stroke-width="2"/>
                </svg>`;
            } else {
                muteBtn.setAttribute('data-state', 'unmuted');
                muteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM16.5 12c0-2.89-1.62-5.39-4-6.65v13.29c2.38-1.25 4-3.75 4-6.64z"/>
                </svg>`;
            }
        });
        
        videoControls.appendChild(playPauseBtn);
        videoControls.appendChild(muteBtn);
        
        mediaContainer.style.position = 'relative';
        mediaContainer.appendChild(video);
        mediaContainer.appendChild(videoControls);
    } else {
        // Es una imagen
        const img = document.createElement('img');
        img.src = `assets/img/${trabajo.thumbnail}`;
        img.style.width = '100%';
        img.style.height = 'auto';
        img.style.display = 'block';
        mediaContainer.appendChild(img);
    }
    
    // Actualizar información del trabajo
    workTitle.textContent = trabajo.titulo;
    if (workDetails) {
        workDetails.textContent = `${trabajo.cliente} - ${trabajo.fecha}`;
    } else if (workInfoEl) {
        const newDetails = document.createElement('p');
        newDetails.className = 'work-details';
        newDetails.textContent = `${trabajo.cliente} - ${trabajo.fecha}`;
        workInfoEl.appendChild(newDetails);
    }
    
    // Actualizar proyecto actual
    currentProject = trabajo;
    
    // Recrear los controles de navegación
    createNavigationControls();
}

// Función para crear los controles de navegación
function createNavigationControls() {
    const quickView = document.querySelector('.quick-view');
    if (!quickView) {
        console.warn('❌ No se encontró .quick-view');
        return;
    }
    
    const mediaContainer = quickView.querySelector('.media');
    if (!mediaContainer) {
        console.warn('❌ No se encontró .media dentro de .quick-view');
        return;
    }
    
    console.log('✅ Creando controles de navegación...');
    
    // Eliminar controles existentes si los hay
    const existingNav = mediaContainer.querySelector('.nav-controls');
    if (existingNav) {
        existingNav.remove();
        console.log('🔄 Controles existentes eliminados');
    }
    
    // Crear nuevo contenedor de navegación
    const navControls = document.createElement('div');
    navControls.className = 'nav-controls';
    
    // Botón anterior
    const prevBtn = document.createElement('button');
    prevBtn.className = 'nav-control-btn prev-btn';
    prevBtn.innerHTML = `<span class="material-symbols-outlined">chevron_left</span>`;
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateToProject('prev');
    });
    
    // Contador de progreso
    const counter = document.createElement('div');
    counter.className = 'project-counter';
    counter.textContent = '1/1';
    
    // Botón siguiente
    const nextBtn = document.createElement('button');
    nextBtn.className = 'nav-control-btn next-btn';
    nextBtn.innerHTML = `<span class="material-symbols-outlined">chevron_right</span>`;
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateToProject('next');
    });
    
    navControls.appendChild(prevBtn);
    navControls.appendChild(counter);
    navControls.appendChild(nextBtn);
    
    // Asegurar posición relativa del contenedor
    mediaContainer.style.position = 'relative';
    mediaContainer.appendChild(navControls);
    
    console.log('✅ Controles de navegación creados y añadidos al DOM');
    
    // Actualizar estado de los botones
    const currentProject = relatedProjects[currentProjectIndex];
    updateProjectCounter(currentProjectIndex, relatedProjects.length, currentProject);
    updateNavigationButtons(currentProjectIndex, relatedProjects.length);
}

// Función para inicializar la navegación cuando se abre un proyecto
function initGalleryNavigation(trabajo) {
    // Obtener proyectos relacionados
    relatedProjects = getRelatedProjects(trabajo);
    currentProject = trabajo;
    
    // Encontrar el índice del proyecto actual en la lista de relacionados
    currentProjectIndex = relatedProjects.findIndex(t => t.id === trabajo.id);
    if (currentProjectIndex === -1) {
        currentProjectIndex = 0;
    }
    
    // Esperar a que el DOM esté listo antes de crear los controles
    // Usar setTimeout para asegurar que el mediaContainer ya tiene contenido
    setTimeout(() => {
        createNavigationControls();
    }, 500);
    
    console.log(`Navegación inicializada: proyecto ${currentProjectIndex + 1} de ${relatedProjects.length}`);
}
