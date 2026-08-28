let library = [];

// Game functions
async function searchGames(title) {
    const response = await fetch(
        "https://www.cheapshark.com/api/1.0/games?title=" + title,
    );

    const games = await response.json();

    const notFound = document.getElementById("notFound");

    if (games.length === 0) {
        notFound.style.display = "block";
    }

    displayGames(games);
}

async function discoverGames() {
    const response = await fetch(
        "https://www.cheapshark.com/api/1.0/deals?sortBy=Reviews&pageSize=20&desc=11",
    );

    let games = await response.json();

    games = removeDuplicateGames(games);
    games = filterDiscoverGames(games);

    displayDiscoverGames(games);
}

function displayGames(games) {
    const list = document.getElementById("games");

    list.innerHTML = "";

    for (let i = 0; i < games.length; i++) {
        const game = games[i];

        // Card
        const card = document.createElement("div");
        card.className = "gameCard";

        // Game Image
        const image = document.createElement("img");
        image.src = game.thumb;
        image.alt = game.external;
        image.className = "gameImage";

        // Game Title
        const title = document.createElement("h3");

        if (game.steamAppID) {
            const steamLink = document.createElement("a");
            steamLink.textContent = game.external;
            steamLink.href =
                "https://store.steampowered.com/app/" + game.steamAppID + "/";
            steamLink.target = "_blank";

            title.appendChild(steamLink);
        } else {
            title.textContent = game.title;
        }

        // Change status
        const status = document.createElement("select");
        status.className = "statusSelect";

        const playing = document.createElement("option");
        playing.textContent = "Playing";
        playing.value = "playing";

        const completed = document.createElement("option");
        completed.textContent = "Completed";
        completed.value = "completed";

        const wishlist = document.createElement("option");
        wishlist.textContent = "Wishlist";
        wishlist.value = "wishlist";

        status.appendChild(playing);
        status.appendChild(completed);
        status.appendChild(wishlist);

        // Add button
        const addButton = document.createElement("button");
        addButton.className = "button";
        addButton.textContent = "Add Game";

        addButton.addEventListener("click", () => {
            addGame(game, status.value);
        });

        // Put everything in card
        card.appendChild(image);
        card.appendChild(title);
        card.appendChild(status);
        card.appendChild(addButton);

        // Put card in list
        list.appendChild(card);
    }
}

function removeDuplicateGames(games) {
    const uniqueGames = [];

    for (let i = 0; i < games.length; i++) {
        let duplicate = false;

        for (let j = 0; j < uniqueGames.length; j++) {
            if (games[i].title === uniqueGames[j].title) {
                duplicate = true;
                break;
            }
        }

        if (!duplicate) {
            uniqueGames.push(games[i]);
        }
    }
    return uniqueGames;
}

function filterDiscoverGames(games) {
    const availableGames = [];

    for (let i = 0; i < games.length; i++) {
        let alreadyOwned = false;

        for (let j = 0; j < library.length; j++) {
            if (games[i].steamAppID === library[j].steamAppID) {
                alreadyOwned = true;
                break;
            }
        }

        if (!alreadyOwned) {
            availableGames.push(games[i]);
        }
    }

    return availableGames;
}
function displayDiscoverGames(games) {
    const container = document.getElementById("discoverGames");

    container.innerHTML = "";

    for (let i = 0; i < games.length; i++) {
        const game = games[i];

        // Card
        const card = document.createElement("div");
        card.className = "gameCard";

        // Game Image
        const image = document.createElement("img");
        image.src = game.thumb;
        image.alt = game.title;
        image.className = "gameImage";

        // Title
        const title = document.createElement("h3");

        if (game.steamAppID) {
            const steamLink = document.createElement("a");
            steamLink.textContent = game.title;
            steamLink.href =
                "https://store.steampowered.com/app/" + game.steamAppID + "/";
            steamLink.target = "_blank";

            title.appendChild(steamLink);
        } else {
            title.textContent = game.title;
        }

        // Steam rating
        const rating = document.createElement("p");
        rating.textContent = "Steam Rating: " + game.steamRatingPercent + "%";

        // Add game
        const addButton = document.createElement("button");
        addButton.className = "button";
        addButton.textContent = "Add Game";

        addButton.addEventListener("click", () => {
            addGame(game);
        });

        // Add to card
        card.appendChild(image);
        card.appendChild(title);
        card.appendChild(rating);
        card.appendChild(addButton);

        container.appendChild(card);
    }
}

