import NanoEvents from 'nanoevents';

class TodoListV1 {
  items: Object[];
  emitter: NanoEvents;

  constructor() {
    this.items = [];
    this.emitter = new NanoEvents();
    this.add = this.add.bind(this);
  }

  public add(item: Object): void {
    this.update([...this.items, item]);
  }

  public remove(item: Object): void {
    this.update(this.items.filter(i => i !== item));
  }

  subscribe(listener) {
    return this.emitter.on('update', listener);
  }

  update(newItems: Object[]) {
    console.log(newItems);
    this.items = newItems;
    this.emitter.emit('update');
  }
}

export default {
  id: 'example:todo-list',

  create: () => {
    const todoListV1 = new TodoListV1();

    return {
      '1.0': () => ({featureService: todoListV1})
    };
  }
};
