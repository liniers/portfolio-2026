/* ÍNDICE DE FUNCIONALIDADES

1.- Maquetar thumbs - Lineas 34 a 263
2.- GSAP + Lenis Setup - Líneas 157 a 171
3.- Toggle botones vista grid / vista global - Líneas 187 a 348
4.- Animación texto tubo 3D - Líneas 354 a 398
5.- Toggle de imágenes - Líneas 405 a 459
6.- Toggle vista global - agrupado por categorías - Líneas 465 a 689
7.- Hover Effect - Mostrar imagen - Líneas 694 a 715
8.- Motion Thumbs - Parallax con Stagger - Líneas 721 a 746
9.- Theme Toggle con Morph SVG - Revisar - Líneas 751 a 775
10.- Quick View Function - Líneas 780 a 1070
11.- Scrim y Popup - Quick-view centrado - Líneas 1075 a 1130

*/


// Variables globales

let trabajosData = []; // Datos de trabajos cargados desde JSON
let posicionesOriginales = []; // Guardar posiciones originales de los thumbs

// Paleta de colores para los thumbs
const colorPalette = [
    '#C02822', // Rojo
    '#728D3B', // Verde oliva
    '#1A4575', // Azul oscuro
    '#D2605F', // Coral
    '#F4B33F', // Amarillo dorado
    '#2C5F6F', // Azul petróleo
    '#A3333D', // Rojo vino
    '#4A7C59', // Verde bosque
    '#E8927C', // Salmón
    '#5B8C85'  // Verde azulado
];


// 1.- Maquetar thumbs


function maquetar_thumbs(data){
    trabajosData = data;
    
    let cuadriculaTrabajos = document.querySelector("#portfolio-items .thumbs-grid");

    data.forEach((trabajo, index) =>{
        let miniaturaCuadrada = document.createElement("article");
        miniaturaCuadrada.classList.add(`thumb-${index + 1}`);
        miniaturaCuadrada.classList.add('hide-image');
        miniaturaCuadrada.dataset.workId = trabajo.id;
        
        // Asignar color de fondo automáticamente desde la paleta
        const backgroundColor = colorPalette[index % colorPalette.length];
        miniaturaCuadrada.style.backgroundColor = backgroundColor;
        
        // Detectar si el thumbnail es un vídeo
        const isVideo = /\.(mp4|webm|ogg)$/i.test(trabajo.thumbnail);
        
        if (isVideo) {
            const video = document.createElement('video');
            video.src = `assets/img/${trabajo.thumbnail}`;
            video.autoplay = true;
            video.loop = true;
            video.muted = true;
            video.playsInline = true;
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'cover';
            video.style.position = 'absolute';
            video.style.top = '0';
            video.style.left = '0';
            miniaturaCuadrada.appendChild(video);
            miniaturaCuadrada.style.position = 'relative';
            miniaturaCuadrada.style.overflow = 'hidden';
        } else {
            miniaturaCuadrada.style.backgroundImage = `url('assets/img/${trabajo.thumbnail}')`;
            miniaturaCuadrada.style.backgroundSize = 'cover';
            miniaturaCuadrada.style.backgroundPosition = 'center';
        }
        
        // PATRÓN ALTERNADO: Configurable mediante CSS custom properties
        
        // Leer configuración desde CSS custom properties
        const rootStyles = getComputedStyle(document.documentElement);
        const itemsPerRow1 = parseInt(rootStyles.getPropertyValue('--grid-items-per-row-1')) || 6;
        const itemsPerRow2 = parseInt(rootStyles.getPropertyValue('--grid-items-per-row-2')) || 5;
        const spacingH = parseInt(rootStyles.getPropertyValue('--grid-spacing-horizontal')) || 12;
        const spacingV = parseInt(rootStyles.getPropertyValue('--grid-spacing-vertical')) || 8;
        const thumbSpan = parseInt(rootStyles.getPropertyValue('--grid-thumb-span')) || 2;
        const startRow = parseInt(rootStyles.getPropertyValue('--grid-start-row')) || 0;
        const startCol = parseInt(rootStyles.getPropertyValue('--grid-start-col')) || 6;
        
        // Calcular en qué fila está este elemento
        let currentRow = 0;
        let elementsInCurrentRow = 0;
        let tempIndex = 0;
        
        // Contar elementos hasta llegar al índice actual
        while (tempIndex < index) {
            const itemsInThisRow = currentRow % 2 === 0 ? itemsPerRow1 : itemsPerRow2; // Alterna según config
            elementsInCurrentRow++;
            tempIndex++;
            
            if (elementsInCurrentRow >= itemsInThisRow) {
                currentRow++;
                elementsInCurrentRow = 0;
            }
        }
        
        // Calcular la posición en la fila actual
        const colIndex = elementsInCurrentRow;
        
        // Calcular posición en el grid
        const gridRow = startRow + (currentRow * spacingV);
        
        // Calcular offset de columna para filas impares (más centrado)
        const itemsInCurrentRow = currentRow % 2 === 0 ? itemsPerRow1 : itemsPerRow2;
        const colOffset = currentRow % 2 === 0 ? 0 : spacingH / 2;
        const gridColumn = startCol + colOffset + (colIndex * spacingH);
        
        
        // Guardar posiciones originales
        posicionesOriginales.push({
            gridRow: gridRow,
            gridColumn: gridColumn
        });
        
        // Asignar posición en el grid - Usa el thumbSpan configurado
        const gridRowValue = `${gridRow} / span ${thumbSpan}`;
        const gridColValue = `${gridColumn} / span ${thumbSpan}`;
        
        miniaturaCuadrada.style.setProperty('grid-row', gridRowValue);
        miniaturaCuadrada.style.setProperty('grid-column', gridColValue);
        miniaturaCuadrada.style.setProperty('aspect-ratio', '1 / 1');
        
        
        cuadriculaTrabajos.appendChild(miniaturaCuadrada); // Añadir el miniaturaCuadrada al cuadriculaTrabajos
        
    });

    
    // Inicializar interacciones y animaciones con delay para asegurar renderizado


    setTimeout(() => {
        setupThumbsHover(); // Inicializar hover de todas las thumbs con GSAP
        thumbsMotion(); // Activar efecto parallax con stagger
        setupQuickView(); // Inicializar quick view
        
        // Hacer visible el body
        gsap.to('body', { opacity: 1, duration: 1, ease: 'power2.inOut'});
    }, 100);
}


