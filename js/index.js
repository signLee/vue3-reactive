// 1.初次渲染  2.dom-diff
function render(vnode, container) {
  patch(container._vnode, vnode, container);
  container._vnode = vnode; // 保存上一次的虚拟节点
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
    processElement(n1, n2, container);
  } else if (typeof n2.tag === "object") {
    // 组件渲染
    mountComponent(n2, container);
  }
}
//元素比对
function processElement(n1, n2, container) {
  if (n1 == null) {
    mountElement(n2, container) // 初次渲染
  } else {
    patchElement(n1, n2, container)// diff操作
  }
}
function patchElement(n1, n2, container) {
  let el = n2.el = n1.el;//这里不做tag不一样的处理, 节点一样的情况下做节点复用
  const oldProps = n1.props;
  const newProps = n2.props;
  patchProps(el, oldProps, newProps);
}
function patchProps(el, oldProps, newProps) {
  if (oldProps !== newProps) {
    // 比较属性：如果新的属性和老的属性不一致，则以新的为准
    for (let key in newProps) {
      const p = oldProps[key]
      const n = newProps[key]
      if (n !== p) {
        nodeOps.hostPatchProps(el, key, p, n)
      }
    }
    // 如果老的里边有的属性，新的里边没有，则将老的里边多余的删掉
    for (let key in oldProps) {
      if (!newProps.hasOwnProperty(key)) {
        nodeOps.hostPatchProps(el, key, oldProps[key], null)
      }
    }
  }
}
// 挂载元素
function mountElement(vnode, container) {
  const { tag, children, props } = vnode;
  // 将虚拟节点和真实节点创造映射关系
  let el = (vnode.el = nodeOps.createElement(tag));
  if (props) {
    for (let key in props) {
      nodeOps.hostPatchProps(el, key, {}, props[key]);
    }
  }
  if (Array.isArray(children)) {
    mountChildren(children, el);
  } else {
    nodeOps.hostSetElementText(el, children);
  }
  nodeOps.insert(el, container);
}
// 组件挂载
function mountComponent(vnode, container) {
  // 根据组件创建一个实例
  const instance = {
    vnode,
    render: null, //当前setup的返回值
    subTree: null, // render的返回结果
  };
  const Component = vnode.tag;
  instance.render = Component.setup(vnode.props, instance);
  effect(() => {
    instance.subTree = instance.render && instance.render();
    patch(null, instance.subTree, container); // 将组件插入到容器中
  });
}

function mountChildren(children, container) {
  for (let i = 0; i < children.length; i++) {
    let child = children[i];
    patch(null, child, container); //递归挂载子节点
  }
}
