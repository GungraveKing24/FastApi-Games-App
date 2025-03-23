const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const gamesList = document.getElementById('gamesList');

// Función para obtener juegos desde la API
async function getGames(query) {
    if (!query) return [];

    try {
        const response = await fetch(`/search?q=${encodeURIComponent(query)}`);
        return response.ok ? await response.json() : [];
    } catch (error) {
        console.error("Error de conexión:", error);
        return [];
    }
}

// Función para mostrar los resultados
function showResults(results) {
    searchResults.innerHTML = '';
    if (results.length > 0) {
        results.forEach(result => {
            const item = document.createElement('div');
            item.textContent = result.juego;
            item.classList.add('px-4', 'py-2', 'hover:bg-gray-500', 'cursor-pointer');
            item.addEventListener('click', () => {
                searchInput.value = result.juego;
                window.location.href = `/search/results/${encodeURIComponent(result.juego)}`;
                searchResults.classList.add('hidden');
            });
            searchResults.appendChild(item);
        });
        searchResults.classList.remove('hidden');
    } else {
        searchResults.classList.add('hidden');
    }
}

// Evento al escribir en el input
searchInput.addEventListener('input', async (e) => {
    const query = e.target.value;
    if (query.length > 0) {
        const results = await getGames(query);
        showResults(results);
    } else {
        searchResults.classList.add('hidden');
    }
});

// Ocultar la lista al hacer clic fuera
document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.add('hidden');
    }
});
