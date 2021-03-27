import { it, qed } from 'tiqed';
import * as line from '../line';

export default function works() {

  it('works');

  it('cant build lines', () => {
    
    let b = new line.Builder();

    b.fen('initial', 'fen');

    b.line('initial', 1, 'as');
    b.line('initial', 2, 'as');

    b.build();

    qed('cant read fen', b.fenErrors.get('initial'), [line.BuilderError.CantReadFen])

    qed('key has no fen', b.plyErrors.get(b.kp.get('initial', 1)), [line.BuilderError.KeyHasNoFen]);
    qed('ply has no previous move', b.plyErrors.get(b.kp.get('initial', 2)), [line.BuilderError.PlyHasNoPreviousMove]);

    b.fen('initial', 'fen2');

    qed('fen already defined', b.fenErrors.get('initial'), [line.BuilderError.CantReadFen, line.BuilderError.FenAlreadyDefined])

  });

  it('cant build invalid san', () => {
    
    let b = new line.Builder();

    b.fen('initial', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

    b.line('initial', 1, 'as');

    b.build();

    qed('cant read san', b.plyErrors.get(b.kp.get('initial', 1)), [line.BuilderError.CantReadSan]);
  });

  it('cant build invalid move', () => {
    
    let b = new line.Builder();

    b.fen('initial', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

    b.line('initial', 1, 'e5');

    b.build();

    qed('cant make move', b.plyErrors.get(b.kp.get('initial', 1)), [line.BuilderError.CantMakeMove]);
  });


  it('builds moves', () => {
    let b = new line.Builder();

    b.fen('initial', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

    b.line('initial', 1, 'e4');

    b.build();

    qed('no errors', b.plyErrors.get(b.kp.get('initial', 1)), []);

    qed('yes', b.plyMove('initial', 1)?.san, 'e4');

  });

  it('builds variations', () => {
    let b = new line.Builder();

    b.fen('initial', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

    b.line('initial', 1, 'e4');
    b.line('initial', 2, 'e5');
    b.line('line2', 1, 'c4', 'initial');
    b.line('line3', 2, 'e6', 'initial');

    b.build();

    qed('line2 errs', b.plyErr('line2', 1), []);
    qed('line2 1 san', b.plyMove('line2', 1)?.san, 'c4');
    qed('line3 1 san', b.plyMove('line3', 1)?.san, 'e4');
    qed('line3 2 san', b.plyMove('line3', 2)?.san, 'e6');
    qed('initial 2 san', b.plyMove('initial', 2)?.san, 'e5');

  });
}
