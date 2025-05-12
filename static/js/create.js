document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const titleInput = document.getElementById('title');
    const searchResults = document.getElementById('searchResults');
    const ratingSlider = document.getElementById('user-rating');
    const ratingValue = document.getElementById('rating-value');
    const ratingProgress = document.getElementById('rating-progress');

    // Referencias
    const hltbModal = document.getElementById('hltb-modal');
    const hltbSearchInput = document.getElementById('hltb-search-input');
    const hltbResults = document.getElementById('hltb-results');
    const hltbButton = document.getElementById('hltb-button');
    const hltbClose = document.getElementById('hltb-close');

    // Variables
    let searchTimeout;
    let hltbTimeout;

    // Mostrar modal al hacer clic en el botón
    hltbButton.addEventListener('click', () => {
        hltbModal.classList.remove('hidden');
        hltbSearchInput.value = titleInput.value;
        searchHLTB(hltbSearchInput.value);
    });
    
    // Cerrar modal
    hltbClose.addEventListener('click', () => {
        hltbModal.classList.add('hidden');
    });
    
    // Buscar mientras se escribe
    hltbSearchInput.addEventListener('input', () => {
        clearTimeout(hltbTimeout);
        searchHLTB = setTimeout(() => {
            const query = hltbSearchInput.value.trim();
            if (query.length > 3) {
                searchHLTB(query);
            } else {
                hltbResults.innerHTML = '<div class="text-center text-muted-foreground">Escribe al menos 3 caracteres</div>';
            }
        }, 400);
    });
    
    // Configuración del slider de calificación
    ratingSlider.addEventListener('input', updateRatingDisplay);
    
    // Evento de búsqueda de juegos
    titleInput.addEventListener('input', handleGameSearch);
    
    // Cerrar resultados al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (e.target !== titleInput && !searchResults.contains(e.target)) {
            searchResults.classList.add('hidden');
        }
    });
    
    // Funciones
    function updateRatingDisplay() {
        const value = this.value;
        const percentage = (value / 10) * 100;
        
        ratingValue.textContent = value;
        ratingProgress.style.width = `${percentage}%`;
        
        // Cambiar color según el valor
        if (value >= 8) {
            ratingProgress.classList.remove('bg-yellow-500', 'bg-red-500');
            ratingProgress.classList.add('bg-green-500');
        } else if (value >= 5) {
            ratingProgress.classList.remove('bg-green-500', 'bg-red-500');
            ratingProgress.classList.add('bg-yellow-500');
        } else if (value > 0) {
            ratingProgress.classList.remove('bg-green-500', 'bg-yellow-500');
            ratingProgress.classList.add('bg-red-500');
        } else {
            ratingProgress.classList.remove('bg-green-500', 'bg-yellow-500', 'bg-red-500');
            ratingProgress.classList.add('bg-primary');
        }
    }
    
    function handleGameSearch(e) {
        const query = e.target.value.trim();
        
        clearTimeout(searchTimeout);
        
        if (!query) {
            searchResults.innerHTML = '';
            searchResults.classList.add('hidden');
            return;
        }
        
        searchResults.innerHTML = '<div class="p-2 text-center text-muted-foreground">Buscando...</div>';
        searchResults.classList.remove('hidden');
        
        searchTimeout = setTimeout(async () => {
            if (query.length > 3) {
                try {
                    const response = await fetch(`/RAWG/${encodeURIComponent(query)}`, { method: 'POST' });
                    const data = await response.json();

                    searchResults.innerHTML = '';
                    
                    if (data.results && data.results.length > 0) {
                        data.results.forEach(game => {
                            const resultItem = document.createElement('div');
                            resultItem.className = 'p-2 hover:bg-accent transition-colors';
                            resultItem.textContent = game.name;
                            resultItem.addEventListener('click', () => {
                                fillGameData(game);
                                searchResults.classList.add('hidden');
                            });
                            searchResults.appendChild(resultItem);
                        });
                    } else {
                        searchResults.innerHTML = '<div class="p-2 text-center text-muted-foreground">No se encontraron resultados</div>';
                    }
                } catch (error) {
                    console.error('Error searching games:', error);
                    searchResults.innerHTML = '<div class="p-2 text-center text-muted-foreground">Error en la búsqueda</div>';
                }
            } else {
                searchResults.classList.add('hidden');
            }
        }, 1000);
    }

    // Buscar en tu backend (debes tener un endpoint que devuelva varios resultados)
    async function searchHLTB(query) {
        hltbResults.innerHTML = '<div class="text-center text-muted-foreground">Buscando...</div>';
        if (query.length < 3) return;
    
        try {
        const res = await fetch(`/HLTB/search/${encodeURIComponent(query)}`);
        const data = await res.json();
    
        hltbResults.innerHTML = '';
    
        if (data.results && data.results.length > 0) {
            data.results.forEach(game => {
            const item = document.createElement('div');
            item.className = 'p-2 hover:bg-accent cursor-pointer rounded transition-colors border border-border';
            item.innerHTML = `
                <div class="font-semibold">${game.name}</div>
                <div class="text-sm text-muted-foreground">ID: ${game.id}</div>
            `;
            item.addEventListener('click', () => {
                fillHLTBById(game.id);
                hltbModal.classList.add('hidden');
            });
            hltbResults.appendChild(item);
            });
        } else {
            hltbResults.innerHTML = '<div class="text-center text-muted-foreground">No se encontraron coincidencias</div>';
        }
        } catch (err) {
        console.error('Error buscando en HLTB:', err);
        hltbResults.innerHTML = '<div class="text-center text-muted-foreground">Error en la búsqueda</div>';
        }
    }
    
    // Traer datos por ID y llenar inputs
    async function fillHLTBById(gameId) {
        try {
            const res = await fetch(`/HLTB/id/${gameId}`);
            const data = await res.json();
    
            document.getElementById('HLTB_MAIN').value = data.main || '';
            document.getElementById('HLTB_MAIN_EXTRA').value = data.main_extra || '';
            document.getElementById('HLTB_COMPLETIONIST').value = data.completionist || '';
        } catch (err) {
            console.error('Error al traer datos por ID:', err);
        }
    }
    
    async function fillGameData(game) {
        // Llenar campos básicos
        document.getElementById('title').value = game.name;
        document.getElementById('description').value = game.description_raw || '';
        
        // Fechas
        if (game.released) {
            document.getElementById('release-date').value = game.released;
        }
        
        // Calificación
        if (game.metacritic) {
            document.getElementById('metacritic-rating').value = game.metacritic;
        }
        
        // Plataformas
        if (game.platforms) {
            const platforms = game.platforms.map(p => p.platform.name);
            document.querySelectorAll('input[name="platforms"]').forEach(checkbox => {
                if (platforms.includes(checkbox.value)) {
                    checkbox.checked = true;
                    checkbox.nextElementSibling.classList.add('bg-primary', 'text-primary-foreground');
                }
            });
        }
        
        // Géneros
        if (game.genres) {
            const genres = game.genres.map(g => g.name);
            handleRawgGenres(genres);
            document.getElementById('no-genres').classList.add('hidden');
        } else {
            // Limpiar géneros de RAWG si no hay
            document.getElementById('rawg-genres-container').innerHTML = '';
        }
    }

    // Función para manejar los géneros de RAWG
    function handleRawgGenres(genres) {
        const container = document.getElementById('rawg-genres-container');
        container.innerHTML = ''; // Limpiar géneros anteriores
        
        if (!genres || genres.length === 0) return;
        
        // Primero desmarcamos todos los géneros base
        document.querySelectorAll('#genres-container .genre-tag input').forEach(checkbox => {
            checkbox.checked = false;
            checkbox.nextElementSibling.classList.remove('bg-primary', 'text-primary-foreground');
        });
        
        // Marcar los géneros base que coincidan
        const baseGenres = ["Acción", "Aventura", "RPG", "Mundo abierto", "Plataforma"];
        
        genres.forEach(genreName => {
            // Verificar si es un género base
            const isBaseGenre = baseGenres.includes(genreName);
            
            if (isBaseGenre) {
                // Marcar el género base correspondiente
                const baseCheckbox = document.querySelector(`#genres-container input[value="${genreName}"]`);
                if (baseCheckbox) {
                    baseCheckbox.checked = true;
                    baseCheckbox.nextElementSibling.classList.add('bg-primary', 'text-primary-foreground');
                }
            } else {
                // Crear tag para género no base
                const genreTag = document.createElement('label');
                genreTag.className = 'genre-tag';
                genreTag.innerHTML = `
                    <input type="checkbox" name="genres" value="${genreName}" class="hidden" checked />
                    <span class="bg-primary text-primary-foreground inline-flex cursor-pointer items-center rounded-full px-3 py-1 text-xs font-medium">
                        ${genreName}
                    </span>`;
                container.appendChild(genreTag);
            }
            });
            
            // Si hay más de 3 géneros adicionales, agruparlos
            const additionalGenres = genres.filter(g => !baseGenres.includes(g));
            if (additionalGenres.length > 10) {
            container.innerHTML = ''; // Limpiar
                
                // Mostrar solo los primeros 3 géneros adicionales
                additionalGenres.slice(0, 3).forEach(genreName => {
                    const genreTag = document.createElement('label');
                    genreTag.className = 'genre-tag';
                    genreTag.innerHTML = `
                        <input type="checkbox" name="genres" value="${genreName}" class="hidden" checked />
                        <span class="bg-primary text-primary-foreground inline-flex cursor-pointer items-center rounded-full px-3 py-1 text-xs font-medium">
                            ${genreName}
                        </span>
                        `;
                    container.appendChild(genreTag);
                });
                
                // Añadir tag "y X más"
                const moreTag = document.createElement('label');
                moreTag.className = 'genre-tag';
                moreTag.title = additionalGenres.slice(3).join(', ');
                moreTag.innerHTML = `
                    <span class="bg-accent hover:bg-primary hover:text-primary-foreground inline-flex cursor-pointer items-center rounded-full px-3 py-1 text-xs font-medium">
                    y ${additionalGenres.length - 3} más
                    </span>
                `;
                container.appendChild(moreTag);
            }
    }
});

