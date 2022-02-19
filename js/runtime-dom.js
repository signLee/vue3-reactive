// 运行时的包，里边放着DOM操作的方法
const nodeOps = {
  insert(child, parent, anchor) {
    if (anchor) {
      parent.insertBefore(child, anchor);
    } else {
      parent.appendChild(child);
    }
  },
  remove(child) {
    const parent = child.parentNode;/*  */
    parent && parent.removeChild(child);
  },
  createElement(tag) {
    return document.createElement(tag);
  },
  hostSetElementText(el, text) {
    el.textContent = text;
  },
};
