const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/fonts");
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });

  // Builds a video iframe src from a Vimeo ID. Videos migrated to FrameRate
  // (listed in src/_data/framerate.json) use the FrameRate player; anything
  // else keeps its original Vimeo embed.
  const framerateIds = require("./src/_data/framerate.json");
  eleventyConfig.addFilter("videoSrc", function (id, opts = {}) {
    const color = opts.color ? String(opts.color).replace(/^#/, "") : "";
    const fr = framerateIds[String(id)];
    if (fr) {
      const p = [];
      if (opts.autoplay) p.push("autoplay=1", "muted=1");
      if (opts.loop) p.push("loop=1");
      if (opts.controls === false) p.push("show_controls=0", "initial_play_btn=0");
      if (color) p.push(`primary_color=%23${color}`);
      p.push("theme=minimal");
      return `https://framerate.tv/embed/${fr}?${p.join("&")}`;
    }
    // Kept on Vimeo on purpose (e.g. Blend): rebuild the original embed URL.
    const p = [];
    if (opts.hash) p.push(`h=${opts.hash}`);
    if (opts.autoplay) p.push("autoplay=1", "muted=1", "autopause=0");
    if (opts.loop) p.push("loop=1");
    if (opts.controls === false) p.push("controls=0");
    p.push("title=0&byline=0&portrait=0&like=0&share=0&watchlater=0");
    if (opts.full) p.push("pip=0&cc=0&transcript=0&save=0&collections=0");
    if (color) p.push(`color=${color}`);
    return `https://player.vimeo.com/video/${id}?${p.join("&")}`;
  });

  // Prev/next for a project when the visitor arrived directly (no listing page
  // stored its order): use the first section list that contains the project.
  const sectionOrder = require("./src/_data/sectionOrder.json");
  eleventyConfig.addFilter("sectionNeighbors", function (slug) {
    const lists = [sectionOrder.featured, sectionOrder.work, sectionOrder.play,
      [...sectionOrder.musicAlbums, ...sectionOrder.musicScores]];
    const list = lists.find((l) => l.includes(slug));
    if (!list) return {};
    const i = list.indexOf(slug);
    const url = (s) => (s ? `/projects/${s}/` : null);
    return { prev: url(list[i - 1]), next: url(list[i + 1]) };
  });

  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    extensions: "html",
    formats: ["webp"],
    widths: [400, 800, 1200, 1600],
    transformOnRequest: false,
    sharpWebpOptions: {
      quality: 80,
    },
    defaultAttributes: {
      loading: "lazy",
      decoding: "async",
    },
  });

  // style.min.css is generated from src/css/style.css on every build; edit
  // style.css only.
  eleventyConfig.on("eleventy.after", () => {
    const fs = require("fs");
    const path = require("path");
    const CleanCSS = require("clean-css");
    const result = new CleanCSS({ level: 1 }).minify(fs.readFileSync("src/css/style.css", "utf8"));
    if (result.errors.length) throw new Error("CSS minify failed: " + result.errors.join("; "));
    const outFile = path.join(eleventyConfig.directories.output, "css", "style.min.css");
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, result.styles);
  });

  // Link-preview image: a 1200px JPEG copy instead of the multi-MB original.
  const Image = require("@11ty/eleventy-img");
  const ogJobs = [];
  eleventyConfig.addFilter("ogImage", function (src) {
    const site = "https://justinlawes.com";
    if (!/\.(jpe?g|png|webp)$/i.test(src)) return site + src;
    const opts = {
      widths: [1200],
      formats: ["jpeg"],
      outputDir: require("path").join(eleventyConfig.directories.output, "img", "og"),
      urlPath: "/img/og/",
      sharpJpegOptions: { quality: 82 },
    };
    ogJobs.push(Image("./src" + src, opts));
    return site + Image.statsSync("./src" + src, opts).jpeg[0].url;
  });

  // src/images is passed through whole, but pages mostly use the optimised
  // copies in /img/. After the build, drop originals nothing references.
  eleventyConfig.on("eleventy.after", async () => {
    await Promise.all(ogJobs.splice(0));
    const fs = require("fs");
    const path = require("path");
    const out = eleventyConfig.directories.output;
    const imagesDir = path.join(out, "images");
    if (!fs.existsSync(imagesDir)) return;
    const walk = (d) => fs.readdirSync(d, { withFileTypes: true })
      .flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
    const referenced = new Set();
    for (const file of walk(out)) {
      if (!/\.(html|css|js|xml|json|txt)$/.test(file)) continue;
      const text = fs.readFileSync(file, "utf8");
      for (const m of text.matchAll(/\/images\/[^"'()\s,<>]+/g)) {
        referenced.add(decodeURIComponent(m[0].split(/[?#]/)[0]));
      }
    }
    let removed = 0, bytes = 0;
    for (const file of walk(imagesDir)) {
      const url = "/" + path.relative(out, file).split(path.sep).join("/");
      if (!referenced.has(url)) { bytes += fs.statSync(file).size; fs.unlinkSync(file); removed++; }
    }
    console.log(`[prune-images] removed ${removed} unreferenced files (${Math.round(bytes / 1048576)} MB)`);
  });

  return {
    pathPrefix: "/",
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
    },
  };
};
