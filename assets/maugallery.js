function mauGallery(element, options) {
   options = Object.assign({}, mauGallery.defaults, options);
   var tagsCollection = [];

   createRowWrapper(element);
   if (options.lightBox) {
      createLightBox(element, options.lightboxId, options.navigation);
   }
   addListeners(element, options);

   Array.from(element.children).forEach(function (item) {
      if (item.classList.contains("gallery-item")) {
         responsiveImageItem(item);
         moveItemInRowWrapper(item);
         wrapItemInColumn(item, options.columns);
         var theTag = item.getAttribute("data-gallery-tag");
         if (options.showTags && theTag && !tagsCollection.includes(theTag)) {
            tagsCollection.push(theTag);
         }
      }
   });

   if (options.showTags) {
      showItemTags(element, options.tagsPosition, tagsCollection);
   }

   element.style.display = "block";
}

mauGallery.defaults = {
   columns: 3,
   lightBox: true,
   lightboxId: null,
   showTags: true,
   tagsPosition: "bottom",
   navigation: true,
};

function addListeners(element, options) {
   element.addEventListener("click", function (event) {
      if (
         event.target.classList.contains("gallery-item") &&
         options.lightBox &&
         event.target.tagName === "IMG"
      ) {
         openLightBox(event.target, options.lightboxId);
      }
   });

   element.addEventListener("click", function (event) {
      if (event.target.classList.contains("nav-link")) {
         filterByTag(event.target);
      }
   });

   element.addEventListener("click", function (event) {
      if (event.target.classList.contains("mg-prev")) {
         prevImage(options.lightboxId);
      }
   });

   element.addEventListener("click", function (event) {
      if (event.target.classList.contains("mg-next")) {
         nextImage(options.lightboxId);
      }
   });
}

function createRowWrapper(element) {
   if (!element.children[0] || !element.children[0].classList.contains("row")) {
      var rowWrapper = document.createElement("div");
      rowWrapper.className = "gallery-items-row row";
      element.appendChild(rowWrapper);
   }
}

function wrapItemInColumn(element, columns) {
   var columnDiv = document.createElement("div");
   columnDiv.className = "item-column mb-4";

   if (typeof columns === "number") {
      columnDiv.className += ` col-${Math.ceil(12 / columns)}`;
   } else if (typeof columns === "object") {
      if (columns.xs)
         columnDiv.className += ` col-${Math.ceil(12 / columns.xs)}`;
      if (columns.sm)
         columnDiv.className += ` col-sm-${Math.ceil(12 / columns.sm)}`;
      if (columns.md)
         columnDiv.className += ` col-md-${Math.ceil(12 / columns.md)}`;
      if (columns.lg)
         columnDiv.className += ` col-lg-${Math.ceil(12 / columns.lg)}`;
      if (columns.xl)
         columnDiv.className += ` col-xl-${Math.ceil(12 / columns.xl)}`;
   } else {
      console.error(
         `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
      );
   }

   element.parentNode.insertBefore(columnDiv, element);
   columnDiv.appendChild(element);
}

function moveItemInRowWrapper(element) {
   var rowWrapper = document.querySelector(".gallery-items-row");
   rowWrapper.appendChild(element);
}

function responsiveImageItem(element) {
   if (element.tagName === "IMG") {
      element.classList.add("img-fluid");
   }
}

function openLightBox(element, lightboxId) {
   var lightbox = document.getElementById(lightboxId);
   lightbox.querySelector(".lightboxImage").src = element.src;
   lightbox.style.display = "block";
}

function prevImage(lightboxId) {
   var activeImage = document.querySelector(".lightboxImage").src;
   var images = Array.from(document.querySelectorAll("img.gallery-item"));
   var activeIndex = images.findIndex((img) => img.src === activeImage);
   var prevIndex = (activeIndex - 1 + images.length) % images.length;
   document.querySelector(".lightboxImage").src = images[prevIndex].src;
}

function nextImage(lightboxId) {
   var activeImage = document.querySelector(".lightboxImage").src;
   var images = Array.from(document.querySelectorAll("img.gallery-item"));
   var activeIndex = images.findIndex((img) => img.src === activeImage);
   var nextIndex = (activeIndex + 1) % images.length;
   document.querySelector(".lightboxImage").src = images[nextIndex].src;
}

function createLightBox(gallery, lightboxId, navigation) {
   var lightbox = document.createElement("div");
   lightbox.className = "modal fade";
   lightbox.id = lightboxId || "galleryLightbox";
   lightbox.tabIndex = -1;
   lightbox.role = "dialog";
   lightbox.ariaHidden = "true";

   lightbox.innerHTML = `
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-body">
          ${
             navigation
                ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
                : '<span style="display:none;" />'
          }
          <img class="lightboxImage img-fluid" alt="Contenu de l\'image affichée dans la modale au clique"/>
          ${
             navigation
                ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;">></div>'
                : '<span style="display:none;" />'
          }
        </div>
      </div>
    </div>
  `;

   gallery.appendChild(lightbox);
}

function showItemTags(gallery, position, tags) {
   var tagItems =
      '<li class="nav-item"><span class="nav-link active active-tag" data-images-toggle="all">Tous</span></li>';
   tags.forEach(function (tag) {
      tagItems += `<li class="nav-item"><span class="nav-link" data-images-toggle="${tag}">${tag}</span></li>`;
   });

   var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

   if (position === "bottom") {
      gallery.insertAdjacentHTML("beforeend", tagsRow);
   } else if (position === "top") {
      gallery.insertAdjacentHTML("afterbegin", tagsRow);
   } else {
      console.error(`Unknown tags position: ${position}`);
   }
}

function filterByTag(element) {
   if (element.classList.contains("active-tag")) {
      return;
   }

   document
      .querySelector(".active.active-tag")
      .classList.remove("active", "active-tag");
   element.classList.add("active-tag", "active");

   var tag = element.getAttribute("data-images-toggle");

   document.querySelectorAll(".gallery-item").forEach(function (item) {
      var column = item.closest(".item-column");
      column.style.display = "none";
      if (tag === "all" || item.getAttribute("data-gallery-tag") === tag) {
         column.style.display = "block";
      }
   });
}

// Initialize the gallery
document.querySelectorAll(".gallery").forEach(function (gallery) {
   mauGallery(gallery, mauGallery.defaults);
});
