// Config: Set the base directory for posts
const username = "lstwo";
const repoName = "lstwo.github.io";
const branchName = "main";
const postsDir = `https://api.github.com/repos/${username}/${repoName}/contents/blog/posts?ref=${branchName}`;
const rawFileBaseURL = `https://raw.githubusercontent.com/${username}/${repoName}/${branchName}/blog/posts/`;
const postListElement = document.getElementById("post-list");
const contentElement = document.getElementById("content");

// Fetch Posts
async function fetchPostsList() {
  try {
    const response = await fetch(postsDir);
    const files = await response.json();

    const markdownFiles = files
      .filter(file => file.name.endsWith(".md"))
      .map(file => decodeURIComponent(file.name.replace(".md", "")))
      .sort((a, b) => b.localeCompare(a));

    markdownFiles.forEach(postName => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `<a href="#${encodeURIComponent(postName)}">${postName}</a>`;
      postListElement.appendChild(listItem);
    });

    if (window.location.hash) {
      loadPost(decodeURIComponent(window.location.hash.substring(1)));
    }
  } 
  catch (error) {
    console.error("Failed to fetch posts list", error);
  }
}

// Load Post
async function loadPost(postName) {
  try {
    const postURL = `${rawFileBaseURL}${encodeURIComponent(postName)}.md`;
    const response = await fetch(postURL);
    if (!response.ok) throw new Error("Post not found");

    const markdown = await response.text();
    const htmlContent = marked.parse(markdown);
    contentElement.innerHTML = htmlContent;

    // Generate TOC after content is loaded
    generateTOC();

    // Apply smooth scrolling with offset for TOC links
    applySmoothScrolling();
  } catch (error) {
    console.error(`Failed to load post: ${postName}`, error);
    contentElement.innerHTML = "<p>Post not found!</p>";
  }
}

function generateTOC() {
  const tocElement = document.getElementById("toc-list");
  tocElement.innerHTML = ""; // Clear previous TOC

  const headers = contentElement.querySelectorAll("h1, h2, h3, h4, h5, h6");
  headers.forEach(header => {
    const headerId = header.textContent.trim().replace(/\s+/g, "-").toLowerCase();
    header.id = headerId; // Add an ID for linking

    const listItem = document.createElement("li");
    listItem.style.marginLeft = `${(parseInt(header.tagName[1]) - 1) * 20}px`; // Indent based on header level
    listItem.innerHTML = `<a href="#${headerId}">${header.textContent}</a>`;

    tocElement.appendChild(listItem);
  });
}

function applySmoothScrolling() {
  $("a").on('click', function(event) {
    if (this.hash !== "") {
      event.preventDefault();
      const hash = this.hash;
      const targetElement = $(hash);
      const targetPosition = targetElement.offset().top - 100; // Offset for fixed header

      $('html, body').animate({ scrollTop: targetPosition }, 800, function() {
        window.location.hash = hash;
      });
    }
  });
}

function makeSidebarSticky(sidebarClass) {
  const sidebar = document.querySelector(sidebarClass);
  const sidebarContent = sidebar.querySelector('.sidebar_content');
  const offsetTop = 50; // Top offset for sticky positioning

  // Adjust the sidebar content height dynamically
  function updateSidebarPosition() {
    const windowHeight = window.innerHeight;
    const contentHeight = document.querySelector('.main_blog_container').offsetHeight;
    const sidebarHeight = Math.min(contentHeight - offsetTop, windowHeight - offsetTop);

    // Ensure the sidebar itself is relatively positioned to contain the sticky child
    sidebar.style.position = 'relative';
    sidebarContent.style.position = 'sticky';
    sidebarContent.style.top = `${offsetTop}px`;
    //sidebarContent.style.height = `${sidebarHeight}px`;
    sidebarContent.style.overflowY = 'auto'; // Allow scrolling within the sidebar content if needed
  }

  window.addEventListener('resize', updateSidebarPosition);
  window.addEventListener('scroll', updateSidebarPosition);
  updateSidebarPosition(); // Initial call
}

// Apply sticky behavior to both sidebars
makeSidebarSticky('.blog_sidebar');
makeSidebarSticky('.toc_sidebar');




// Handle hash change for navigation
window.addEventListener("hashchange", () => {
  const postName = decodeURIComponent(window.location.hash.substring(1));
  loadPost(postName);
});

// Initial load
fetchPostsList();
