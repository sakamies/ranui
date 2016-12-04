jQuery.fn.selectText = function(){
  const doc = document;
  const element = this[0];
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(element);
  selection.removeAllRanges();
  selection.addRange(range);
};
