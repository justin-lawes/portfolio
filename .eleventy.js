module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/fonts");

  return {
    pathPrefix: process.env.GITHUB_ACTIONS ? "/portfolio/" : "/",
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
    },
  };
};