function addGame(game, status = "wishlist") {
    const duplicate = document.getElementById("duplicate");

    duplicate.textContent = "";

    for (let i = 0; i < library.length; i++) {
        if (library[i].id === game.gameID) {
            duplicate.style.display = "block";
            duplicate.textContent =
                game.external + " is already in your library.";
            return;
        }
    }

    const libraryGame = {
        id: game.gameID,
        steamAppID: game.steamAppID,
        title: game.external || game.title,
        image: game.thumb,
        status: status,
        added: new Date().toISOString(),
        rating: 0,
        favorite: false,
        notes: "",
    };

    library.push(libraryGame);
    updateLibrary();
}

function removeGame(gameId) {
    for (let i = 0; i < library.length; i++) {
        if (library[i].id === gameId) {
            library.splice(i, 1);
            break;
        }
    }

    updateLibrary();
}

function sortGames(games, sortMethod) {
    // Sort by A-Z
    if (sortMethod === "titleAZ") {
        games.sort(function (a, b) {
            return a.title.localeCompare(b.title);
        });
        // Sort by Z-A
    } else if (sortMethod === "titleZA") {
        games.sort(function (a, b) {
            return b.title.localeCompare(a.title);
        });
        // Sort by highest rated games
    } else if (sortMethod === "ratingHigh") {
        games.sort(function (a, b) {
            return b.rating - a.rating;
        });
        // Sort by lowest rated games
    } else if (sortMethod === "ratingLow") {
        games.sort(function (a, b) {
            return a.rating - b.rating;
        });
    }

    return games;
}

// Library functions
function displayLibrary(filter) {
    const libraryContainer = document.getElementById("libraryGames");
    const gameCount = document.getElementById("gameCount");

    libraryContainer.innerHTML = "";
    let games = [];

    // Filter through status
    for (let i = 0; i < library.length; i++) {
        const game = library[i];

        if (filter === "recent") {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            const addedDate = new Date(game.added);

            if (addedDate >= oneWeekAgo) {
                games.push(game);
            }
        } else if (
            filter === "all" ||
            filter === game.status ||
            (filter === "favorites" && game.favorite === true)
        ) {
            games.push(game);
        }
    }

    // Sort games
    games = sortGames(games, sortBy.value);

    // Display games
    for (let i = 0; i < games.length; i++) {
        const game = games[i];

        // Create card
        const card = document.createElement("div");
        card.className = "gameCard";

        // Game Image
        const image = document.createElement("img");
        image.src = game.image;
        image.alt = game.title;
        image.className = "gameImage";

        // Game Title
        const title = document.createElement("h3");

        if (game.steamAppID) {
            const steamLink = document.createElement("a");
            steamLink.textContent = game.title;
            steamLink.href =
                "https://store.steampowered.com/app/" + game.steamAppID + "/";
            steamLink.target = "_blank";

            title.appendChild(steamLink);
        } else {
            title.textContent = game.title;
        }

        // Favorite
        const favorite = document.createElement("button");
        favorite.className = "favoriteButton";

        if (game.favorite === true) {
            favorite.textContent = "♥";
        } else {
            favorite.textContent = "♡";
        }

        favorite.addEventListener("click", () => {
            game.favorite = !game.favorite;

            updateLibrary();
        });

        // Added date
        const date = document.createElement("p");
        const addedDate = new Date(game.added);
        date.textContent = "Added: " + addedDate.toLocaleDateString();

        // Rating
        const rate = document.createElement("select");
        rate.className = "rating";

        // Create rating options
        for (let i = 0; i <= 10; i++) {
            const option = document.createElement("option");

            option.value = i;

            if (i === 0) {
                option.textContent = "Not Rated";
            } else {
                option.textContent = i + "/10";
            }
            rate.appendChild(option);
        }

        rate.value = String(game.rating ?? 0);

        // Rating event listener
        rate.addEventListener("change", () => {
            game.rating = Number(rate.value);
            updateLibrary();
        });

        // Change status
        const statusSelect = document.createElement("select");
        statusSelect.className = "statusSelect";

        const playing = document.createElement("option");
        playing.textContent = "Playing";
        playing.value = "playing";

        const completed = document.createElement("option");
        completed.textContent = "Completed";
        completed.value = "completed";

        const wishlist = document.createElement("option");
        wishlist.textContent = "Wishlist";
        wishlist.value = "wishlist";

        statusSelect.appendChild(playing);
        statusSelect.appendChild(completed);
        statusSelect.appendChild(wishlist);

        statusSelect.value = game.status;

        statusSelect.addEventListener("change", () => {
            game.status = statusSelect.value;
            updateLibrary();
        });

        // Notes
        const notes = document.createElement("textarea");
        notes.className = "gameNotes";
        notes.placeholder = "Add a note...";
        notes.value = game.notes;

        notes.addEventListener("change", () => {
            game.notes = notes.value;
            saveLibrary();
        });

        // Remove
        const remove = document.createElement("button");
        remove.className = "remove";
        remove.textContent = "Remove";

        remove.addEventListener("click", () => {
            const confirmed = confirm(
                "Are you sure you want to remove " + game.title + "?",
            );
            if (confirmed) {
                removeGame(game.id);
            }
        });

        // Put everything in card
        card.appendChild(image);
        card.appendChild(title);
        card.appendChild(favorite);
        card.appendChild(date);
        card.appendChild(rate);
        card.appendChild(statusSelect);
        card.appendChild(notes);
        card.appendChild(remove);

        // Put card in list
        libraryContainer.appendChild(card);
    }

    // Show # of games
    if (filter === "all") {
        gameCount.textContent = games.length + " games in your library";
    } else if (games.length === 1) {
        gameCount.textContent = "Displaying 1 game";
    } else {
        gameCount.textContent = "Displaying " + games.length + " games";
    }
}

