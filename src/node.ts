export class Node<Id, A> {
  id: Id
  children: Array<Node<Id, A>>
  data: A

  constructor(id: Id, data: A, children: Array<Node<Id, A>> = []) {
    this.id = id;
    this.data = data;
    this.children = children;
  }

  climb(path: Array<Id>): Node<Id, A> | undefined {
    let [id, ...rest] = path;
    if (id === this.id) {
      if (rest.length === 0) {
        return this;
      } else {
        let tree = this.children.find(_ => _.id == rest[0]);

        if (tree) {
          return tree.climb(rest);
        }
      }
    }
  }

  add(path: Array<Id>, 
      node: Node<Id, A>) {
    let tree = this.climb(path);
    if (tree) {
      tree.addNode(node);
      return this;
    }
  }

  addNode(node: Node<Id, A>) {
    this.children.push(node);
  }

  mainlineNodeList(): Array<Node<Id, A>> {
    return [new Node(this.id,
                     this.data,
                     this.children.slice(1)),
            ...this.children[0] ?
      this.children[0].mainlineNodeList() : []];
  }

}
