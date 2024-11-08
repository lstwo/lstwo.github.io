const postsDir = `https://lstwo.github.io/blog/posts/`;
const postListElement = document.getElementById("post-list");
const contentElement = document.getElementById("content");
const tocListElement = document.getElementById("toc-list");

// Fetch and display the list of posts
async function fetchPostsList() {
  try {
    const response = await fetch(postsDir);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const links = Array.from(doc.querySelectorAll("a"));

    // Filter to only include Markdown files and decode file names
    const markdownFiles = links
      .filter(link => link.href.endsWith(".md"))
      .map(link => decodeURIComponent(link.href.split("/").pop().replace(".md", "")));

    // Sort the list in reverse alphabetical order
    markdownFiles.sort((a, b) => b.localeCompare(a));

    // Process each Markdown file
    markdownFiles.forEach(postName => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `<a href="#${encodeURIComponent(postName)}" onclick="loadPost('${encodeURIComponent(postName)}')">${postName}</a>`;
      postListElement.appendChild(listItem);
    });

    // Load post if a hash is present in the URL
    if (window.location.hash) {
      loadPost(decodeURIComponent(window.location.hash.substring(1).split('#')[0])); // load post based on hash before any section
    }
  } catch (error) {
    console.error("Failed to fetch posts list", error);
  }
}

// Load and display a Markdown post with TOC generation
async function loadPost(postName) {
  try {
    const response = await fetch(`${postsDir}${encodeURIComponent(postName)}.md`);
    if (!response.ok) throw new Error("Post not found");

    const markdown = await response.text();
    const htmlContent = marked.parse(markdown);
    contentElement.innerHTML = htmlContent;

    // Generate the Table of Contents
    generateTOC(postName);
    
    // Update the URL hash to include the post name
    window.location.hash = encodeURIComponent(postName);  // Set the post hash

  } catch (error) {
    console.error(`Failed to load post: ${postName}`, error);
    contentElement.innerHTML = "<p>Post not found!</p>";
    tocListElement.innerHTML = "";
  }
}

// Generate Table of Contents from the headers in the content
function generateTOC(postName) {
  tocListElement.innerHTML = ""; // Clear previous TOC
  const headers = contentElement.querySelectorAll("h1, h2, h3, h4, h5, h6");

  headers.forEach(header => {
    const headerText = header.textContent;
    const headerId = headerText.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");
    header.id = headerId; // Set an ID for linking

    const listItem = document.createElement("li");
    const headerLevel = parseInt(header.tagName.substring(1)); // Get the header level (1 for h1, 2 for h2, etc.)
    
    // Apply margin-left based on header level for indentation
    listItem.style.marginLeft = `${(headerLevel - 1) * 20}px`;
    
    // Create TOC link with the post hash and section hash
    listItem.innerHTML = `<a href="#${postName}#${headerId}" onclick="scrollToSection('${postName}', '${headerId}', event)">${headerText}</a>`;
    tocListElement.appendChild(listItem);
  });
}

// Scroll to the section corresponding to the header with offset
function scrollToSection(postName, headerId, event) {
  event.preventDefault(); // Prevent default link navigation

  const targetSection = document.getElementById(headerId);
  if (targetSection) {
    // Calculate the offset position
    const offset = 100;  // Set the offset value
    const targetPosition = targetSection.getBoundingClientRect().top + window.scrollY - offset;

    // Scroll to the target position with the offset
    window.scrollTo({ top: targetPosition, behavior: "smooth" });

    // Update the hash to include both post and section ID
    window.location.hash = `${encodeURIComponent(postName)}#${headerId}`;
  }
}


// Listen for hash changes to load posts
window.addEventListener("hashchange", () => {
  const hash = decodeURIComponent(window.location.hash.substring(1));
  const [postName, sectionId] = hash.split('#');

  if (postName) {
    loadPost(postName);
    if (sectionId) {
      const targetSection = document.getElementById(sectionId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }
});

// Initial load of the post list
fetchPostsList();
