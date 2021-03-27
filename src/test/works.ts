import { it, qed } from 'tiqed';
import * as n from '../node';

export default function works() {

  type Ply = 1 | 2 | 3 | 4 | 5
  type Fen = "fen"
  type Move = string


  it('works');

  it('lines', () => {

    
  });

  it('builds lines', () => {
    
    // let b = new Builder<Fen, Move>();

    // b.fen('initial', 'fen');
    // b.moves('initial', 'a b c d e f g'.split(' '));
    // b.branch('line2', 'initial', 3);
    // b.moves('line2', 'c2 d2 e2');

    // zero('initial') // fen
    // ply('initial', 3) // c
    // ply('initial', 5) // e
    // zero('line2') // fen
    // ply('line2', 1) // a
    // ply('line2', 3) // c2
    // ply('line2', 5) // e2
    
  });
  
}
