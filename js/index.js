// 1.初次渲染  2.dom-diff
function render(vnode, container) {
  patch(null, vnode, container);
}

/**
 *
 * @param {*} n1 老的虚拟节点
 * @param {*} n2 新的虚拟节点
 * @param {*} container 容器
 */

// 视图渲染
function patch(n1, n2, container) {
  // 如果是n2的tag是string的话，则标明是个标签
  // 如果是组件的话 tag 可能是一个对象
  if (typeof n2.tag === "string") {
    // 标签
    mountElement(n2, container);
  } else if (typeof n2.tag === "object") {
    // 组件渲染
  }
}
// 挂载元素
function mountElement(vnode, container) {
  const { tag, children, props } = vnode;
  // 将虚拟节点和真实节点创造映射关系
  let el = (vnode.el = nodeOps.createElement(tag));
  if (props) {
    for (let key in props) {
      nodeOps.hostPatchProps(el, key, props[key]);
    }
  }
  if (Array.isArray(children)) {
    mountChildren(children, el);
  } else {
    nodeOps.hostSetElementText(el, children);
  }
  nodeOps.insert(el, container);
}

function mountChildren(children, container) {
  for (let i = 0; i < children.length; i++) {
    let child = children[i];
    patch(null, child, container); //递归挂载子节点
  }
}