// 2.- GSAP + LENIS SETUP


const lenis = new Lenis({
    //infinite: true, 
    syncTouch: true,
});

function onRaf(time) {
    lenis.raf(time);
    requestAnimationFrame(onRaf);
}
requestAnimationFrame(onRaf);

// Synchronize Lenis scrolling with GSAP's ScrollTrigger plugin
lenis.on('scroll', ScrollTrigger.update);

// Add Lenis's requestAnimationFrame (raf) method to GSAP's ticker
// This ensures Lenis's smooth scroll animation updates on each GSAP tick
gsap.ticker.add((time) => {
  lenis.raf(time * 1000); // Convert time from seconds to milliseconds
});

// Disable lag smoothing in GSAP to prevent any delay in scroll animations
gsap.ticker.lagSmoothing(0);





// 3.- TOGGLE BOTONES VISTA GRID / VISTA GLOBAL



const headerLeftButtons = document.querySelectorAll('.toggle-grid button');

if (headerLeftButtons.length === 2) {
    const [vistaGridBtn, vistaGlobalBtnHeader] = headerLeftButtons;
    const headerLeft = document.querySelector('.toggle-grid');
    
    // Crear elemento de fondo deslizante
    const slidingBackground = document.createElement('div');
    slidingBackground.className = 'button-background-slider';
    slidingBackground.style.cssText = `
        position: absolute;
        background-color: var(--color-text);
        border-radius: 8px;
        pointer-events: none;
        z-index: 0;
        transition: none;
    `;
    
    // Insertar el fondo en el miniaturaCuadrada
    headerLeft.insertBefore(slidingBackground, headerLeft.firstChild);
    
    // Asegurar que los botones estén por encima del fondo y sin su propio fondo
    vistaGridBtn.style.position = 'relative';
    vistaGridBtn.style.zIndex = '1';
    vistaGridBtn.style.backgroundColor = 'transparent';
    vistaGlobalBtnHeader.style.position = 'relative';
    vistaGlobalBtnHeader.style.zIndex = '1';
    vistaGlobalBtnHeader.style.backgroundColor = 'transparent';
    
    // Inicializar posición y tamaño del fondo según el botón activo
    function initSlidingBackground() {
        const activeButton = vistaGridBtn.classList.contains('button-active') ? vistaGridBtn : vistaGlobalBtnHeader;
        
        slidingBackground.style.width = `${activeButton.offsetWidth}px`;
        slidingBackground.style.height = `${activeButton.offsetHeight}px`;
        slidingBackground.style.left = `${activeButton.offsetLeft}px`; //
        slidingBackground.style.top = `${activeButton.offsetTop}px`;
    }
    
    // Inicializar después de un pequeño delay para asegurar que el DOM esté listo
    setTimeout(initSlidingBackground, 50);
    
    // Función para mover el fondo al botón activo
    window.toggleActiveButton = function(buttonToActivate, buttonToDeactivate) {
        buttonToDeactivate.classList.remove('button-active');
        buttonToActivate.classList.add('button-active');
        
        const currentLeft = parseFloat(slidingBackground.style.left);
        const currentWidth = parseFloat(slidingBackground.style.width);
        const targetLeft = buttonToActivate.offsetLeft;
        const targetWidth = buttonToActivate.offsetWidth;
        
        // Calcular si vamos a la derecha o izquierda
        const goingRight = targetLeft > currentLeft;
        
        // Calcular el ancho del stretch: desde el inicio del botón actual hasta el final del botón destino
        const stretchWidth = goingRight 
            ? (targetLeft + targetWidth) - currentLeft  // Desde left actual hasta right del destino
            : (currentLeft + currentWidth) - targetLeft; // Desde left del destino hasta right actual
        
        // Crear timeline para el efecto de stretch
        const tl = gsap.timeline();
        
        if (goingRight) {
            // Moverse a la derecha: expandir desde la izquierda, luego contraer desde la izquierda
            tl.to(slidingBackground, {
                width: stretchWidth,
                duration: 0.5,
                ease: "back.in(1.7)"
            })
            .to(slidingBackground, {
                left: targetLeft,
                width: targetWidth,
                duration: 0.25,
                ease: "back.out(1.7)"
            }, '-=0.1');
        } else {
            // Moverse a la izquierda: mover a la izquierda y expandir, luego contraer desde la derecha
            tl.to(slidingBackground, {
                left: targetLeft,
                width: stretchWidth,
                duration: 0.5,
                ease: "back.in(1.7)"
            })
            .to(slidingBackground, {
                width: targetWidth,
                duration: 0.25,
                ease: "back.out(1.7)"
            }, '-=0.1');
        }
    }
    
    // Event listener para el botón de vista grid (el primero)
    vistaGridBtn.addEventListener('click', () => {
        if (!vistaGridBtn.classList.contains('button-active')) {
            toggleActiveButton(vistaGridBtn, vistaGlobalBtnHeader);
            
            // Eliminar títulos de categoría si existen
            if (window.categoryTitles && window.categoryTitles.length > 0) {
                window.categoryTitles.forEach(title => {
                    gsap.to(title, {
                        opacity: 0,
                        duration: 0.3,
                        ease: 'power2.in',
                        onComplete: () => {
                            title.remove();
                        }
                    });
                });
                window.categoryTitles = [];
            }
            
            // Si estaba en vista global, volver a vista aleatoria
            if (window.vistaGlobalActiva) {
                const thumbs = document.querySelectorAll('[class*="thumb-"]');
                const state = Flip.getState(thumbs);
                
                window.vistaGlobalActiva = false;
                
                // Mostrar container-scroll
                const containerScroll = document.querySelector('.container-scroll');
                if (containerScroll) {
                    gsap.to(containerScroll, {
                        opacity: 1,
                        duration: 0.6,
                        display: 'block',
                        ease: 'power2.inOut'
                    });
                }
                
                // Leer configuración actual de CSS para restaurar correctamente
                const rootStyles = getComputedStyle(document.documentElement);
                const thumbSpan = parseInt(rootStyles.getPropertyValue('--grid-thumb-span')) || 2;
                
                thumbs.forEach((thumb) => {
                    const classList = Array.from(thumb.classList);
                    const thumbClass = classList.find(c => c.startsWith('thumb-'));
                    const index = parseInt(thumbClass.replace('thumb-', '')) - 1;
                    
                    thumb.style.position = '';
                    thumb.style.left = '';
                    thumb.style.top = '';
                    thumb.style.width = '';
                    thumb.style.height = '';
                    
                    if (posicionesOriginales[index]) {
                        thumb.style.gridRow = `${posicionesOriginales[index].gridRow} / span ${thumbSpan}`;
                        thumb.style.gridColumn = `${posicionesOriginales[index].gridColumn} / span ${thumbSpan}`;
                        thumb.style.aspectRatio = '1 / 1';
                    }
                });
                
                Flip.from(state, {
                    duration: 1.2,
                    ease: "power2.inOut",
                    stagger: 0.02,
                    scale: true,
                    simple: true,
                    onComplete: () => {
                        thumbs.forEach((thumb) => {
                            gsap.set(thumb, { clearProps: "transform" });
                        });
                        thumbsMotion();
                    }
                });
            }
        }
    });
    
    // Guardar referencia global para uso en otras funciones
    window.headerLeftButtons = { vistaGridBtn, vistaGlobalBtnHeader };
}

