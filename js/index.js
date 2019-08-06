render(
  createVnode(
    'h1',
    { style: { color: 'red', background: 'blue' }, onclick() { console.info('pre') } },
    [
      createVnode(
        Symbol.for('fragment'),
        null,
        [
          Vnode.createTextVnode('纯文案'),
          createVnode(
            'span',
            { class: ['inner a', ['hello'], { 'test': true, 'nice': false } ] },
            '我在内部1'
          ),
          createVnode(
            'span',
            { class: ['inner a', ['hello'], { 'test': true, 'nice': false } ] },
            '我在内部2'
          ),
          createVnode(
            'span',
            { class: ['inner a', ['hello'], { 'test': true, 'nice': false } ] },
            '我在内部3'
          )
        ]
      ),
      createVnode(
        'input',
        {
          class: ['form-control'],
          value: 'Init',
          oninput: function(e) {
            const value = e.target.value
            e.target.value = value.replace(/\D/g, '')
          }
        },
        null
      ),
      createVnode(
        Symbol.for('portal'),
        {
          target: '#modal-point'
        },
        createVnode(
          'div',
          null,
          '我是悬浮'
        )
      )
    ]
  ),
  document.getElementById('app')
)

setTimeout(() => {
  render(
    createVnode(
      'h1',
      {
        class: ['green'],
        onclick() { console.info('next') }
      },
      'empty'
    ),
    document.getElementById('app')
  )
}, 5000)