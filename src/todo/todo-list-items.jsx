import * as React from 'react';

const {useEffect, useState} = React;

function TodoListDisplay({list}) {
  const [items, setState] = useState(list.items);

  useEffect(() => list.subscribe(() => setState(list.items)), [list]);

  let rows = [];
  for (let i = 0; i < items.length; i++) {
    rows.push(
      <div key={i}>
        {items[i]}
        <button onClick={() => list.remove(items[i])}>X</button>
      </div>
    );
  }

  return <div>{rows.length > 0 ? rows : 'Nothing to display'}</div>;
}

export default {
  id: 'example:todo-list-items',

  dependencies: {
    'example:todo-list': '^1.0'
  },

  create(env) {
    const todoListV1 = env.featureServices['example:todo-list'];

    return {
      render: () => <TodoListDisplay list={todoListV1} />
    };
  }
};
