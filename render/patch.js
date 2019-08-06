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
  // 没有处理子元素
  container.removeChild(prevVNode.el)
  mount(vnode, container)
}

function patchElement(prevVNode, vnode, container) {
  if (prevVNode.tag === vnode.tag) {
    vnode.el = prevVNode.el
    patchData(vnode.el, prevVNode.data, vnode.data)
    patchChildren(prevVNode.childType, vnode.childType, prevVNode.children, vnode.children, vnode.el)
  } else {
    replaceNode(prevVNode, vnode, container)
  }
}

function patchChildren(preChildType, nextChildType, preChildren, nextChildren, el) {
  if (preChildType & CHILD_TYPES.NO_CHILDREN) {
    if (nextChildType & CHILD_TYPES.SINGLE_VNODE) {
      mount(nextChildren, el)
    } else if (nextChildType & CHILD_TYPES.MULTIPLE_VNODES) {
      nextChildren.forEach(child => {
        mount(child, el)
      })
    }
  } else if (preChildType & CHILD_TYPES.SINGLE_VNODE) {
    if (nextChildType & CHILD_TYPES.NO_CHILDREN) {
      el.removeChild(preChildren.el)
    } else if (nextChildType & CHILD_TYPES.SINGLE_VNODE) {
      patch(preChildren, nextChildren, el)
    } else if (nextChildType & CHILD_TYPES.MULTIPLE_VNODES) {
      el.removeChild(preChildren.el)
      nextChildren.forEach(child => {
        mount(child, el)
      })
    }
  } else if (preChildType & CHILD_TYPES.MULTIPLE_VNODES) {
    if (nextChildType & CHILD_TYPES.NO_CHILDREN) {
      preChildren.forEach(child => {
        el.removeChild(child.el)
      })
    } else if (nextChildType & CHILD_TYPES.SINGLE_VNODE) {
      preChildren.forEach(child => {
        el.removeChild(child.el)
      })
      mount(nextChildren, el)
    } else if (nextChildType & CHILD_TYPES.MULTIPLE_VNODES) {
      preChildren.forEach(child => {
        el.removeChild(child.el)
      })
      nextChildren.forEach(child => {
        mount(child, el)
      })
    }
  }
}