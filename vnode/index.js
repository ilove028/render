class Vnode {
  constructor(tag, data, children) {
    this.__isVnode = true
    this.tag = tag
    this.data = data
    this.el = null
    this.setType(this.tag, children)
    this.setChildrenAndType(children)
  }
  setType(tag, children) {
    if (typeof tag === 'string') {
      this.type = 
        /svg/i.test(tag) ?
          VNODE_TYPES.ELEMENT_SVG :
          VNODE_TYPES.ELEMENT_HTML
    } else if (typeof tag === 'function') {
      this.type = this.tag instanceof Element ?
        VNODE_TYPES.COMPONENT_STATEFUL_NORMAL :
        VNODE_TYPES.COMPONENT_FUNCTIONAL
    } else if (tag === Symbol.for('fragment')) {
      this.type = VNODE_TYPES.FRAGMENT
    } else if (tag === Symbol.for('portal')) {
      this.tag = this.data.target
      this.type = VNODE_TYPES.PORTAL
    } else {
      this.type = this.isComment(children) ?
        VNODE_TYPES.COMMENT :
        VNODE_TYPES.TEXT
    }
  }
  setChildrenAndType(children) {
    if (children === undefined || children === null) {
      this.childType = CHILD_TYPES.NO_CHILDREN
      this.children = null
    } else if (Array.isArray(children)) {
      if (children.length === 0) {
        this.childType = CHILD_TYPES.NO_CHILDREN
        this.children = null
      } else if (children.length === 1) {
        this.childType = CHILD_TYPES.SINGLE_VNODE
        this.children = children[0]
      } else {
        this.children = this.normalizeChildren(children)
        this.childType = CHILD_TYPES.KEYED_VNODES
      }
    } else if (children instanceof Vnode) {
      this.childType = CHILD_TYPES.SINGLE_VNODE
      this.children = children
    } else {
      this.childType = CHILD_TYPES.SINGLE_VNODE
      this.children = this.type & VNODE_TYPES.TEXT_COMMENT ?
        (this.isComment(children) ? 
          /^<!--(.*)-->$/.exec(children)[1] :
          children) :
        (this.isComment(children) ?
          Vnode.createCommentVnode(`${children}`) :
          Vnode.createTextVnode(`${children}`))
    }
  }
  normalizeChildren(children) {
    return children.map(
      (child, index) => {
        if (child.key) {
          return child
        } else {
          child.key = `|${index}`
          return child
        }
      }
    )
  }
  isComment(text) {
    return /^<!--(.*)-->$/.test(text)
  }
}

Vnode.createTextVnode = function(text) {
  // 此处将text node处理成只有文本children的vnode
  return new Vnode(null, null, text)
}

Vnode.createCommentVnode = function(comment) {
  return new Vnode(null, null, `<!-- ${comment} -->`)
}
