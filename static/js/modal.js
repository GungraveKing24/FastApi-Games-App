document.addEventListener("DOMContentLoaded", () => {
  const openModalBtn = document.getElementById("search-game-button");
  const closeModalBtn = document.getElementById("close-modal");
  const modal = document.getElementById("search-modal");
  const searchInput = document.getElementById("searchInput");

  const searchResultsSection = document.getElementById("search-modal");
  const searchResultsGrid = document.getElementById("searchResultsGrid");
  const searchResultsHero = document.getElementById("searchResultsHero");

  let steamGridDataCache = null;
  // Funcion para iniciar la busqueda
  const performSearch = async (query) => {
    if (!query) return;
    
    searchResultsGrid.innerHTML = "Buscando...";
    searchResultsHero.innerHTML = "";
    
    try {
      const response = await fetch(`/steamgriddb/${encodeURIComponent(query)}`);
      const data = await response.json();

      if (!data.success || data.data.length === 0) {
        searchResultsGrid.innerHTML = "<p>No se encontraron resultados.</p>";
        return;
      }

      steamGridDataCache = data; // guardar resultados
      renderSteamGridImages(data);
      
    } catch (error) {
      console.error("Error al buscar en SteamGridDB:", error);
      searchResultsGrid.innerHTML = "<p>Error al buscar imágenes.</p>";
    }
  };

  // Abrir modal y realizar búsqueda automática
  if (openModalBtn && modal) {
    openModalBtn.addEventListener("click", async () => {
      modal.classList.remove("hidden");
      
      // Obtener el título del juego del formulario
      const gameTitle = document.getElementById("title").value.trim();
      
      // Si hay un título, establecerlo en el input de búsqueda y realizar búsqueda
      if (gameTitle) {
        searchInput.value = gameTitle;
        await performSearch(gameTitle);
      } else {
        // Si no hay título, solo mostrar el modal con el input vacío
        searchResultsGrid.innerHTML = "Ingresa un nombre de juego para buscar imágenes";
        searchResultsHero.innerHTML = "";
      }
    });
  }

  searchInput.addEventListener("keypress", async (e) => {
    if (e.key === "Enter") {
      await performSearch(searchInput.value.trim());
    }
  });

  // EVitar el drag de la imagen
  document.querySelectorAll("#searchResultsHero img").forEach((img) => {
    img.setAttribute("draggable", "false");
  });

  // Scroll X
  const scrollContainerX = document.querySelector("#searchResultsGrid").parentElement;
  let isDownX = false;
  let startX;
  let scrollLeft;
  let isDraggingX = false;

  scrollContainerX.addEventListener("mousedown", (e) => {
    isDownX = true;
    scrollContainerX.classList.add("cursor-grabbing");
    startX = e.pageX - scrollContainerX.offsetLeft;
    scrollLeft = scrollContainerX.scrollLeft;
  });

  scrollContainerX.addEventListener("mouseleave", () => {
    isDownX = false;
    scrollContainerX.classList.remove("cursor-grabbing");
  });

  scrollContainerX.addEventListener("mouseup", () => {
    isDownX = false;
    scrollContainerX.classList.remove("cursor-grabbing");
    setTimeout(() => isDraggingX = false, 100);
  });

  scrollContainerX.addEventListener("mousemove", (e) => {
    if (!isDownX) return;
    e.preventDefault();
    isDraggingX = true;
    const x = e.pageX - scrollContainerX.offsetLeft;
    const walkX = (x - startX) * 1.5; // sensibilidad
    scrollContainerX.scrollLeft = scrollLeft - walkX;
  });

  // Scroll Y
  const scrollContainer = document.querySelector("#searchResultsHero").parentElement;

  let isDown = false;
  let startY;
  let scrollTop;
  let isDragging = false;

  scrollContainer.addEventListener("mousedown", (e) => {
    isDown = true;
    scrollContainer.classList.add("cursor-grabbing");
    startY = e.pageY - scrollContainer.offsetTop;
    scrollTop = scrollContainer.scrollTop
  })

  scrollContainer.addEventListener("mouseleave", () => {
    isDown = false;
    scrollContainer.classList.remove("cursor-grabbing");
  });

  scrollContainer.addEventListener("mouseup", () => {
    isDown = false;
    scrollContainer.classList.remove("cursor-grabbing");
    setTimeout(() => isDragging = false, 100); // 👈 resetea arrastre
  });

  scrollContainer.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    isDragging = true; // 👈 se está arrastrando
    const y = e.pageY - scrollContainer.offsetTop;
    const walk = (y - startY) * 1.5; // Ajusta la sensibilidad aquí
    scrollContainer.scrollTop = scrollTop - walk;
  });

  modal.addEventListener("mousedown", (e) => {
    if (e.target === modal && !isDragging && !isDraggingX) {
      modal.classList.add("hidden");
    }
  });

  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
  }
});

function renderSteamGridImages(data) {
  searchResultsGrid.innerHTML = "";
  searchResultsHero.innerHTML = "";

  const covers = data.data.filter((img) => img.style === "cover");
  const heroes = data.data.filter((img) => img.style === "hero");

  for (const img of covers) {
    const imgElement = document.createElement("img");
    imgElement.src = img.url;
    imgElement.className = "h-48 w-full rounded-md cursor-pointer hover:scale-105 transition-transform";
    imgElement.setAttribute("draggable", "false");

    imgElement.addEventListener("click", () => {
      document.getElementById("cover-preview").innerHTML = `
        <img src="${img.url}" class="h-full w-full object-cover rounded-md" />
      `;
      document.getElementById("selected-cover-url").value = img.url;
    });

    searchResultsGrid.appendChild(imgElement);
  }

  for (const img of heroes) {
    const imgElement = document.createElement("img");
    imgElement.src = img.url;
    imgElement.className = "h-[180px] w-full object-cover rounded-lg cursor-pointer hover:scale-[1.02] transition-transform shadow";
    imgElement.setAttribute("draggable", "false");

    imgElement.addEventListener("click", () => {
      document.getElementById("banner-preview").innerHTML = `
        <img src="${img.url}" class="h-full w-full object-cover rounded-md" />
      `;
      document.getElementById("selected-banner-url").value = img.url;
    });

    searchResultsHero.appendChild(imgElement);
  }
}