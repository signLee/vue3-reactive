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
function patch(n1, n2, container, anchor) {
  // 如果是n2的tag是string的话，则标明是个标签
  // 如果是组件的话 tag 可能是一个对象
  if (typeof n2.tag === "string") {
    // 标签
    processElement(n1, n2, container, anchor);
  } else if (typeof n2.tag === "object") {
    // 组件渲染
    mountComponent(n2, containe);
  }
}
//元素比对
function processElement(n1, n2, container, anchor) {
  if (n1 == null) {
    mountElement(n2, container, anchor); // 初次渲染
  } else {
    patchElement(n1, n2, container); // diff操作
  }
}
function patchElement(n1, n2, container) {
  let el = (n2.el = n1.el); //这里不做tag不一样的处理, 节点一样的情况下做节点复用
  const oldProps = n1.props;
  const newProps = n2.props;
  patchProps(el, oldProps, newProps);
  patchChildren(n1, n2, el);
}
function patchChildren(n1, n2, container) {
  const c1 = n1.children;
  const c2 = n2.children;
  if (typeof c2 == "string") {
    if (c1 !== c2) {
      nodeOps.hostSetElementText(container, c2);
    }
  } else {
    // 新的子节点为数组
    if (typeof c1 == "string") {
      nodeOps.hostSetElementText(container, "");
      mountChildren(c2, container);
    } else {
      patchKeyedChildren(c1, c2, container);
    }
  }
}

function patchKeyedChildren(c1, c2, container) {
  let e1 = c1.length - 1;
  let e2 = c2.length - 1;
  // 内部优化处理  头头比较  尾尾比较  头尾比较  尾头比较
  const keyedToNewIndexMap = new Map();
  // 根据新节点生成一个key->index的映射表
  for (let i = 0; i <= e2; i++) {
    const currentEle = c2[i];
    keyedToNewIndexMap.set(currentEle.props.key, i);
  }
  const newIndexToOldIndexMap = new Array(e2 + 1); // 用于标记新的数组对应的索引是值是否有被patch过
  for (let i = 0; i < e2; i++) {
    newIndexToOldIndexMap[i] = -1;
  }
  // 去老的里边找，看有没有对应的。如果有一样的就复用，新的比老的多做添加处理，老的比新的多就删除
  for (let i = 0; i <= e1; i++) {
    const oldVnode = c1[i];
    let newIndex = keyedToNewIndexMap.get(oldVnode.props.key);
    if (newIndex == undefined) {
      // 老的节点在新的里边不存在
      nodeOps.remove(oldVnode.el);
    } else {
      // 复用并且比对属性
      newIndexToOldIndexMap[newIndex] = i + 1;
      patch(oldVnode, c2[newIndex], container);
    }
  }
  // 以上方法仅仅是比对和删除无用节点，没有移动操作
  let sequence = getSequence(newIndexToOldIndexMap); // 两个key一样的情况 比较属性，移动
  let j = sequence.length - 1;
  for (let i = e2; i >= 0; i--) {
    let currentEle = c2[i];
    const anchor = i + 1 <= e2 ? c2[i + 1].el : null;
    // 新的比老的多
    if (newIndexToOldIndexMap[i] === -1) {
      // 新增元素，插入到列表中
      patch(null, currentEle, container, anchor);
    } else {
      if (i == sequence[j]) {
        j--;
      } else {
        // 根据最长递增子序列，来确定不需要移动的元素直接跳过
        nodeOps.insert(currentEle.el, container, anchor);
      }
    }
  }
}

function getSequence(arr) {
  const result = [0];
  let p = arr.slice();
  let len = arr.length;
  let i, j, u, v, c;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = ((u + v) / 2) | 0;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}
function patchProps(el, oldProps, newProps) {
  if (oldProps !== newProps) {
    // 比较属性：如果新的属性和老的属性不一致，则以新的为准
    for (let key in newProps) {
      const p = oldProps[key];
      const n = newProps[key];
      if (n !== p) {
        nodeOps.hostPatchProps(el, key, p, n);
      }
    }
    // 如果老的里边有的属性，新的里边没有，则将老的里边多余的删掉
    for (let key in oldProps) {
      if (!newProps.hasOwnProperty(key)) {
        nodeOps.hostPatchProps(el, key, oldProps[key], null);
      }
    }
  }
}
// 挂载元素
function mountElement(vnode, container, anchor) {
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
  nodeOps.insert(el, container, anchor);
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
