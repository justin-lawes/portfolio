const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/fonts");
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });

  // Builds a video iframe src from a Vimeo ID. Videos migrated to FrameRate
  // (listed in src/_data/framerate.json) use the FrameRate player; anything
  // else falls back to Vimeo and warns at build time.
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
    console.warn(`[videoSrc] Vimeo ${id} has no FrameRate ID; still using Vimeo`);
    const p = [];
    if (opts.autoplay) p.push("autoplay=1", "muted=1", "autopause=0");
    if (opts.loop) p.push("loop=1");
    if (opts.controls === false) p.push("controls=0");
    p.push("title=0&byline=0&portrait=0&like=0&share=0&watchlater=0");
    if (color) p.push(`color=${color}`);
    return `https://player.vimeo.com/video/${id}?${p.join("&")}`;
  });

  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    extensions: "html",
    formats: ["webp"],
    widths: [400, 800, 1200, "auto"],
    transformOnRequest: false,
    sharpWebpOptions: {
      quality: 90,
    },
    defaultAttributes: {
      loading: "lazy",
      decoding: "async",
    },
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
