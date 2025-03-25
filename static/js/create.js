addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById('title');
    const searchResults = document.getElementById('searchResults');
    const ImageCoverPreview = document.getElementById('cover-image-preview');
    const bannerPreview = document.getElementById('banner-preview');

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
        try {
            const response = await fetch(`/RAWG/${query}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Error al buscar juegos');
            }

            const data = await response.json();
            return data.results;
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    }

    function showResults(results) {
        searchResults.innerHTML = '';
        searchResults.classList.remove('hidden');

        results.forEach(result => {
            const resultElement = document.createElement('div');
            resultElement.classList.add('px-4', 'py-2', 'hover:bg-gray-500', 'cursor-pointer', 'flex', 'items-center', 'space-x-4');

            const img = document.createElement('img');
            img.src = result.background_image || 'https://via.placeholder.com/50';
            img.alt = result.name;
            img.classList.add('w-10', 'h-10', 'object-cover', 'rounded-md');

            const textContainer = document.createElement('div');
            textContainer.innerHTML = `
                <p class="font-medium">${result.name}</p>
                <p class="text-sm text-gray-400">Metacritic: ${result.metacritic || 'N/A'}</p>
            `;

            resultElement.appendChild(img);
            resultElement.appendChild(textContainer);

            resultElement.addEventListener('click', () => {
                console.log('Resultado seleccionado:', result); // Depuración
                console.log('URL de la imagen:', result.background_image); // Depuración

                document.getElementById('title').value = result.name;
                document.getElementById('rating').value = result.metacritic / 10 || '';
                document.getElementById('release-date').value = result.released || '';
                document.getElementById('description').value = result.description_raw || '';

                searchResults.classList.add('hidden');
            });

            searchResults.appendChild(resultElement);
        });
    }

    function updateImage(src) {
        const coverPreview = document.getElementById('cover-image-preview');
        const coverPlaceholder = document.getElementById('cover-placeholder');

        if (src) {
            coverPreview.src = src;
            coverPreview.classList.remove('hidden');
            coverPlaceholder.classList.add('hidden');
        } else {
            coverPreview.src = '';
            coverPreview.classList.add('hidden');
            coverPlaceholder.classList.remove('hidden');
        }
    }

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.add('hidden');
        }
    });
});