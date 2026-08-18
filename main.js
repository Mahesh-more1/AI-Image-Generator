const themeToggler = document.querySelector(".container .theme-toggler");
const generatePromptBtn = document.querySelector(
  ".container .input-message .generate-btn"
);
const promptForm = document.querySelector(".container .image-generator-form");
const promptInput = document.querySelector(".container #message");
const modelSelect = document.querySelector(".container #select-model");
const countSelect = document.querySelector(".container #select-count");
const ratioSelect = document.querySelector(".container #select-ratio");
const gridGallery = document.querySelector(".container .gallery-grid");
const generateBtn = document.querySelector(".container .actions .generate-btn");

const API_KEY = localStorage.getItem("hf_api_key") || "";

const examplePrompts = [
  "A magic forest with glowing plants and fairy homes among giant mushrooms",
  "An old steampunk airship floating through golden clouds at sunset",
  "A future Mars colony with glass domes and gardens against red mountains",
  "A dragon sleeping on gold coins in a crystal cave",
  "An underwater kingdom with merpeople and glowing coral buildings",
  "A floating island with waterfalls pouring into clouds below",
  "A witch's cottage in fall with magic herbs in the garden",
  "A robot painting in a sunny studio with art supplies around it",
  "A magical library with floating glowing books and spiral staircases",
  "A Japanese shrine during cherry blossom season with lanterns and misty mountains",
  "A cyberpunk cityscape with neon lights and flying cars at midnight",
  "A hidden village in the clouds with floating bridges and glowing waterfalls",
  "A deep jungle temple covered in vines and glowing ancient runes",
  "A mystical desert with giant crystal formations under a starry sky",
  "A futuristic underwater research station surrounded by glowing sea creatures",
  "A grand palace made of ice, shining under the northern lights",
  "An enchanted garden where bioluminescent flowers bloom at night",
  "A space station orbiting a distant planet with a view of twin suns",
  "A portal opening in the middle of a dark forest, leading to another dimension",
  "A lonely lighthouse on a stormy cliff, with ghostly figures in the mist",
  "A massive floating whale carrying an entire city on its back",
  "A hidden library buried deep underground, filled with ancient scrolls",
  "A village where the houses are built inside giant tree trunks",
  "A secret laboratory experimenting with alien technology",
  "A train speeding through a tunnel of stars in a dreamlike landscape",
  "A golden temple floating above a lake of liquid light",
  "A marketplace in a magical city, where traders sell potions and enchanted artifacts",
  "A mountain peak where an ancient dragon guards a glowing crystal",
  "A mysterious door in the middle of a desert, leading to an unknown world",
  "A castle made of clouds, shifting and changing shape in the sky",
];

(() => {
  const savedTheme = localStorage.getItem("theme");
  const savedPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  const isDarkTheme =
    savedTheme === "dark" || (!savedTheme && savedPrefersDark);
  document.body.classList.toggle("dark-theme", isDarkTheme);
  themeToggler.querySelector("img").setAttribute("src", "svgs/night.svg");
})();

const toggleTheme = () => {
  const isDarkTheme = document.body.classList.toggle("dark-theme");

  localStorage.setItem("theme", isDarkTheme ? "dark" : "light");

  isDarkTheme
    ? themeToggler.querySelector("img").setAttribute("src", "svgs/night.svg")
    : themeToggler.querySelector("img").setAttribute("src", "svgs/light.svg");
};

const getImgDimension = (imgAspectRatio, baseSize = 512) => {
  const [width, height] = imgAspectRatio.split("/").map(Number);
  const scaleFactor = baseSize / Math.sqrt(width * height);

  let newWidth = Math.floor(width * scaleFactor);
  let newHeight = Math.floor(height * scaleFactor);

  // Ensure dimensions are multiples of 16
  newWidth = Math.floor(newWidth / 16) * 16;
  newHeight = Math.floor(newHeight / 16) * 16;

  return { width: newWidth, height: newHeight };
};

const updateImgCard = (imgIndex, imgUrl) => {
  const imgCard = document.getElementById(`img-card-${imgIndex}`);
  const resultImg = imgCard.querySelector(".result-img");
  const statusContainer = imgCard.querySelector(".status-container");

  if (!imgCard) return;
  imgCard.classList.remove("loading");
  imgCard.innerHTML = `<img src="${imgUrl}" class="result-img" alt="Generated Image" />
              <div class="img-overlay">
                <a href="${imgUrl}" class="img-download-btn" type="button" download="${Date.now()}.png">
                  <img src="svgs/download.svg" alt="Download" />
                </a>
              </div>`;
};

const generateImages = async (
  selectModel,
  imgCount,
  imgAspectRatio,
  promptText
) => {
  const MODEL_URL = `https://api-inference.huggingface.co/models/${selectModel}`;
  const { width, height } = getImgDimension(imgAspectRatio);
  generateBtn.setAttribute("disabled", "true");

  const imgPromises = Array.from({ length: imgCount }, async (_, i) => {
    try {
      const response = await fetch(MODEL_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "x-use-cache": "false",
        },
        body: JSON.stringify({
          inputs: promptText,
          parameters: {
            width,
            height,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${errorText}`);
      }

      // Handle the response as a binary blob
      const blob = await response.blob();
      const imgUrl = URL.createObjectURL(blob);

      updateImgCard(i, imgUrl);
    } catch (error) {
      console.error("ERROR: ", error);
      const imgCard = document.getElementById(`img-card-${i}`);
      imgCard.classList.replace("loading", "error");
      imgCard.querySelector(".status-text").textContent =
        "Error generating image";
      imgCard.querySelector("img[src='svgs/error.svg']").style.display =
        "block";
    }
  });

  await Promise.allSettled(imgPromises);
  generateBtn.removeAttribute("disabled");
};

const createImgCard = (selectModel, imgCount, imgAspectRatio, promptText) => {
  gridGallery.innerHTML = "";
  for (let i = 0; i < imgCount; i++) {
    gridGallery.innerHTML += `<div class="img-card loading" id="img-card-${i}" style="aspect-ratio:${imgAspectRatio}">
            <div class="status-container">
              <div class="spinner"></div>
              <img src="svgs/error.svg" alt="" />
              <div class="status-text">Generating...</div>
            </div>
            <img src="" class="result-img" alt="Generated Image" />
          </div>`;
  }

  generateImages(selectModel, imgCount, imgAspectRatio, promptText);
};

const handleFormSubmit = (e) => {
  e.preventDefault();

  const selectModel = modelSelect.value;
  const imgCount = parseInt(countSelect.value) || 1;
  const imgAspectRatio = ratioSelect.value || "1/1";
  const promptText = promptInput.value.trim();

  console.log(selectModel, imgCount, imgAspectRatio, promptText);
  createImgCard(selectModel, imgCount, imgAspectRatio, promptText);
};

generatePromptBtn.addEventListener("click", () => {
  const prompt =
    examplePrompts[Math.floor(Math.random() * examplePrompts.length)];

  console.log(prompt);
  promptInput.value = prompt;
  promptInput.focus();
});

promptForm.addEventListener("submit", handleFormSubmit);

themeToggler.addEventListener("click", toggleTheme);
