import { tMo, run } from 'tiqed';
import works from './works';
import node from './node';

export default function() {

  tMo(works);
  tMo(node);

  run();
}
