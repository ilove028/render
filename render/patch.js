function patch(prevVNode, nextVNode, container) {
  const { type: preType } = prevVNode
  const { type: nextType } = nextVNode
  if (preType !== nextType) {
    replaceNode(prevVNode, vnode, container)
  } else if (nextType & VNODE_TYPES.ELEMENT) {
    patchElement(prevVNode, nextVNode, container)
  } else if (nextType & VNODE_TYPES.COMPONENT) {
    patchComponent(prevVNode, nextVNode, container)
  } else if (nextType & VNODE_TYPES.TEXT) {
    patchText(prevVNode, nextVNode)
  } else if (nextType & VNODE_TYPES.FRAGMENT) {
    patchFragment(prevVNode, nextVNode, container)
  } else if (nextType & VNODE_TYPES.PORTAL) {
    patchPortal(prevVNode, nextVNode)
  } else if (nextType & VNODE_TYPES.COMMENT) {
    patchComment(prevVNode, nextType, container)
  }
}

function replaceNode(prevVNode, vnode, container) {
  // 没有处理子元素？
  container.removeChild(prevVNode.el)
  mount(vnode, container)
}

function patchElement(prevVNode, vnode, container) {
  if (prevVNode.tag === vnode.tag) {
    vnode.el = prevVNode.el
    patchData(vnode.el, prevVNode.data, vnode.data)
  } else {
    container.removeChild(prevVNode.el)
    mount(vnode, container)
  }
}