async function submitGameForm() {
    // Obtener el formulario
    const form = document.getElementById('game-form');
    
    // Recopilar los datos del formulario
    const formData = {
        title: form.querySelector('#title').value,
        status: form.querySelector('#status').value,
        fecha_lanzamiento: form.querySelector('#release-date').value || null,  // Nombre corregido
        fecha_finalizado: form.querySelector('#completion-date').value || null, // Nombre corregido
        user_rating: parseFloat(form.querySelector('#user-rating').value) || 0,
        metacritic_rating: parseFloat(form.querySelector('#metacritic-rating').value || 0),
        HLTB_MAIN: parseFloat(form.querySelector('#HLTB_MAIN').value || 0),
        HLTB_MAIN_EXTRA: parseFloat(form.querySelector('#HLTB_MAIN_EXTRA').value || 0),
        HLTB_COMPLETIONIST: parseFloat(form.querySelector('#HLTB_COMPLETIONIST').value || 0),
        user_comment: form.querySelector('#user-comment').value,
        cover_url: form.querySelector('#selected-cover-url').value,
        banner_url: form.querySelector('#selected-banner-url').value,
        times_played: parseInt(form.querySelector('#times-played').value || 1),
        hours_played: parseFloat(form.querySelector('#hours-played').value || 0),
        replaying: form.querySelector('#replaying').checked,
        plataformas: Array.from(form.querySelectorAll('input[name="platforms"]:checked')).map(el => el.value), // Nombre corregido
        generos: Array.from(form.querySelectorAll('#genres-container input[type="checkbox"]:checked')).map(el => el.value), // Nombre corregido
        description: form.querySelector('#description').value
    };

    console.log("Datos a enviar:", formData);

    try {
        // Enviar los datos al backend
        const response = await fetch('/games/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': '{{ csrf_token }}' // Si usas protección CSRF
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();
        console.log('Success:', result);
        
        // Redirigir o mostrar mensaje de éxito
        //window.location.href = '/games'; // Redirige a la lista de juegos
        
    } catch (error) {
        console.error('Error:', error);
        // Mostrar mensaje de error al usuario
        alert('Hubo un error al guardar el juego. Por favor, inténtalo de nuevo.');
    }
}