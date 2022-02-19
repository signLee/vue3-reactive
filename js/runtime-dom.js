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
    const parent = child.parentNode; /*  */
    parent && parent.removeChild(child);
  },
  createElement(tag) {
    return document.createElement(tag);
  },
  hostSetElementText(el, text) {
    el.textContent = text;
  },
  //   属性操作
  hostPatchProps(el, key, value) {
    if (/^on[^a-z]/.test(key)) {
      // 事件
      const eventName = key.slice(2).toLowerCase();
      el.addEventListener(eventName, value);
    } else {
      //   其它属性
      if (key === "style") {
        for (let key in value) {
          el.style[key] = value[key];
        }
      }else{
          el.setAttribute(key,value)
      }
    }
  },
};
