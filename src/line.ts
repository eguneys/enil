import { nt, f, san } from 'nefs';
import { ts, m } from 'tschess';
import { bd } from 'bdu';

export type Key = string
export type Ply = number

export type SituationView = {
  situation: nt.Situation,
  fen: nt.Fen
}

export type MoveView = {
  move: ts.Move,
  after: SituationView,
  uci: string,
  san: string
}

export type Fen = {
  key: Key,
  fen: string
}

export type Line = {
  parent: Key,
  key: Key,
  ply: Ply,
  move: string
}

export enum BuilderError {
  ShouldntHappen = 'Shouldnt happen',
  FenAlreadyDefined = 'Fen already defined',
  PlyAlreadyDefined = 'Ply already defined',
  CantReadFen = 'Cant read fen',
  KeyHasNoFen = 'Key has no fen',
  PlyHasNoPreviousMove = 'Ply has no previous move',
  CantReadSan = 'Cant read san',
  CantMakeMove = 'Cant make move'
}

export type KeyPly = {
  key: Key,
  ply: Ply
}

export class Builder {
  fens: Map<Key, Fen>
  lines: Map<KeyPly, Line>
  fenErrors: MapOfArray<Key, BuilderError>
  plyErrors: MapOfArray<KeyPly, BuilderError>
  kp: bd.DB2<Key, Ply, KeyPly>

  zeroSituations: Map<Key, SituationView>
  plyMoves: Map<KeyPly, MoveView>

  parents: Map<Key, Key>

  constructor() {
    this.kp = new bd.DB2<Key, Ply, KeyPly>((key, ply) => ({key, ply}),
                                              [], []);

    this.parents = new Map<Key, Key>();

    this.fens = new Map<Key, Fen>();
    this.lines = new Map<KeyPly, Line>();

    this.fenErrors = mapOfArray<Key, BuilderError>();
    this.plyErrors = mapOfArray<KeyPly, BuilderError>();

    this.zeroSituations = new Map();
    this.plyMoves = new Map<KeyPly, MoveView>();
  }

  zeroPly(key: Key) {
    return this.fens.get(key);
  }

  zeroError(key: Key) {
    return this.fenErrors.get(key);
  }

  plyMove(key: Key, ply: Ply): MoveView | undefined {
    let res = this.plyMoves.get(this.kp.get(key, ply));

    if (!res) {
      let pkey = this.parents.get(key);

      if (pkey) {
        return this.plyMove(pkey, ply);
      }
    }
    return res;
  }

  plyErr(key: Key, ply: Ply) {
    return this.plyErrors.get(this.kp.get(key, ply));
  }

  fenError(key: Key, error: BuilderError) {
    this.fenErrors.get(key).push(error);
  }

  plyError(kp: KeyPly, error: BuilderError) {
    this.plyErrors.get(kp).push(error);
  }

  fen(key: Key, fen: string) {
    if (this.fens.has(key)) {
      this.fenError(key, BuilderError.FenAlreadyDefined);
    } else {
      this.fens.set(key, {
        key,
        fen
      });
    }
  }

  line(key: Key, ply: Ply, move: string, parent?: Key) {
    let kp = this.kp.get(key, ply);
    let line = this.lines.get(kp);

    if (line) {
      this.plyError(this.kp.get(key, ply), BuilderError.PlyAlreadyDefined);
    } else {
      this.lines.set(kp, {
        parent: parent || key,
        key,
        ply,
        move
      });

      if (parent) {
        this.parents.set(key, parent);
      }
    }
  }

  build() {

    for (let [key, fen] of this.fens.entries()) {
      let situation = f.situation(fen.fen);

      if (!situation) {
        this.fenError(key, BuilderError.CantReadFen)
      } else {
        this.zeroSituations.set(key, {
          fen: f.fen(situation),
          situation
        });
      }      
    }

    for (let kp of this.lines.keys()) {
      this.buildMove(kp);
    }
  }

  buildMove(kp: KeyPly): MoveView | undefined {
    let mv = this.plyMoves.get(kp);

    if (mv) {
      return mv;
    }

    let err = this.plyErrors.get(kp);

    if (err.length > 0) {
      return undefined;
    }


    let line = this.lines.get(kp);

    if (!line) {
      this.plyError(kp, BuilderError.ShouldntHappen);
    } else if (line.ply === 1) {
      let before = this.zeroSituations.get(line.parent || line.key);

      if (!before) {
        this.plyError(kp, BuilderError.KeyHasNoFen);
      } else {
        return this.buildMoveWithSituation(kp, line.move, before.situation);
      }
    } else {
      let prePly = line.ply - 1,
      preKey = line.parent || line.key,
      preKp = this.kp.get(preKey, prePly),
      preMove = this.buildMove(preKp);

      if (!preMove) {
        this.plyError(kp, BuilderError.PlyHasNoPreviousMove);
      } else {
        return this.buildMoveWithSituation(kp, line.move, preMove.after.situation);
      }
    }
  }

  buildMoveWithSituation(kp: KeyPly, move: string, situation: nt.Situation) {

    let sanMeta = san.str2meta(move);

    if (!sanMeta) {
      this.plyError(kp, BuilderError.CantReadSan);
    } else {
      let move = m.move(situation, sanMeta);

      if (!move) {
        this.plyError(kp, BuilderError.CantMakeMove);
      } else {

        let situationAfter = m.situationAfter(move),
        fenAfter = f.fen(situationAfter);
        let after = {
          situation: situationAfter,
          fen: fenAfter
        }

        let mv = {
          move,
          after,
          uci: m.uci(move),
          san: m.san(move)
        }

        this.plyMoves.set(kp, mv);
        return mv;
      }
    }
  }
}

export type MapOfArray<Key, A> = MapOfDefault<Key, Array<A>>
export type MapOfMapOfArray<Key1, Key2, A> = MapOfDefault<Key1, MapOfArray<Key2, A>>
export type MapOfMap<Key1, Key2, Value> = MapOfDefault<Key1, Map<Key2, Value>>

export function mapOfMap<Key1, Key2, Value>() {
  return mapOfDefault<Key1, Map<Key2, Value>>(() => new Map())();
}
export function mapOfArray<Key, Value> () {
  return mapOfDefault<Key, Array<Value>>(() => [])();
}
export function mapOfMapOfArray<Key1, Key2, Value> () {
  return mapOfDefault<Key, MapOfArray<Key2, Value>>(() => mapOfArray<Key2, Value>())();
}

export type MapOfDefault<Key, Value> = {
  get: (_: Key) => Value,
}

export function mapOfDefault<Key, Value>(zero: () => Value) {

  return function() {
    let data: Map<Key, Value> = new Map();

    return {
      get(key: Key) {
        let _value = data.get(key);

        if (!_value) {
          _value = zero();
          data.set(key, _value);
          return _value;
        }
        return _value;
      }
    };
  };
}
