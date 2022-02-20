let activieEffect;
function effect(fn) {
  // effect需要默认执行一次
  activieEffect = fn; //数据变更的时候会调用这个方法
  fn();
  activieEffect = null
}
// 默认值代理第一层
function reactive(target) {
  return new Proxy(target, {
    set(target, key, value, receiver) {
      const res = Reflect.set(target, key, value, receiver);//receiver当前元素
      trigger(target,key)//触发更新
      return res;
    },
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver)
      track(target,key)//依赖收集
      return res;
    },
  });
}

const targetMap = new WeakMap()
function track(target,key){
    let depsMap = targetMap.get(target)
    if(!depsMap){
        targetMap.set(target,(depsMap = new Map()))
    }
    let deps = depsMap.get(key)
    if(!deps){
        depsMap.set(key,(deps = new Set()))
    }
    if(activieEffect && !deps.has(activieEffect)){
        deps.add(activieEffect)
    }
    console.log(targetMap)
}
function trigger(target,key){
    const depsMap = targetMap.get(target)
    if(!depsMap) return;
    const effects = depsMap.get(key)
    effects && effects.forEach(effect => effect());
}
