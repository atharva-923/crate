function imageForProduct(productId) {
  return `https://picsum.photos/seed/crate-${encodeURIComponent(productId)}/700/875`;
}

module.exports = { imageForProduct };
