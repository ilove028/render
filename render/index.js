function render(vnode, container) {
  const preVnode = container.vnode
  if (preVnode) {
    if (vnode) {
      patch(preVnode, vnode, container)
      container.vnode = vnode
    } else {
      container.removeChild(preVnode.el)
      container.vnode = null
    }
  } else {
    if (vnode) {
      mount(vnode, container)
      container.vnode = vnode
    }
  }
}

function mount(vnode, container) {
  const { type } = vnode
  if (type & VNODE_TYPES.ELEMENT) {
    // 挂载普通标签
    mountElement(vnode, container)
  } else if (type & VNODE_TYPES.COMPONENT) {
    // 挂载组件
    mountComponent(vnode, container)
  } else if (type & VNODE_TYPES.FRAGMENT) {
    // 挂载 Fragment
    mountFragment(vnode, container)
  } else if (type & VNODE_TYPES.PORTAL) {
    // 挂载 Portal
    mountPortal(vnode, container)
  } else if (type & VNODE_TYPES.COMMENT) {
    // 挂载注释
    mountComment(vnode, container)
  } else {
    // 挂载纯文本
    mountText(vnode, container)
  } 
}

function patchData(el, preData, nextData) {
  if (nextData) {
    for(let key in nextData) {
      switch (key) {
        case 'style': {
          for (let s in nextData.style) {
            el.style[s] = nextData.style[s]
          }
          break
        }
        case 'class': {
          // 因为className会覆盖原来的所以不用处理pre
          // https://codesandbox.io/s/397w7kxy1
          const classes = []
          nextData.class.forEach(c => {
            if (typeof c === 'string') {
              classes.push(c.split(/s+/))
            } else if (Array.isArray(c)) {
              classes.push(...c)
            } else {
              for (let key in c) {
                if (c[key]) {
                  classes.push(key)
                }
              }
            }
          })
          el.className = classes.join(' ')
          break
        }
        default: {
          if (/^(value|checked|selected|muted)$/i.test(key)) {
            // 这个也是唯一所以不用处理predata
            el[key] = nextData[key]
          } else if (/^on/i.test(key)) {
            el.addEventListener(key.substr(2), nextData[key])
          } else {
            el.setAttribute(key, nextData[key])
          }
        }
      }
    }
  }
  if (preData) {
    for (let key in preData) {
      switch (key) {
        case 'style': {
          for (let s in preData.style) {
            if (preData.style[s] && (!nextData.style || nextData.style[s])) {
              el.style[s] = ''
            }
          }
          break
        }
        default: {
          if (/^on/i.test(key)) {
            if(preData[key] && (!nextData[key] || preData[key] !== nextData[key])) {
              el.removeEventListener(key.substr(2), preData[key])
            }
          } else if (!/^(value|checked|selected|muted)$/i.test(key)) {
            if (preData[key] && !nextData[key]) {
              el.removeAttribute(key)
            }
          }
        }
      }
    }
  }
}

function mountElement(vnode, container) {
  const { tag, type, data, children, childType } = vnode
  const el = type & VNODE_TYPES.ELEMENT_SVG ?
    document.createElementNS('http://www.w3.org/2000/svg', tag) :
    document.createElement(tag)
  vnode.el = el
  patchData(vnode.el, null, data)
  if (childType & CHILD_TYPES.SINGLE_VNODE) {
    mount(children, el)
  } else if (childType & CHILD_TYPES.MULTIPLE_VNODES) {
    children.forEach(child => {
      mount(child, el)
    })
  }
  container.appendChild(el)
}

function mountText(vnode, container) {
  const node = document.createTextNode(vnode.children)
  vnode.el = node
  container.appendChild(node)
}

function mountComment(vnode, container) {
  const node = document.createComment(vnode.children)
  vnode.el = node
  container.appendChild(node)
}

function mountFragment(vnode, container) {
  const { children, childType } = vnode
  if (childType & CHILD_TYPES.SINGLE_VNODE) {
    mount(children, container)
    vnode.el = children.el
  } else if (childType & CHILD_TYPES.NO_CHILDREN) {
    const cvnode = Vnode.createCommentVnode(Symbol.for('fragment').toString())
    mount(cvnode, container)
    vnode.el = cvnode.el
  } else {
    children.forEach(child => {
      mount(child, container)
    })
    vnode.el = children[0].el
  }
}

function mountPortal(vnode, container) {
  // 
  const { tag, children, childType } = vnode
  // 获取挂载点
  const target = typeof tag === 'string' ? document.querySelector(tag) : tag

  if (childType & CHILD_TYPES.SINGLE_VNODE) {
    // 将 children 挂载到 target 上，而非 container
    mount(children, target)
  } else if (childType & CHILD_TYPES.MULTIPLE_VNODES) {
    for (let i = 0; i < children.length; i++) {
      // 将 children 挂载到 target 上，而非 container
      mount(children[i], target)
    }
  }

  const cvnode = Vnode.createCommentVnode('portal')
  mountComment(cvnode, container)
}

function mountComponent(vnode, container) {
  if (vnode.type & VNODE_TYPES.COMPONENT_STATEFUL) {
    mountStatefulComponent(vnode, container)
  } else {
    mountFunctionalComponent(vnode, container)
  }
}

function mountStatefulComponent(vnode, container) {
  // 创建组件实例
  const instance = new vnode.tag()
  // 渲染VNode
  instance.$vnode = instance.render()
  // 挂载
  mount(instance.$vnode, container)
  // el 属性值 和 组件实例的 $el 属性都引用组件的根DOM元素
  instance.$el = vnode.el = instance.$vnode.el
}

function mountFunctionalComponent(vnode, container, isSVG) {
  // 获取 VNode
  const $vnode = vnode.tag()
  // 挂载
  mount($vnode, container, isSVG)
  // el 元素引用该组件的根元素
  vnode.el = $vnode.el
}