// 4.- ANIMACIÓN TEXTO TUBO 3D

const width = window.innerWidth;
const depth = -width / 30; // Profundidad del rodillo
const transformOrigin = `50% 50% ${depth}px`;

// Make container visible y fijo en centro
const containerScroll = document.querySelector(".container-scroll");
if (containerScroll) {
    // Posicionar fijo en centro centro
    containerScroll.style.position = 'fixed';
    containerScroll.style.top = '50%';
    containerScroll.style.left = '50%';
    containerScroll.style.transform = 'translate(-50%, -50%)';
    containerScroll.style.zIndex = '0';
    containerScroll.style.pointerEvents = 'none';
    
    gsap.set(containerScroll, { visibility: "visible" });

    // Grab all lines
    const linesScroll = document.querySelectorAll(".container-scroll .line");

    // Split characters for all lines
    const splitLinesScroll = Array.from(linesScroll).map(line => 
      new SplitText(line, { type: "chars", charsClass: "char" })
    );

    // 3D setup
    gsap.set(linesScroll, { perspective: 700, transformStyle: "preserve-3d" });

    // Animación 3D suave y continua en scroll (sin pin)
    const tlScroll = gsap.timeline({
      scrollTrigger: {
        trigger: "#portfolio-items",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        markers: false
      }
    });

    // Animate each line in scroll
    splitLinesScroll.forEach((split, index) => { 
      tlScroll.fromTo( 
        split.chars,
        { rotationX: -90 },
        { rotationX: 90, stagger: 0.03, ease: "none", transformOrigin },
        index * 0.3 // stagger between lines
      );
    });
}


// 5.- TOGGLE DE IMÁGENES

const toggleBtn = document.querySelector('.header-right button:first-child');
let imagesVisible = false; // Empiezan ocultas

