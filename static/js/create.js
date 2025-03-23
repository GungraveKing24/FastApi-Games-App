addEventListener("DOMContentLoaded", () => {
    const searchInput =  document.getElementById('title');
    const searchResults = document.getElementById('searchResults');
    const ImageCoverPreview = document.getElementById('cover-preview');
    // const ImageBannerPreview = document.getElementById('banner-preview');
    
    let debounceTimer;
    const timeout = 1000;
    
    searchInput.addEventListener('input', async (e) => {
        const query = e.target.value;
        if (query.length > 3) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                const results = await getGames(query);
                showResults(results);            
            }, timeout);
        } else {
            searchResults.classList.add('hidden');
        }
    });    

    
    
    async function getGames(query) {
        const response = await fetch(`/RAWG/${query}`, {
            method: 'POST', // Método POST
            headers: {
                'Content-Type': 'application/json', // Asegurarte de enviar como JSON
            },
            body: JSON.stringify({ query }) // Enviar el 'query' como un cuerpo JSON
        });
    
        if (response.ok) {
            const data = await response.json();
            return data.results;
        }
        return [];
    }
    
    // Función para mostrar resultados
    function showResults(results) {
        searchResults.innerHTML = ''; // Limpiar los resultados previos
        searchResults.classList.remove('hidden');

        results.forEach(result => {
            // Crear un elemento de resultado
            const resultElement = document.createElement('div');
            resultElement.classList.add('px-4', 'py-2', 'hover:bg-gray-500', 'cursor-pointer');
            resultElement.textContent = result.name;

            // Añadir un evento de clic al resultado
            resultElement.addEventListener('click', () => {
                // Llenar los campos con los datos del resultado
                document.getElementById('title').value = result.name;
                document.getElementById('rating').value = result.metacritic / 10 || ''; // Por ejemplo, con la calificación de Metacritic
                document.getElementById('developer').value = result.developers ? result.developers[0].name : ''; // Nombre del desarrollador
                document.getElementById('publisher').value = result.publishers ? result.publishers[0].name : ''; // Nombre del editor
                document.getElementById('release-date').value = result.released || ''; // Fecha de lanzamiento
                document.getElementById('description').value = result.description_raw || ''; // Descripción del juego
                
                // Establecer la imagen de portada (si existe)
                if (result.background_image) {
                    ImageCoverPreview.src = result.background_image;
                    ImageCoverPreview.classList.remove('hidden');
                    document.getElementById('cover-placeholder').classList.add('hidden');
                }

                // Establecer la imagen de banner (si existe)
                if (result.short_screenshots && result.short_screenshots.length > 0) {
                    ImageBannerPreview.src = result.short_screenshots[0].image;
                    ImageBannerPreview.classList.remove('hidden');
                    document.getElementById('banner-placeholder').classList.add('hidden');
                }

                searchResults.classList.add('hidden'); // Ocultar los resultados después de seleccionar uno
            });

            searchResults.appendChild(resultElement); // Añadir el resultado al contenedor de resultados
        });
    }

    // Ocultar la lista al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.add('hidden');
        }
    });
});