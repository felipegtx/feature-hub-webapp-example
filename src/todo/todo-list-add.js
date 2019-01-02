function createButton(title, inputRef, onClick) {
  const button = document.createElement('button');

  button.innerHTML = title;
  button.onclick = () => {
    onClick(inputRef.value);
    inputRef.value = '';
  };

  return button;
}

function createInput(inputValue) {
  const input = document.createElement('input');

  input.placeholder = inputValue;

  return input;
}

export default {
  id: 'example:todo-list-add',

  dependencies: {
    'example:todo-list': '^1.0'
  },

  create(env) {
    const todoListV1 = env.featureServices['example:todo-list'];

    return {
      attachTo(container) {
        let input = createInput('New item text');
        container.appendChild(input);
        container.appendChild(createButton('New', input, todoListV1.add));
      }
    };
  }
};