// SVGs para el toggle (lo podría animar en el futuro)
const svgHidden = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="10" viewBox="0 0 22 10" fill="none">
                    <path d="M1.58105 0C5.20131 3.62026 8.73857 4.30318 11.6689 3.80078C14.6662 3.28685 17.1484 1.50917 18.4961 0.0332031L19.9727 1.38086C19.7084 1.67028 19.4062 1.96756 19.0723 2.26758L21.2754 5.10059L20.4863 5.71484L19.6963 6.32812L17.4961 3.5C16.6334 4.08712 15.6486 4.63007 14.5645 5.05371L15.9756 8.22949L14.1475 9.04199L12.6377 5.64551C12.4299 5.69218 12.2197 5.73499 12.0068 5.77148C10.8447 5.97073 9.62203 6.00855 8.3623 5.83398L7.69238 8.85254L5.73926 8.41895L6.41113 5.39355C5.42616 5.08336 4.42708 4.6328 3.42383 4.01758L1.74805 7.03516L0.874023 6.54883L0 6.06348L1.7793 2.85938C1.24102 2.42955 0.702549 1.94962 0.166992 1.41406L1.58105 0Z" fill="var(--color-text)"/>
                </svg>`;

const svgVisible = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="13" viewBox="0 0 22 13" fill="none">
  <path d="M1.81111 2.76126C6.22784 -0.0642495 13.1007 -1.69941 19.3951 2.78861C21.5933 4.35643 21.6503 7.55629 19.4781 9.18119C17.4232 10.7182 14.7147 12.0633 11.6236 12.357C8.50637 12.653 5.07116 11.8707 1.62849 9.26712C-0.563416 7.60929 -0.581643 4.29219 1.81111 2.76126ZM6.95271 2.58158C5.46627 3.02071 4.08922 3.67818 2.88923 4.44583C1.74653 5.17686 1.67989 6.79838 2.83552 7.6724C4.01832 8.56684 5.18509 9.20663 6.32087 9.64408C5.78925 8.84967 5.47908 7.89439 5.47908 6.86673V6.12747C5.47918 4.74176 6.04201 3.4871 6.95271 2.58158ZM13.7418 2.34134C14.8047 3.25817 15.479 4.61364 15.4791 6.12747V6.86673C15.4791 7.87182 15.1799 8.80654 14.6695 9.59037C16.0101 9.0759 17.2298 8.36505 18.2799 7.57962C19.3574 6.77356 19.3396 5.20524 18.234 4.41654C16.7599 3.36553 15.2451 2.70179 13.7418 2.34134ZM10.4771 3.49564C8.82047 3.49564 7.47746 4.83907 7.47712 6.49564C7.47712 8.15249 8.82027 9.49564 10.4771 9.49564C12.1338 9.49545 13.4771 8.15238 13.4771 6.49564C13.4768 4.83918 12.1336 3.49583 10.4771 3.49564Z" fill="var(--color-text)"/>
</svg>`;

if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        const thumbs = document.querySelectorAll('[class*="thumb-"]');
        imagesVisible = !imagesVisible;
        
        // Leer configuración actual de CSS
        const rootStyles = getComputedStyle(document.documentElement);
        const thumbSpan = parseInt(rootStyles.getPropertyValue('--grid-thumb-span')) || 2;
        const largeSpan = parseInt(rootStyles.getPropertyValue('--grid-thumb-span-large')) || thumbSpan + 3;
        
        // Capturar estado inicial con Flip
        const state = Flip.getState(thumbs);
        
        thumbs.forEach((thumb, index) => {
            // Toggle de imagen
            thumb.classList.toggle('hide-image');
            
            // Obtener posición original del array
            if (posicionesOriginales[index]) {
                const gridRow = posicionesOriginales[index].gridRow;
                const gridColumn = posicionesOriginales[index].gridColumn;
                
                // Cambiar span según visibilidad de imágenes
                if (imagesVisible) {
                    // Imágenes visibles: span más grande
                    thumb.style.gridRow = `${gridRow} / span ${largeSpan}`;
                    thumb.style.gridColumn = `${gridColumn} / span ${largeSpan}`;
                } else {
                    // Imágenes ocultas: span normal
                    thumb.style.gridRow = `${gridRow} / span ${thumbSpan}`;
                    thumb.style.gridColumn = `${gridColumn} / span ${thumbSpan}`;
                }
            }
        });
        
        // Animar la transición con Flip - instantáneo
        Flip.from(state, {
            duration: 1,
            ease: "power4.out",
            stagger: 0.01,
            scale: true,
            simple: true,
        });
        
        // Cambiar SVG del botón
        toggleBtn.innerHTML = imagesVisible ? svgVisible : svgHidden;
    });
}


// 6.- TOGGLE VISTA GLOBAL - AGRUPADO POR CATEGORÍAS


const vistaGlobalBtn = document.getElementById('vistaGlobal');
window.vistaGlobalActiva = false;
window.categoryTitles = []; // Array para guardar los títulos de categoría

