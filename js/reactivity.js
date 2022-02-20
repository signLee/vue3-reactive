let activieEffect;
function effect(fn) {
  // effect需要默认执行一次
  activieEffect = fn; //数据变更的时候会调用这个方法
  fn();
}
// 默认值代理第一层
function reactive(target) {
  return new Proxy(target, {
    set(target, key, value, receiver) {
      const res = Reflect.set(target, key, value, receiver);//receiver当前元素
      res && activieEffect();
      return res;
    },
    // get(target, key, receiver) {
    //   if (typeof target[key] == "object") {
    //     return reactive(target[key]); //递归代理
    //   }
    // },
  });
}
