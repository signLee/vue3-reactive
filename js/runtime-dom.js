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
  hostPatchProps(el, key, prevProps, nextProps) {
    if (/^on[^a-z]/.test(key)) {
      // 以on开头的事件
      const eventName = key.slice(2).toLowerCase();
      // 更新事件
      prevProps && el.removeEventListener(eventName, prevProps)
      nextProps && el.addEventListener(eventName, nextProps);
    } else {
      if (nextProps == null) {
        return el.removeAttribute(key)
      }
      //   其它属性
      if (key === "style") {
        // 用新的属性更换老的属性
        for (let key in nextProps) {
          el.style[key] = nextProps[key];
        }
        // 老的里边有，新的里边没有的进行删除处理
        for (let key in prevProps) {
          if (!nextProps.hasOwnProperty(key)) {
            el.style[key] = null
          }
        }
      } else {
        el.setAttribute(key, nextProps)
      }
    }
  },
};