if (vistaGlobalBtn) {
    vistaGlobalBtn.addEventListener('click', () => {
        // Solo ejecutar si el botón no está activo
        if (window.headerLeftButtons && window.headerLeftButtons.vistaGlobalBtnHeader.classList.contains('button-active')) {
            return;
        }
        
        const thumbs = document.querySelectorAll('[class*="thumb-"]');
        const state = Flip.getState(thumbs);

        
        
        if (!window.vistaGlobalActiva) {
            // Activar vista global
            window.vistaGlobalActiva = true;
            
            // Activar botón vistaGlobal en el header
            if (window.headerLeftButtons && window.toggleActiveButton) {
                toggleActiveButton(window.headerLeftButtons.vistaGlobalBtnHeader, window.headerLeftButtons.vistaGridBtn);
            }
            
            // Ocultar container-scroll
            const containerScroll = document.querySelector('.container-scroll');
            if (containerScroll) {
                gsap.to(containerScroll, {
                    opacity: 0,
                    duration: 0.6,
                    display: 'none',
                    ease: 'power2.inOut'
                });
            }

            
            // Matar ScrollTriggers del parallax
            ScrollTrigger.getAll().forEach(st => {
                if (st.vars && st.vars.trigger === document.querySelector("#portfolio-items")) {
                    st.kill();
                }
            });
            
            // Obtener categorías únicas
            const categorias = [...new Set(trabajosData.map(t => t.categoria))];
            const numCategorias = categorias.length;
            
            // Leer configuración de vista global desde CSS
            const rootStyles = getComputedStyle(document.documentElement);
            const globalViewCols = parseInt(rootStyles.getPropertyValue('--global-view-cols')) || 2;
            const globalViewRows = rootStyles.getPropertyValue('--global-view-rows').trim() === 'auto' 
                ? Math.ceil(numCategorias / globalViewCols) 
                : parseInt(rootStyles.getPropertyValue('--global-view-rows')) || 2;
            
            // Calcular distribución de grupos en el viewport
            const cols = globalViewCols;
            const rows = globalViewRows;
            
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const margin = viewportWidth <= 480 ? 40 : 80; // Menos margen en móvil
            
            // Espacio disponible para cada grupo
            const groupWidth = (viewportWidth - margin * 2) / cols;
            const groupHeight = (viewportHeight - margin * 2) / rows;
            
            // Configuración de thumbs dentro de cada grupo
            const thumbsPerRow = viewportWidth <= 480 ? 3 : 6; // Menos thumbs por fila en móvil
            const thumbSpan = 1;
            const gapSpan = 1;
            const totalSpanPerRow = thumbsPerRow * (thumbSpan + gapSpan);
            
            // Tamaño de cada thumb basado en el espacio del grupo
            const thumbSize = Math.min(
                (groupWidth - (viewportWidth <= 480 ? 40 : 100)) / thumbsPerRow,
                viewportWidth <= 480 ? 50 : 60 // Tamaño máximo adaptado
            );
            
            categorias.forEach((categoria, catIndex) => {
                // Obtener thumbs de esta categoría
                const thumbsEnCategoria = trabajosData
                    .map((trabajo, index) => ({ trabajo, index }))
                    .filter(({ trabajo }) => trabajo.categoria === categoria);
                
                // Calcular posición del grupo en la cuadrícula de grupos
                const groupCol = catIndex % cols;
                const groupRow = Math.floor(catIndex / cols);
                
                // Posición base del grupo (centrado en su celda)
                const groupBaseX = margin + (groupCol * groupWidth) + (groupWidth / 2);
                const groupBaseY = margin + (groupRow * groupHeight) + (groupHeight / 2);
                
                // Calcular filas necesarias para esta categoría
                const numThumbsInCat = thumbsEnCategoria.length;
                const numRows = Math.ceil(numThumbsInCat / thumbsPerRow);
                
                // Dimensiones totales del bloque de thumbs
                const blockWidth = thumbsPerRow * thumbSize;
                const blockHeight = numRows * thumbSize;
                
                // Offset para centrar el bloque
                const offsetX = -blockWidth / 2;
                const offsetY = -blockHeight / 2;
                
                // Crear título de categoría
                const categoryTitle = document.createElement('div');
                categoryTitle.className = 'category-title';
                categoryTitle.textContent = categoria;
                categoryTitle.style.cssText = `
                    position: absolute;
                    left: ${groupBaseX + offsetX}px;
                    top: ${groupBaseY + offsetY - 30}px;
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--color-text);
                    opacity: 0;
                    pointer-events: none;
                    z-index: 100;
                `;
                document.body.appendChild(categoryTitle);
                window.categoryTitles.push(categoryTitle);
                
                // Animar entrada del título
                gsap.to(categoryTitle, {
                    opacity: 1,
                    duration: 1,
                    delay: 1,
                    ease: 'power2.out'
                });
                
                thumbsEnCategoria.forEach(({ index }, thumbIndexInCat) => {
                    const thumb = thumbs[index];
                    
                    // Calcular posición dentro del grupo
                    const colInGroup = thumbIndexInCat % thumbsPerRow;
                    const rowInGroup = Math.floor(thumbIndexInCat / thumbsPerRow);
                    
                    const thumbX = groupBaseX + offsetX + (colInGroup * thumbSize);
                    const thumbY = groupBaseY + offsetY + (rowInGroup * thumbSize);
                    
                    // Aplicar position absolute en lugar de fixed para permitir scroll
                    thumb.style.position = 'absolute';
                    thumb.style.left = `${thumbX}px`;
                    thumb.style.top = `${thumbY}px`;
                    thumb.style.width = `${thumbSize}px`;
                    thumb.style.height = `${thumbSize}px`;
                    thumb.style.gridRow = 'auto';
                    thumb.style.gridColumn = 'auto';
                    thumb.style.aspectRatio = '1 / 1';
                });
            });
            
            // Animar con Flip
            Flip.from(state, {
                duration: 1.2,
                ease: "power2.inOut",
                stagger: 0.02,
                absolute: true,
                scale: true
            });
            
        } else {
            // Desactivar vista global - volver a vista aleatoria
            window.vistaGlobalActiva = false;
            
            // Activar botón vistaGrid en el header
            if (window.headerLeftButtons && window.toggleActiveButton) {
                toggleActiveButton(window.headerLeftButtons.vistaGridBtn, window.headerLeftButtons.vistaGlobalBtnHeader);
            }
            // Eliminar títulos de categoría
            window.categoryTitles.forEach(title => {
                gsap.to(title, {
                    opacity: 0,
                    duration: 0.3,
                    ease: 'power2.in',
                    onComplete: () => {
                        title.remove();
                    }
                });
            });
            window.categoryTitles = [];
            
            // Mostrar container-scroll
            const containerScroll = document.querySelector('.container-scroll');
            if (containerScroll) {
                gsap.to(containerScroll, {
                    opacity: 1,
                    duration: 0.6,
                    display: 'block',
                    ease: 'power2.inOut'
                });
            }
            
            thumbs.forEach((thumb) => {
                // Obtener el índice correcto desde la clase del thumb
                const classList = Array.from(thumb.classList);
                const thumbClass = classList.find(c => c.startsWith('thumb-'));
                const index = parseInt(thumbClass.replace('thumb-', '')) - 1;
                
                // Quitar position fixed y restaurar grid
                thumb.style.position = '';
                thumb.style.left = '';
                thumb.style.top = '';
                thumb.style.width = '';
                thumb.style.height = '';
                
                // Leer configuración actual de CSS para restaurar correctamente
                const rootStyles = getComputedStyle(document.documentElement);
                const thumbSpan = parseInt(rootStyles.getPropertyValue('--grid-thumb-span')) || 2;
                
                // Restaurar posiciones originales con el span correcto
                if (posicionesOriginales[index]) {
                    thumb.style.gridRow = `${posicionesOriginales[index].gridRow} / span ${thumbSpan}`;
                    thumb.style.gridColumn = `${posicionesOriginales[index].gridColumn} / span ${thumbSpan}`;
                    thumb.style.aspectRatio = '1 / 1';
                }
            });
            
            // Animar con Flip
            Flip.from(state, {
                duration: 1.2,
                ease: "power2.inOut",
                stagger: 0.02,
                scale: true,
                simple: true,
                onComplete: () => {
                    thumbs.forEach((thumb) => {
                        gsap.set(thumb, { clearProps: "transform" });
                    });
                    // Reiniciar parallax
                    thumbsMotion();
                }
            });
        }
            
    });
}

