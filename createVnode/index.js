function createVnode(tag, data = null, children = null) {
  return new Vnode(tag, data, children)
}