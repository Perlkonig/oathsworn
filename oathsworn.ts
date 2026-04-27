/**
 * This file generates the JSON results. It rolls each pool a million times and records the results.
 */

type DieFace = {value: number, exploding: boolean};

class Die {
    public readonly name: string;
    public readonly seq: number;
    public readonly faces: DieFace[];

    constructor(opts: {name: string, faces: (number|string)[], seq: number}) {
        this.name = opts.name;
        this.seq = opts.seq;
        this.faces = [...opts.faces].map(n => typeof n === "string" ? {value: parseInt(n, 10), exploding: true} : {value: n, exploding: false})
    }

    public roll(): DieFace {
        const randomIndex = Math.floor(Math.random() * this.faces.length);
        return this.faces[randomIndex];
    }

}

type Results = {
    [k: string]: {
        set: string;
        vals: Map<number, number>;
    }
};

const white = new Die({name: "W", seq: 1, faces: [0, 0, 1, 1, 2, "2"]});
const yellow = new Die({name: "Y", seq: 2, faces: [0, 0, 1, 2, 3, "3"]});
const red = new Die({name: "R", seq: 3, faces: [0, 0, 2, 3, 3, "4"]});
const black = new Die({name: "B", seq: 4, faces: [0, 0, 3, 3, 4, "5"]});

const resolve = (pool: Die[]): number => {
    let initial = 0;
    let blanks = 0;
    const exploding: Die[] = [];
    for (const die of pool) {
        const val = die.roll();
        if (val.value === 0) {
            blanks++;
        }
        if (blanks >= 2) {
            return 0;
        } else {
            initial += val.value;
            if (val.exploding) {
                exploding.push(die);
            }
        }
    }
    let final = initial;
    for (let die of exploding) {
        let val = die.roll();
        final += val.value;
        while (val.exploding) {
            val = die.roll();
            final += val.value;
        }
    }
    return final;
}

/**
 * Yields all combinations of size r from the input iterable, allowing elements to be repeated.
 * The order of elements in the combinations is ignored (e.g., [1, 2] is the same as [2, 1]).
 *
 * @param iterable The source elements to combine.
 * @param r The size of each combination.
 */
export function* combinationsWithReplacement<T>(iterable: Iterable<T>, r: number): IterableIterator<T[]> {
    const pool = Array.from(iterable);
    const n = pool.length;

    // If r is 0, the only combination is the empty set.
    if (r === 0) {
        yield [];
        return;
    }

    // If pool is empty or r is negative, no combinations are possible.
    if (n === 0 || r < 0) {
        return;
    }

    const indices = new Array<number>(r).fill(0);
    // map(i => pool[i]) ensures we yield a new array instance each time
    yield indices.map(i => pool[i]);

    while (true) {
        let i = r - 1;
        // Find the rightmost index that hasn't reached the end of the pool
        while (i >= 0 && indices[i] === n - 1) {
            i--;
        }

        // If all indices are at the maximum, we're done
        if (i < 0) {
            return;
        }

        const nextVal = indices[i] + 1;
        for (let j = i; j < r; j++) {
            indices[j] = nextVal;
        }
        yield indices.map(idx => pool[idx]);
    }
}

const sortPool = (a: Die, b: Die): number => {
    return b.seq - a.seq;
}

const namePool = (pool: Die[]): string => {
    return pool.map(d => d.name).join("");
}

const addToMap = (map: Map<number,number>, key: number): void => {
    if (map.has(key)) {
        const count = map.get(key)!;
        map.set(key, count + 1);
    } else {
        map.set(key, 1);
    }
}

import { writeFileSync } from "fs";
const runs = 1000000;
let results: Results = {};
for (let len = 1; len <= 6; len++) {
    console.log(`Length: ${len}`);
    for (const grp of combinationsWithReplacement([black, red, yellow, white], len)) {
        const sorted = [...grp].sort(sortPool);
        const name = namePool(sorted);
        // console.log(`Pool: ${name}`);
        if (!Object.keys(results).includes(name)) {
            results[name] = {
                set: name,
                vals: new Map<number,number>(),
            }
        } else {
            throw new Error(`Duplicate pool found: ${name}`);
        }
        const map = results[name].vals;
        for (let n = 0; n < runs; n++) {
            const result = resolve(grp);
            addToMap(map, result);
        }
    }
}
writeFileSync("oathsworn.json", JSON.stringify(Object.values(results).map(({set, vals}) => ({pool: set, probs: [...vals.entries()].map(([k, v]) => [k, v/runs])}))));