// 7.- HOVER EFFECT - MOSTRAR IMAGEN

function setupThumbsHover() {
    const thumbs = document.querySelectorAll('[class*="thumb-"]');
    
    thumbs.forEach((thumb) => {
        let wasImageHidden = false;
        
        thumb.addEventListener('mouseenter', () => {
            // Mostrar imagen si está oculta
            wasImageHidden = thumb.classList.contains('hide-image');
            if (wasImageHidden) {
                thumb.classList.remove('hide-image');
            }
        });
        
        thumb.addEventListener('mouseleave', () => {
            // Ocultar imagen si estaba oculta
            if (wasImageHidden) {
                thumb.classList.add('hide-image');
            }
        });
    });
}



// 8.- MOTION THUMBS - PARALLAX CON STAGGER

function thumbsMotion() {
    const section = document.querySelector("#portfolio-items");
    const thumbs = document.querySelectorAll('[class*="thumb-"]'); 
    
    if (thumbs.length === 0) { 
        console.warn('No se encontraron elementos .thumb-*');
        return; 
    }
    
    thumbs.forEach((thumb, index) => {
        // Offset de 0.1 por cada thumb para crear stagger
        const staggerOffset = index * .1;
        
        gsap.to(thumb, {
            y: 500, 
            ease: "none",
            scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: staggerOffset, // Cada thumb tiene un scrub diferente
                markers: false,
            }
        });
    });
}


// 9.- THEME TOGGLE CON MORPH SVG - REVISAR

const themeToggleBtn = document.querySelector('.header-right button:last-child');

if (themeToggleBtn) {
    const svgPath = themeToggleBtn.querySelector('svg path');
    
    // Paths del SVG
    const moonPath = "M7 0C8.07363 0 9.09073 0.241865 10 0.673828C7.63509 1.79731 6 4.20763 6 7C6 9.79222 7.6353 12.2016 10 13.3252C9.09063 13.7573 8.07378 14 7 14C3.13401 14 0 10.866 0 7C0 3.13401 3.13401 0 7 0Z";
    const sunPath = "M7 0C10.866 0 14 3.13401 14 7C14 10.866 10.866 14 7 14C3.13401 14 0 10.866 0 7C0 3.13401 3.13401 0 7 0Z";
    
    let isLightMode = false;
    
    themeToggleBtn.addEventListener('click', () => {
        isLightMode = !isLightMode;
        
        // Morph del path con GSAP
        gsap.to(svgPath, {
            duration: 0,
            morphSVG: isLightMode ? sunPath : moonPath,
            ease: "elastic.out(1,0.3)",
        });
        
        // Toggle del tema en el body
        document.body.classList.toggle('light-mode');
    });
}


