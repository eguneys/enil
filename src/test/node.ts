import { it, qed } from 'tiqed';
import * as n from '../node';

export default function node() {

  it('node');

  it('builds nodes', () => {
    
    let root = new n.Node('1', 1);

    root.add(['1'], new n.Node('2', 2));

    qed('add 2', root.children?.[0]?.data, 2);

    root.add(['1', '2'], new n.Node('3', 3));

    console.log(root.mainlineNodeList());
  });
  
}
