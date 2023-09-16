//<span class="cmdIcon fa-solid fa-ellipsis-vertical"></span>
let contentScrollPosition = 0;
Init_UI();

function Init_UI() {
    renderBookmarks();
    $('#createBookmark').on("click", async function () {
        saveContentScrollPosition();
        renderCreateBookmarkForm();
    });
    $('#abort').on("click", async function () {
        renderBookmarks();
    });
    $('#aboutCmd').on("click", function () {
        renderAbout();
    });
}

function renderAbout() {
    saveContentScrollPosition();
    eraseContent();
    $("#createBookmark").hide();
    $("#abort").show();
    $("#actionTitle").text("À propos...");
    $("#content").append(
        $(`
            <div class="aboutContainer">
                <h2>Gestionnaire de favoris</h2>
                <hr>
                <p>
                    Application de gestion de favoris.
                </p>
                <p>
                    Auteur: Jérémy Racine
                </p>
                <p>
                    Collège Lionel-Groulx 2023
                </p>
            </div>
        `))
}
async function renderBookmarks() {
    showWaitingGif();
    $("#actionTitle").text("Liste des favoris");
    $("#createBookmark").show();
    $("#abort").hide();
    let bookmarks = await Bookmarks_API.Get();
    eraseContent();
    if (bookmarks !== null) {
        bookmarks.forEach(bookmark => {
            $("#content").append(renderBookmark(bookmark));
        });
        restoreContentScrollPosition();
        // Attached click events on command icons
        $(".editCmd").on("click", function () {
            saveContentScrollPosition();
            renderEditBookmarkForm(parseInt($(this).attr("editBookmarkId")));
        });
        $(".deleteCmd").on("click", function () {
            saveContentScrollPosition();
            renderDeleteBookmarkForm(parseInt($(this).attr("deleteBookmarkId")));
        });
        $(".bookmarkRow").on("click", function (e) { e.preventDefault(); })
    } else {
        renderError("Service introuvable");
    }
}
function showWaitingGif() {
    $("#content").empty();
    $("#content").append($("<div class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>'"));
}
function eraseContent() {
    $("#content").empty();
}
function saveContentScrollPosition() {
    contentScrollPosition = $("#content")[0].scrollTop;
}
function restoreContentScrollPosition() {
    $("#content")[0].scrollTop = contentScrollPosition;
}
function renderError(message) {
    eraseContent();
    $("#content").append(
        $(`
            <div class="errorContainer">
                ${message}
            </div>
        `)
    );
}
function renderCreateBookmarkForm() {
    renderBookmarkForm();
}
async function renderEditBookmarkForm(id) {
    showWaitingGif();
    let bookmark = await Bookmarks_API.Get(id);
    if (bookmark !== null) {
        eraseContent();
        $("#createBookmark").hide();
        $("#abort").show();
        $("#actionTitle").text("Modification");
        
        $("#content").append(`
            <form class="form" id="bookmarkForm">
                <input type="hidden" name="Id" value="${bookmark.Id}"/>
                <img id="bookmarkIcon" src="${bookmark.Url ? getFaviconUrl(bookmark.Url) : 'bookmark-logo.svg'}" class="createBookmarkIcon" alt="Icône du favoris">
                <label for="Title" class="form-label">Titre </label>
                <input 
                    class="form-control Alpha"
                    name="Title" 
                    id="Title" 
                    placeholder="Titre"
                    required
                    RequireMessage="Veuillez entrer un titre"
                    InvalidMessage="Le titre comporte un caractère illégal" 
                    value="${bookmark.Title}"
                />
                <label for="Url" class="form-label">Url </label>
                <input
                    class="form-control URL"
                    name="Url"
                    id="Url"
                    placeholder="https://www.exemple.com"
                    required
                    RequireMessage="Veuillez entrer un Url" 
                    InvalidMessage="Veuillez entrer une Url valide"
                    value="${bookmark.Url}" 
                />
                <label for="Category" class="form-label">Catégorie </label>
                <input 
                    class="form-control Alpha"
                    name="Category"
                    id="Category"
                    placeholder="Catégorie"
                    required
                    RequireMessage="Veuillez entrer une catégorie" 
                    InvalidMessage="La catégorie comporte un caractère illégal"
                    value="${bookmark.Category}"
                />
                
                <input type="submit" value="Enregistrer" id="saveBookmark" class="btn btn-primary">
                <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
            </form>
        `);

        // ... Le reste du code de la fonction

        // Même gestion de l'icône en temps réel lorsque l'URL change
        $('#Url').on("change", () => {
            const siteUrl = $("#Url").val();
            
            const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${siteUrl}&sz=64`;
            
            $("#bookmarkIcon").attr("src", googleFaviconUrl);
        });
    } else {
        renderError("Favoris introuvable!");
    }
}

async function renderDeleteBookmarkForm(id) {
    showWaitingGif();
    $("#createBookmark").hide();
    $("#abort").show();
    $("#actionTitle").text("Retrait");
    let bookmark = await Bookmarks_API.Get(id);
    eraseContent();
    if (bookmark !== null) {
        const siteUrl = bookmark.Url;

        const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${siteUrl}&sz=64`;

        $("#content").append(`
        <div class="bookmarkdeleteForm">
            <h4>Effacer le favoris suivant?</h4>
            <br>
            <div class="bookmarkRow" bookmark_id=${bookmark.Id}">
                <div class="bookmarkContainer">
                    <div class="bookmarkLayout">
                        <div class="bookmarkName">
                            <img class="bookmarkIcon" src="${googleFaviconUrl}" alt="Icône du site" />
                            ${bookmark.Title}
                        </div>
                        <div class="bookmarkCategory">${bookmark.Category}</div>
                    </div>
                </div>  
            </div>   
            <br>
            <input type="button" value="Effacer" id="deleteBookmark" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </div>    
        `);
        $('#deleteBookmark').on("click", async function () {
            showWaitingGif();
            let result = await Bookmarks_API.Delete(bookmark.Id);
            if (result)
                renderBookmarks();
            else
                renderError("Une erreur est survenue!");
        });
        $('#cancel').on("click", function () {
            renderBookmarks();
        });
    } else {
        renderError("Favoris introuvable!");
    }
}
function newBookmark() {
    bookmark = {};
    bookmark.Id = 0;
    bookmark.Title = "";
    bookmark.Url = "";
    bookmark.Category = "";
    return bookmark;
}
function renderBookmarkForm(bookmark = null) {
    $("#createBookmark").hide();
    $("#abort").show();
    eraseContent();
    let create = bookmark == null;
    if (create) bookmark = newBookmark();
    $("#actionTitle").text(create ? "Création" : "Modification");
    $("#content").append(`
        <form class="form" id="bookmarkForm">
            <input type="hidden" name="Id" value="${bookmark.Id}"/>
            <img id="bookmarkIcon" src="${bookmark.Url ? getFaviconUrl(bookmark.Url) : 'bookmark-logo.svg'}" class="createBookmarkIcon" alt="Icône du favoris">
            <label for="Title" class="form-label">Titre </label>
            <input 
                class="form-control Alpha"
                name="Title" 
                id="Title" 
                placeholder="Titre"
                required
                RequireMessage="Veuillez entrer un titre"
                InvalidMessage="Le titre comporte un caractère illégal" 
                value="${bookmark.Title}"
            />
            <label for="Url" class="form-label">Url </label>
            <input
                class="form-control URL"
                name="Url"
                id="Url"
                placeholder="https://www.exemple.com"
                required
                RequireMessage="Veuillez entrer un Url" 
                InvalidMessage="Veuillez entrer une Url valide"
                value="${bookmark.Url}" 
            />
            <label for="Category" class="form-label">Catégorie </label>
            <input 
                class="form-control Alpha"
                name="Category"
                id="Category"
                placeholder="Catégorie"
                required
                RequireMessage="Veuillez entrer une catégorie" 
                InvalidMessage="La catégorie comporte un caractère illégal"
                value="${bookmark.Category}"
            />
            
            <input type="submit" value="Enregistrer" id="saveBookmark" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </form>
    `);
    initFormValidation();
    $('#bookmarkForm').on("submit", async function (event) {
        event.preventDefault();
        let bookmark = getFormData($("#bookmarkForm"));
        bookmark.Id = parseInt(bookmark.Id);
        showWaitingGif();
        let result = await Bookmarks_API.Save(bookmark, create);
        if (result)
            renderBookmarks();
        else
            renderError("Une erreur est survenue!");
    });
    $('#cancel').on("click", function () {
        renderBookmarks();
    });
    
    // Mettez à jour l'icône du site en temps réel lorsque l'URL change
    $('#Url').on("change", () => {
        siteUrl = $("#Url").val();
        googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${siteUrl}&sz=64`;
        $("#bookmarkIcon").attr("src", googleFaviconUrl);
    });
}


function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}

function renderBookmark(bookmark) {
    const siteUrl = bookmark.Url;

    // Récupérez l'URL de l'icône du site web avec une meilleure qualité
    const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${siteUrl}&sz=64`;

    return $(`
     <div class="bookmarkRow" bookmark_id=${bookmark.Id}">
        <div class="bookmarkContainer noselect">
            <div class="bookmarkLayout">
                <img class="bookmarkIcon" src="${googleFaviconUrl}" alt="Icône du site" />
                <span class="bookmarkTitle">${bookmark.Title}</span>
                <span class="bookmarkCategory">${bookmark.Category}</span>
            </div>
            <div class="bookmarkCommandPanel">
                <span class="editCmd cmdIcon fa fa-pencil" editBookmarkId="${bookmark.Id}" title="Modifier ${bookmark.Title}"></span>
                <span class="deleteCmd cmdIcon fa fa-trash" deleteBookmarkId="${bookmark.Id}" title="Effacer ${bookmark.Title}"></span>
            </div>
        </div>
    </div>           
    `);
}