// 10 - QUICK VIEW FUNCTION

let activeThumb = null; // Variable para trackear el thumb activo
let visitedThumbs = []; // Array para trackear thumbs visitados

// Exponer visitedThumbs como variable global para gallery-navigation.js
window.visitedThumbs = visitedThumbs;

function setupQuickView() {
    const quickView = document.querySelector('.quick-view');
    const thumbs = document.querySelectorAll('[class*="thumb-"]');
    const workInfo = quickView?.querySelector('.work-info');
    const mediaContainer = quickView?.querySelector('.media');

    
    if (!quickView || thumbs.length === 0) {
        console.warn('Quick view o thumbs no encontrados');
        return;
    }
    
    thumbs.forEach(thumb => {
        thumb.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Si ya hay un thumb activo, desactivarlo
            if (activeThumb && activeThumb !== thumb) {
                // Mantener borderRadius si ha sido visitado
                const borderRadiusValue = visitedThumbs.includes(activeThumb) ? '4rem' : '0rem';
                
                gsap.to(activeThumb, {
                    scale: 1,
                    outline: 'var(--color-text) solid 0px',
                    borderRadius: borderRadiusValue,
                    duration: 0.4,
                    ease: 'power2.out'
                });
            }
            
            // Si se hace clic en el thumb activo, desactivar
            if (activeThumb === thumb) {
                cerrarDetalle();
                return;
            }
            
            // Activar nuevo thumb
            const wasActive = activeThumb !== null;
            activeThumb = thumb;
            
            // Marcar como visitado si no lo está
            if (!visitedThumbs.includes(thumb)) {
                visitedThumbs.push(thumb);
            }
            
            // Obtener datos del trabajo
            const workId = thumb.dataset.workId;
            const trabajo = trabajosData.find(t => t.id == workId); // Usar == para comparar sin tipo estricto
            
            if (!trabajo) {
                console.warn('Trabajo no encontrado:', workId);
                console.log('trabajosData disponibles:', trabajosData.map(t => ({id: t.id, title: t.title})));
                return;
            }
            
            console.log('Trabajo seleccionado:', trabajo);
            
            // Inicializar navegación de galería
            initGalleryNavigation(trabajo);
            
            // Animar outline del thumb
            gsap.to(thumb, {
                scale: 1,
                //outline: 'var(--color-text) solid 3px',
                borderRadius: '4rem',
                duration: 0.3,
                ease: 'power2.out'
            });
            
            // Función para actualizar el contenido
            const updateQuickViewContent = (callback) => {
                const mediaContainer = quickView.querySelector('.media');
                const workTitle = quickView.querySelector('.work-title');
                const workDetails = quickView.querySelector('.work-details');
                
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
                    
                    // Crear contenedor de controles
                    const videoControls = document.createElement('div');
                    videoControls.className = 'video-controls';
                    
                    // Botón Play/Pause
                    const playPauseBtn = document.createElement('button');
                    playPauseBtn.className = 'video-control-btn play-pause-btn';
                    playPauseBtn.setAttribute('data-state', 'playing');
                    playPauseBtn.innerHTML = '<span class="material-symbols-outlined">pause</span>'; // Placeholder - reemplaza con tu icono SVG
                    
                    playPauseBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (video.paused) {
                            video.play();
                            playPauseBtn.setAttribute('data-state', 'playing');
                            playPauseBtn.innerHTML = '<span class="material-symbols-outlined">pause</span>';
                        } else {
                            video.pause();
                            playPauseBtn.setAttribute('data-state', 'paused');
                            playPauseBtn.innerHTML = '<span class="material-symbols-outlined">play_arrow</span>';
                        }
                    });
                    
                    // Botón Mute/Unmute
                    const muteBtn = document.createElement('button');
                    muteBtn.className = 'video-control-btn mute-btn';
                    muteBtn.setAttribute('data-state', 'muted');
                    muteBtn.innerHTML = '<span class="material-symbols-outlined">volume_off</span>'; // Placeholder - reemplaza con tu icono SVG
                    
                    muteBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        video.muted = !video.muted;
                        if (video.muted) {
                            muteBtn.setAttribute('data-state', 'muted');
                            muteBtn.innerHTML = '<span class="material-symbols-outlined">volume_off</span>';
                        } else {
                            muteBtn.setAttribute('data-state', 'unmuted');
                            muteBtn.innerHTML = '<span class="material-symbols-outlined">volume_up</span>';
                        }
                    });
                    
                    // Añadir botones al contenedor de controles
                    videoControls.appendChild(playPauseBtn);
                    videoControls.appendChild(muteBtn);
                    
                    // Asegurar que mediaContainer tenga position relative
                    mediaContainer.style.position = 'relative';
                    
                    // Esperar a que el video esté listo
                    video.addEventListener('loadedmetadata', () => {
                        mediaContainer.style.height = 'auto';
                        mediaContainer.style.aspectRatio = '';
                        if (callback) callback();
                    });
                    
                    mediaContainer.appendChild(video);
                    mediaContainer.appendChild(videoControls);
                } else {
                    // Crear un elemento img para que tenga altura automática
                    const img = document.createElement('img');
                    img.src = `assets/img/${trabajo.thumbnail}`;
                    img.style.width = '100%';
                    img.style.height = 'auto';
                    img.style.display = 'block';
                    
                    // Esperar a que la imagen se cargue completamente
                    img.addEventListener('load', () => {
                        mediaContainer.style.height = 'auto';
                        mediaContainer.style.aspectRatio = '';
                        if (callback) callback();
                    });
                    
                    // Si la imagen ya está cargada (cache)
                    if (img.complete) {
                        mediaContainer.style.height = 'auto';
                        mediaContainer.style.aspectRatio = '';
                        if (callback) callback();
                    }
                    
                    mediaContainer.appendChild(img);
                }
                
                // Actualizar textos
                workTitle.textContent = trabajo.titulo;
                workDetails.textContent = trabajo.descripcion || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
            };
            
            // Si ya estaba activo, hacer fade del contenido antes de cambiar
            if (wasActive) {
                const mediaContainer = quickView.querySelector('.media');
                
                // Crear timeline para secuenciar la transición
                const tl = gsap.timeline();
                
                // 1. Fade out de imagen y textos actuales (0.2s)
                tl.to([mediaContainer, workInfo], {
                    opacity: 0,
                    duration: 0.2,
                    ease: 'power2.in'
                });
                
                // 2. Actualizar contenido y obtener nueva altura después de que cargue
                tl.call(() => {
                    const currentHeight = quickView.offsetHeight;
                    
                    // Actualizar contenido con callback para cuando la imagen cargue
                    updateQuickViewContent(() => {
                        // Esperar un frame para que el DOM se actualice
                        requestAnimationFrame(() => {
                            const newHeight = quickView.scrollHeight;
                            
                            // Animar cambio de altura si es diferente
                            if (Math.abs(currentHeight - newHeight) > 1) { // Tolerancia de 1px
                                gsap.fromTo(quickView, 
                                    { height: currentHeight },
                                    { 
                                        height: newHeight,
                                        duration: 0.6,
                                        ease: 'power2.inOut',
                                        onComplete: () => {
                                            quickView.style.height = 'auto';
                                        }
                                    }
                                );
                            }
                        });
                    });
                });
                
                // 3. Fade in de nueva imagen y texto (0.6s)
                tl.to([mediaContainer, workInfo], {
                    opacity: 1,
                    duration: 0.6,
                    ease: 'power2.out'
                }, '+=0.3'); // Pequeño delay para que empiece el fade in mientras se expande
                
            } else {
                // Primera activación - animar contenedor primero
                updateQuickViewContent();
                
                // Establecer height auto para que se adapte al contenido
                quickView.style.height = 'auto';
                
                // Centrar el quick-view en la pantalla
                quickView.style.position = 'fixed';
                quickView.style.top = '50%';
                quickView.style.left = '50%';
                quickView.style.right = 'auto';
                quickView.style.bottom = 'auto';
                quickView.style.transform = 'translate(-50%, -50%)';
                quickView.style.display = 'flex';
                
                // Mostrar scrim
                scrim.style.opacity = '1';
                scrim.style.pointerEvents = 'auto';
                
                // Animar quick-view desde escala pequeña
                gsap.fromTo(quickView, 
                    {
                        scale: 0.9,
                        opacity: 0
                    },
                    {
                        scale: 1,
                        width: '600px',
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                        opacity: 1,
                        duration: 0.5,
                        ease: 'power3.out',
                        onComplete: () => {
                            if (workInfo) {
                                gsap.to(workInfo, {
                                    opacity: 1,
                                    duration: 0.3,
                                    ease: 'power2.out'
                                });
                            }
                        }
                    }
                );
            }
        });
    });
}