function saveLibrary() {
    localStorage.setItem("library", JSON.stringify(library));
}

function loadLibrary() {
    const savedLibrary = localStorage.getItem("library");

    if (savedLibrary) {
        library = JSON.parse(savedLibrary);

        for (let i = 0; i < library.length; i++) {
            if (library[i].notes === undefined) {
                library[i].notes = "";
            }
        }
    }
}

function updateLibrary() {
    saveLibrary();
    displayLibrary(currentFilter);
}

// Misc
function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

const gameSearchForm = document.getElementById("gameSearchForm");
const gameSearch = document.getElementById("gameSearch");
const searchButton = document.getElementById("search");
const all = document.getElementById("all");
const playing = document.getElementById("playing");
const completed = document.getElementById("completed");
const wishlist = document.getElementById("wishlist");
const recentlyAdded = document.getElementById("recent");
const favorited = document.getElementById("favorites");
const sortBy = document.getElementById("sortBy");
let currentFilter = "all";

searchButton.addEventListener("click", () => {
    if (gameSearchForm.value) {
        searchGames(gameSearchForm.value);
    }
});

gameSearchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const searchBox = document.getElementById("gameSearch");
    const text = searchBox.value;

    if (text) {
        searchGames(text);
    }
});

all.addEventListener("click", () => {
    currentFilter = "all";
    displayLibrary(currentFilter);
});

playing.addEventListener("click", () => {
    currentFilter = "playing";
    displayLibrary(currentFilter);
});

completed.addEventListener("click", () => {
    currentFilter = "completed";
    displayLibrary(currentFilter);
});

wishlist.addEventListener("click", () => {
    currentFilter = "wishlist";
    displayLibrary(currentFilter);
});

recentlyAdded.addEventListener("click", () => {
    currentFilter = "recent";
    displayLibrary(currentFilter);
});

favorited.addEventListener("click", () => {
    currentFilter = "favorites";
    displayLibrary(currentFilter);
});

sortBy.addEventListener("change", () => {
    displayLibrary(currentFilter);
});

loadLibrary();
displayLibrary(currentFilter);
discoverGames();
