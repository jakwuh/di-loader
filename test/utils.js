import {uniq, sortObject} from '../src/utils';
import {expect} from 'chai';

describe('utils uniq', function () {
    it('works', function () {
        expect(uniq([1, 2, 3, 2, 2, 1])).to.eql([1, 2, 3]);
    });
});

describe('utils sortObject', function () {
    it('works', function () {
        expect(sortObject({
            B: 1, b: 1, a: 1, A: 1
        })).to.eql({
            a: 1, b: 1, A: 1, B: 1
        });
    });
});