// 11.- SCRIM Y POPUP - QUICK-VIEW CENTRADO

// Crear scrim (overlay oscuro)
const scrim = document.createElement('div');
scrim.className = 'quick-view-scrim';
scrim.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.75);
    z-index: 999;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
`;
document.body.appendChild(scrim);

// Función para cerrar el detalle
function cerrarDetalle() {
    const quickView = document.querySelector('.quick-view');
    const workInfo = quickView?.querySelector('.work-info');
    
    if (!quickView || !activeThumb) return;
    
    // Animar cierre del quick-view
    gsap.to(workInfo, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
    });
    
    gsap.to(quickView, {
        scale: 0.9,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.inOut',
        onComplete: () => {
            quickView.style.display = 'none';
        }
    });
    
    // Ocultar scrim
    scrim.style.opacity = '0';
    setTimeout(() => {
        scrim.style.pointerEvents = 'none';
    }, 300);
    
    // Desactivar outline del thumb activo
    if (activeThumb) {
        // Mantener borderRadius si ha sido visitado
        const borderRadiusValue = visitedThumbs.includes(activeThumb) ? '4rem' : '0rem';
        
        gsap.to(activeThumb, {
            scale: 1,
            outline: 'var(--color-text) solid 0px',
            borderRadius: borderRadiusValue,
            duration: 0.4,
            ease: 'power2.out'
        });
        activeThumb = null;
    }
}

// Event listener para cerrar al hacer clic en el scrim
scrim.addEventListener('click', cerrarDetalle);

// Event listener para cerrar con el botón
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('dragPreview');
    if (closeBtn) {
        closeBtn.onclick = cerrarDetalle;
    }
});