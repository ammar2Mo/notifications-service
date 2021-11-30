module.exports = () => ({
  chunk: (array, size) => {
    const arrays = [];
    let index = 0;
    while (index < array.length) {
      arrays.push(array.slice(index, size + index));
      index += size;
    }
    return arrays;
  },
});
