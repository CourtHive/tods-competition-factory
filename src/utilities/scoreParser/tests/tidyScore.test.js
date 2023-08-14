import { getTransformations, tidyScore } from '../scoreParser';
import { expect, it } from 'vitest';

const validPatterns = false;
const expectations = false;
const fullLog = true;
const start = 0;
const end = 0;

// HIGHER ORDER PROCESSING
// '64 67(7)' => '6-4 7-6(7)' recognize that there cannot be a winner unless 2nd set score is flipped
// NEXT: new method to process sets and start to guess at matchUpFormat

const s62673107 = '6-2 6-7(3) [10-7]';
const s4676530 = '4-6 7-6(5) 3-0';
const s5445411 = '5-4(4) 5-4(11)';
const s6157108 = '6-1 5-7 [10-8]';
const s64768 = '6-4 7-6(8)';

const scores = [
  // { score: '7567108', expectation: { score: '7-5 6-7(8)' } },
  // { score: '7567()108', expectation: { score: '7-5 6-7(8)' } },
  // { score: '7567 108', expectation: { score: '7-5 6-7(8)' } },

  // { score: '7 6(5)5 7 6 3', expectation: { score: '7-6(5) 5-7 6-3' } }, // fix handleNumeric

  { score: '6-1;7-6(10)', expectation: { score: '6-1 7-6(10)' } },
  { score: '6-2;2-6;10-2', expectation: { score: '6-2 2-6 [10-2]' } },
  { score: '5 7 6 2 10-2', expectation: { score: '5-7 6-2 [10-2]' } },
  { score: '2 6 6 4 10-5', expectation: { score: '2-6 6-4 [10-5]' } },
  { score: '3 6 7 5 7 6(2)', expectation: { score: '3-6 7-5 7-6(2)' } },
  { score: '67(6)64106', expectation: { score: '6-7(6) 6-4 [10-6]' } },
  { score: '6 3 6 7(3) 6 0', expectation: { score: '6-3 6-7(3) 6-0' } },
  { score: '6367(3)60', expectation: { score: '6-3 6-7(3) 6-0' } },

  /*
  { score: '[7/6 (4) 6/3 )', expectation: { score: '7-6(4) 6-3' } },
  { score: '(6-1), (7-6(1))', expectation: { score: '6-1 7-6(1)' } },
  { score: '1&2', expectation: { score: '6-1 6-2' } },
  { score: '3&3&2', expectation: { score: '6-3 3-6 6-2' } },
  { score: '5&3&(7&1)', expectation: { score: '7-5 3-6 [7-1]' } },
  "6-4, (6)" => '6-4 7-6(6)'
  "(6-1), (7-6(1))"
  "(6-4), (7-6(8))"
  "6--, 6--7(7/2), 6--3"
  "(6-4)(6-7((5)(7-5)"
  "(6-2), (7-6(2))"
  "(7-6(4)), (5-7), (6-2)"
  "(4-1), (4-3(3))"
  "4-6, -2, 7-5"
  "7-6(4), 6-791), 6-0"
  "(4)6-7, 6-2, 7-5" // pattern recognition (#)#-#, => #-#(#),
  "4-5(5, 5-4(3), 11-9"

  "6--, 6--0"
  "6-06, -0"

  "67(6)64106"
  "45(5)42108"
  "67(7)61101"

  "6, 2 7, 6(4)"
  "6, 4 7, 6(6)"

  "26, 76(13), 11-9"
  "6 3, 5 7, 10-8"
  "4 6, 6 4, 10-8"
  "6 3, 2 6, 14-12"
  "4 6, 6 4, 10-8"
  "7-6 (10) 6-7 (6) 6-2"

  "76-(2), 6-4"
  "75 36 12 10"
  "7-6(3)/6-3"
  "(7-6(4)), (5-7), (6-2)"
  "(4-1), (4-3(3))"
  "(6-2), (7-6(2))"
  "4-5(5, 5-4(3), 11-9"
  '1-6, 6-4, 2-0(CONS)'

  { score: '67(4)60107', expectation: { score: '6-7(4) 6-0 [10-7]' } },

  // sensibleSets should recognize 762 as valid tiebreak
  { score: '3 6 7 5 7 6(2)', expectation: { score: '' } },

  // punctuation adjustments
  { score: '(6-4)(6-7((5)(7-5)', expectation: { score: '' } },

  // recognize missing Zero
  { score: '(6, 4)(, 6)(6, 4)', expectation: { score: '' } },

  // match pattern #-#9#) => #-#(#)
  { score: '2-4, 5-494), 7-5', expectation: { score: '2-4 5-4(4) [7-5]' } },

  // sensibleSets should recognize 2-3 correct sets and attempt to fix third
  { score: '6-3 -6 6-4', expectation: { score: '' } },
  { score: '6-4, 1-6-1, 14-12', expectation: { score: '' } },
  // sensibleSets should recognize 3 correct sets and discard the rest
  { score: '6-1, 1-6, 1, 6-4', expectation: { score: '6-1 1-6 6-4' } },
  { score: '6-436-4', expectation: { score: '6-4 6-4' } },
  // should recognize that a middle incomplete set is won by side #1
  "4-6, -2, 7-5" //

  // positioning(#-#)
  { score: '1(6-3, 6-4)', expectation: { score: '6-3 6-4' } },

  // (positioning) #-#
  { score: '(6) 2-6, 6-4, 10-8', expectation: { score: '2-6 6-4 [10-8]' } },

  // implied 0
  { score: '9-', expectation: { score: '' } },
  { score: '6-', expectation: { score: '' } },
  { score: '6/', expectation: { score: '' } },
  { score: '6/, 6/0', expectation: { score: '' } },
  { score: '(9, )', expectation: { score: '' } },
  { score: '6- 6-0', expectation: { score: '' } },
  { score: '(9, )', expectation: { score: '' } },

  { score: '(8-4)(4)', expectation: { score: '' } },

  // containedSets should remove parens
  { score: '(9-8) 10', expectation: { score: '' } },
  { score: '(9-8) 10-5', expectation: { score: '' } },
  { score: '(9-8)10-5', expectation: { score: '' } },

  // recognize tiebreak score
  { score: '(6-3)(6-7)7/2(7-5)', expectation: { score: '' } },
  { score: '(4-6)(7-6)(8/6)(6-4)', expectation: { score: '' } },
  { score: '(4-6)(7-6)8/6(6-4)', expectation: { score: '' } },

  // should get caught by second pass
  { score: '75 36 12 10', expectation: { score: '' } },

  // extract good sets and parse remainder?
  { score: '7-5, 6, 4, 10-8', expectation: { score: '' } },

  // setRecognition
  // recognize that with a match tiebreak there must be 2 prior sets
  // recognize there are three logical parts, as there should be
  // recognize the winner of one which makes sense (6, 1)
  // recognize the first set is non-sensical/has tied score
  { score: '(6, 6)(6, 1)[10, 4]', expectation: { score: '' } },
  { score: '(7-6)7-2, 4-6, 10-5', expectation: { score: '7-6(2) 4-6 [10-5]' } },

  recognize third set match tiebreak and that first two sets are nonsense
  { score: '7-5(7-6)10-8', expectation: { score: '' } },

  // digitWalker
  { score: '(4-6)(6-4)(7-6)7/2', expectation: { score: '' } },

  // mistyped ... ?
  { score: '66275', expectation: { score: '6-2 7-5' } },

  // nonsense
  { score: '(6-5)7/0(0-6)(6-3)9/7', expectation: { score: '6-5(0) 0-6 6-3' } },
  { score: '4-6, 6-0, -0', expectation: { score: '' } },
  { score: '6641210', expectation: { score: '' } },
  { score: '43442', expectation: { score: '' } },
  { score: '44042', expectation: { score: '' } },
  { score: '66464', expectation: { score: '' } },
  { score: '40471', expectation: { score: '' } },
  { score: '44446', expectation: { score: '' } },

  { score: '9--7 (4)', expectation: { score: '' } },
  { score: '(0-8)(6)', expectation: { score: '' } },
  { score: '(6, 6 2)', expectation: { score: '' } },
  { score: '9(7-3)', expectation: { score: '' } },

  { score: '7-6, 6-3(5)', expectation: { score: '' } },
  { score: '6-4, (6)', expectation: { score: '' } },

  { score: '6--, 6--7(7/2), 6--3', expectation: { score: '' } },
  { score: '6-- 6--2', expectation: { score: '' } },
  { score: '6-', expectation: { score: '' } },
  { score: '6/, 6/2', expectation: { score: '' } },
  { score: '6-2, 7-5 (3)', expectation: { score: '' } },
  { score: '((-7)', expectation: { score: '' } },
  { score: '- 1, - 1)', expectation: { score: '' } },
  { score: '- 5, - 6, -5)', expectation: { score: '' } },
  { score: '- 5, 4- 6, 7- 6)', expectation: { score: '' } },
  { score: '6-4 (2) 4-0', expectation: { score: '' } },
  { score: '(6)(6-2)', expectation: { score: '' } },
  { score: '(6-, 2-6, 10-5)', expectation: { score: '' } },

  // RETIRED is not specified but could be implied
  { score: '(2, 6)(7, 5)[7, 6](6, 4)', expectation: { score: '2-6 7-5 7-6(6-4)', matchUpStatus: 'RETIRED' } },
  */

  // recognize 3rd set match tiebreak to 7
  { score: '4, 2 3, 5 7, 2', expectation: { score: '4-2 3-5 [7-2]' } },
  { score: '4, 5(1) 4, 2 7, 3', expectation: { score: '4-5(1) 4-2 [7-3]' } },

  // recognize college pro set
  { score: '8/7 8, 6', expectation: { score: '8-7(6)' } },
  { score: '8/7 7, 2', expectation: { score: '8-7(2)' } },

  { score: '9-8 10', expectation: { score: '9-8(10)' } },
  { score: '7-6 10', expectation: { score: '7-6(10)' } },
  { score: '7-6 1', expectation: { score: '7-6(1)' } },

  { score: '6-3, 7, 5', expectation: { score: '6-3 7-5' } },
  { score: '6/0, 6, 0', expectation: { score: '6-0 6-0' } },

  // space separated sets
  { score: '7 6 (8 6)6 1', expectation: { score: '7-6(6) 6-1' } },
  { score: '7 6, (7 4)6 2', expectation: { score: '7-6(4) 6-2' } },
  { score: '57, 76(1)10 6', expectation: { score: '5-7 7-6(1) [10-6]' } },

  // replace(')#', ') #');
  { score: '6-2, 6-7 (2-7)6-2)', expectation: { score: '6-2 6-7(2) 6-2' } },
  { score: '6-2, 6-7 (2-7) 6-2)', expectation: { score: '6-2 6-7(2) 6-2' } },

  { score: '(5-7)(6-4)10/4', expectation: { score: '5-7 6-4 [10-4]' } },
  { score: '(4-6)(7-5)10/2', expectation: { score: '4-6 7-5 [10-2]' } },
  { score: '8-7(11-9), shaurya', expectation: { score: '8-7(9)' } },
  { score: '8-7(11-9)', expectation: { score: '8-7(9)' } },

  // match tiebreak variations
  { score: '57 60 106', expectation: { score: '5-7 6-0 [10-6]' } },
  { score: '62 36 10 6', expectation: { score: '6-2 3-6 [10-6]' } },
  { score: '46 60 10 6', expectation: { score: '4-6 6-0 [10-6]' } },

  { score: '6157 108()', expectation: { score: s6157108 } },
  { score: '6157108', expectation: { score: s6157108 } },
  { score: '6157 108', expectation: { score: s6157108 } },
  { score: '6157 [10-8]', expectation: { score: s6157108 } },

  { score: '1440119', expectation: { score: '1-4 4-0 [11-9]' } },
  { score: '2441108', expectation: { score: '2-4 4-1 [10-8]' } },
  { score: '3661103', expectation: { score: '3-6 6-1 [10-3]' } },
  { score: '3661119', expectation: { score: '3-6 6-1 [11-9]' } },
  { score: '4661105', expectation: { score: '4-6 6-1 [10-5]' } },
  { score: '6136107', expectation: { score: '6-1 3-6 [10-7]' } },
  { score: '36641210', expectation: { score: '3-6 6-4 [12-10]' } },
  { score: '46611513', expectation: { score: '4-6 6-1 [15-13]' } },
  { score: '46621210', expectation: { score: '4-6 6-2 [12-10]' } },

  // space separated match tiebreak
  { score: '46, 63, 10 6', expectation: { score: '4-6 6-3 [10-6]' } },
  { score: '57 60 10 6', expectation: { score: '5-7 6-0 [10-6]' } },

  // don't split tiebreak scores >= 10
  { score: '76(10) 62', expectation: { score: '7-6(10) 6-2' } },
  { score: '7-6(10) 62', expectation: { score: '7-6(10) 6-2' } },

  // space separated tiebreak score
  { score: '7-6 2 3-6 6-3', expectation: { score: '7-6(2) 3-6 6-3' } },

  // missing final set side score
  { score: '6 4, 6', expectation: { score: '6-4 6-0' } },
  { score: '6/2, 6', expectation: { score: '6-2 6-0' } },
  // ensure missing final set side logic does not impact normal sets
  { score: '(9, 6)', expectation: { score: '9-6' } },
  { score: '(8, 6)', expectation: { score: '8-6' } },

  // test HAIL MARY
  { score: '7563', expectation: { score: '7-5 6-3' } },
  { score: '7, 5-6-3', expectation: { score: '7-5 6-3' } },
  { score: '636476 ret', expectation: { score: '6-3 6-4' } },
  { score: '757672', expectation: { score: '7-5 7-6(2)' } },
  { score: '576264', expectation: { score: '5-7 6-2 6-4' } },
  { score: '676264', expectation: { score: '6-7 6-2 6-4' } },
  { score: '766264', expectation: { score: '7-6(2) 6-4' } },
  { score: '6-7, 6, 2, 6-4', expectation: { score: '6-7 6-2 6-4' } },

  // various bracket and punctuation errors
  { score: '(6/3) (/4)', expectation: { score: '6-3 6-4' } },
  { score: '(64, )(4, 6)(10, 6)', expectation: { score: '6-4 4-6 [10-6]' } },
  { score: '(64 )(4, 6)(10, 6)', expectation: { score: '6-4 4-6 [10-6]' } },
  { score: '(6, 0)(6, )', expectation: { score: '6-0 6-0' } },
  { score: '(6, 0)(6,4)', expectation: { score: '6-0 6-4' } },
  { score: '(6,0)(6,4)', expectation: { score: '6-0 6-4' } },

  // TODO: integrity check set score for sanity
  { score: '(8-7) 6', expectation: { score: '8-7(6)' } }, // arguable that 6 is the tiebreak score

  // smashedSets
  { score: '(6/06/2)', expectation: { score: '6-0 6-2' } },
  { score: '(6,06,2)', expectation: { score: '6-0 6-2' } },
  { score: '6/0/6/1', expectation: { score: '6-0 6-1' } },
  { score: '6-3-6-1', expectation: { score: '6-3 6-1' } },
  { score: '6-3/6-1', expectation: { score: '6-3 6-1' } },
  { score: '6-3, 5-7-, 6-3', expectation: { score: '6-3 5-7 6-3' } },

  // smashed tiebreak
  { score: '76(2) 67(3)64', expectation: { score: '7-6(2) 6-7(3) 6-4' } },
  { score: '26 76(7)61', expectation: { score: '2-6 7-6(7) 6-1' } },
  { score: '7-6(2 )6-0', expectation: { score: '7-6(2) 6-0' } },

  // parenthetical with multiple sets
  { score: '(4/6 6/1 7/6(2)', expectation: { score: '4-6 6-1 7-6(2)' } },

  // match tiebreak low score in parens
  { score: '1-6, 6-4, (5)', expectation: { score: '1-6 6-4 [10-5]' } },
  { score: '6/3, 6/7(5), (4)', expectation: { score: '6-3 6-7(5) [10-4]' } },

  // excess parens
  { score: '(4-6, 6-2, 7-6((2))', expectation: { score: '4-6 6-2 7-6(2)' } },
  { score: '(4-6, 6-2, 7-6((7-2))', expectation: { score: '4-6 6-2 7-6(2)' } },

  // missing finalSet side score
  { score: '6/4, 6/', expectation: { score: '6-4 6-0' } },

  // missed 0 set score ending
  { score: '(6-)(6-2)', expectation: { score: '6-0 6-2' } },
  { score: ' 6-, 6-4', expectation: { score: '6-0 6-4' } },

  // discard invalid
  { score: '634 61', expectation: { score: '' } },
  { score: '44751', expectation: { score: '' } },

  // trim invalid
  { score: '6363 1', expectation: { score: '6-3 6-3' } },
  { score: '6375(4)', expectation: { score: '6-3 7-5' } }, // this set may have been 6-3 7-6(4), but oh well
  { score: '1/6, 6/7(3 7), 7/6(7, 4)', expectation: { score: '1-6 6-7(3)' } },

  // remove extraneous enclosing parens
  { score: '(6-3, 7-6 (1) )', expectation: { score: '6-3 7-6(1)' } },
  { score: '(6-1, 6-7(7-2), 6-2)', expectation: { score: '6-1 6-7(2) 6-2' } },
  { score: '7/6(2), 6/0)', expectation: { score: '7-6(2) 6-0' } },
  { score: '6-4, 6-7(17-15), 6-4)', expectation: { score: '6-4 6-7(15) 6-4' } },

  // too many sets
  { score: '6 4, 6 16 4, 6 2', expectation: { score: '6-4 6-1' } },
  { score: '(6-2) (7-6) (3-7) (10-7)', expectation: { score: '6-2 7-6(3)' } }, // recognize both tiebreak and supertiebreak
  { score: '(6/2) (7/6) (3/7) (10/7)', expectation: { score: '6-2 7-6(3)' } }, // recognize both tiebreak and supertiebreak
  {
    score: '(6-2) (6-7) (3/7) (10/7)',
    expectation: { score: s62673107 },
  }, // recognize both tiebreak and supertiebreak

  // recognize set tiebreak and match tiebreak
  {
    score: '(6-2) (6-7) (3-7) (10/7)',
    expectation: { score: s62673107 },
  }, // recognize both tiebreak and supertiebreak
  {
    score: '(6-2) (6-7) (3-7) (10-7)',
    expectation: { score: s62673107 },
  }, // recognize both tiebreak and supertiebreak

  // pattern /\d+,\s?\d/+\/\d+\s?\d+/
  { score: '4, 6/6, 1(10/5)', expectation: { score: '4-6 6-1 [10-5]' } },

  // throw out equivalent sets when there is not 'RETIRED status
  { score: '4--2, 40-40', expectation: { score: '4-2' } },

  // extra digits
  { score: '6-12, 6-3', expectation: { score: '6-1 6-3' } },
  { score: '6-4, 5-76, 6-3', expectation: { score: '6-4 5-7 6-3' } },
  { score: '6-3, 7-54', expectation: { score: '6-3 7-5' } },
  { score: '6--3, 6--22', expectation: { score: '6-3 6-2' } },
  { score: '6--2, 6--11', expectation: { score: '6-2 6-1' } },
  { score: '6-3, 6-23', expectation: { score: '6-3 6-2' } },

  // various set separators
  { score: '6 4, 6-4', expectation: { score: '6-4 6-4' } },
  { score: '6 4/6 2', expectation: { score: '6-4 6-2' } },
  { score: '6 0/6 0', expectation: { score: '6-0 6-0' } },
  { score: '6 4 /6 3', expectation: { score: '6-4 6-3' } },

  // pattern \d+-\d{2}-\d+ => \d-\d \d-\d
  { score: '6-2 5-76-3', expectation: { score: '6-2 5-7 6-3' } },
  { score: '6-36-3', expectation: { score: '6-3 6-3' } },

  // (#/) => (#)
  { score: '6/3, 5/7, 7/6 (7/)', expectation: { score: '6-3 5-7 7-6(7)' } },

  // sensibleSets recognizes 40-0 is not sensible
  {
    score: '5-0 40-0 coneced',
    expectation: { score: '5-0 4-0', matchUpStatus: 'RETIRED' },
  },
  {
    score: '5-0 (40-0) coneced',
    expectation: { score: '5-0 4-0', matchUpStatus: 'RETIRED' },
  },
  {
    score: '5-0 (40-0 coneced',
    expectation: { score: '5-0 4-0', matchUpStatus: 'RETIRED' },
  },

  // repating dash with comma
  { score: '6--, 2, 3--6, 10--5', expectation: { score: '6-2 3-6 [10-5]' } },

  // remove all empty spaces within (#) and (#-#)
  { score: '6/3, 2/6 ( 10 -3)', expectation: { score: '6-3 2-6 [10-3]' } },
  { score: '6/3, 2/6 ( 10 - 3 )', expectation: { score: '6-3 2-6 [10-3]' } },
  { score: '6/2, 4/6 (10 - 7 )', expectation: { score: '6-2 4-6 [10-7]' } },

  // block of 4 numbers
  { score: '6076(3)', expectation: { score: '6-0 7-6(3)' } },
  { score: '6367(3)104', expectation: { score: '6-3 6-7(3) [10-4]' } },
  { score: '6367 (3) 104', expectation: { score: '6-3 6-7(3) [10-4]' } },
  { score: '6 26 3', expectation: { score: '6-2 6-3' } },
  { score: '6 3, 6, 2', expectation: { score: '6-3 6-2' } },

  // join numbers separated by a dash and a space
  { score: '63 46 10 -4', expectation: { score: '6-3 4-6 [10-4]' } },
  { score: '63 46 10- 4', expectation: { score: '6-3 4-6 [10-4]' } },

  { score: '5-4(7, 5-3', expectation: { score: '5-4(7) 5-3' } },
  { score: '36637675', expectation: { score: '3-6 6-3 7-6(5)' } },
  {
    score: '(6-7 (2), 6-3, 6-7 (5))',
    expectation: { score: '6-7(2) 6-3 6-7(5)' },
  },
  { score: '6 2 7 6 (5)', expectation: { score: '6-2 7-6(5)' } },
  { score: '2/6, 6/0/, 7/6(5)', expectation: { score: '2-6 6-0 7-6(5)' } },
  { score: '(8/7-5)', expectation: { score: '8-7(5)' } },
  { score: '(9/8-7)', expectation: { score: '9-8(7)' } },
  { score: '6-2, 6, 1', expectation: { score: '6-2 6-1' } },
  { score: '6-3, 6, 2', expectation: { score: '6-3 6-2' } },
  { score: '67575', expectation: { score: '6-7(5) 7-5' } },
  { score: '75 36 12 10', expectation: { score: '7-5 3-6 [12-10]' } },
  { score: '6-3, 6-7(6-8)10-5', expectation: { score: '6-3 6-7(6) [10-5]' } },
  { score: '6-4, 6-7, (5-7)6-4', expectation: { score: '6-4 6-7(5) 6-4' } },
  { score: '7-6, 7-5(10-6)', expectation: { score: '7-6 7-5' } }, // has to be good enough!
  { score: '((6, 4)(2, 6)[10, 3)', expectation: { score: '6-4 2-6 [10-3]' } },
  { score: '6-3, 6, 0', expectation: { score: '6-3 6-0' } },
  { score: '2-6, 7-5(10-8)6-2', expectation: { score: '2-6 7-6(8) 6-2' } },
  { score: '5, 7-6, 1-11, 9', expectation: { score: '5-7 6-1 [11-9]' } },
  { score: '6, 4-3, 6-10, 8', expectation: { score: '6-4 3-6 [10-8]' } },
  { score: '8, 7(4)', expectation: { score: '8-7(4)' } },
  { score: '6-7(8)/7-6(9)/ 6-2', expectation: { score: '6-7(8) 7-6(9) 6-2' } },
  { score: '46 75 6 3', expectation: { score: '4-6 7-5 6-3' } },
  { score: '6 4 3 6 13 11', expectation: { score: '6-4 3-6 [13-11]' } },
  { score: '46 76(12) 76 (2)', expectation: { score: '4-6 7-6(12) 7-6(2)' } },
  { score: '4-6, 6-1- 7-6(5)', expectation: { score: '4-6 6-1 7-6(5)' } },
  { score: '6-47-6(8)', expectation: { score: s64768 } },
  { score: '6/47/6(8)', expectation: { score: s64768 } },
  { score: '7 6(75)', expectation: { score: '7-6(5)' } },
  { score: '7 6( 7 5)', expectation: { score: '7-6(5)' } },
  { score: '7-6(75)', expectation: { score: '7-6(5)' } },
  { score: '6/4, 2/6, 7/6(8/6/)', expectation: { score: '6-4 2-6 7-6(6)' } },
  { score: '6/4, 2/6, 7/6(8/6)', expectation: { score: '6-4 2-6 7-6(6)' } },
  { score: '6-7, (7-5)6-4, 6-0', expectation: { score: '6-7(5) 6-4 6-0' } },
  { score: '6-3, 6-7(7-4)6-2', expectation: { score: '6-3 6-7(4) 6-2' } },
  { score: '7-6(3)/7-5', expectation: { score: '7-6(3) 7-5' } },
  { score: '6/2, 6, 2', expectation: { score: '6-2 6-2' } },
  { score: '6, 4-, 6, 4', expectation: { score: '6-4 6-4' } },
  { score: '6-2, 7, 5', expectation: { score: '6-2 7-5' } },
  { score: '6-2, -6, 2', expectation: { score: '6-2 6-2' } },
  { score: '7-6(5)/6-3', expectation: { score: '7-6(5) 6-3' } },
  { score: '1676(10)108', expectation: { score: '1-6 7-6(10) [10-8]' } },
  { score: '(6-3) (1-6) (7-5)[1-7]', expectation: { score: '6-3 1-6 7-6(1)' } }, // 7-5 with tiebreak has been corrected
  { score: '61 26 10-13', expectation: { score: '6-1 2-6 [10-3]' } },
  { score: '5/4 [7-4], 5/4 [12-11]', expectation: { score: s5445411 } },
  { score: '6 3, 7 5', expectation: { score: '6-3 7-5' } },
  { score: '6-1, 2-6(10-1)', expectation: { score: '6-1 2-6 [10-1]' } },
  { score: '6-2, 2-6(13-11)', expectation: { score: '6-2 2-6 [13-11]' } },
  { score: '6-4, -64', expectation: { score: '6-4 6-4' } },
  {
    score: '7--6, (7/4), 4--6, 16--14',
    expectation: { score: '7-6(4) 4-6 [16-14]' },
  },
  { score: '6-4, 4-6, 6-1)', expectation: { score: '6-4 4-6 6-1' } },
  { score: '7-5, 5-7, 7-7(5)-', expectation: { score: '7-5 5-7 7-6(5)' } },
  { score: '7-6(6), 2-6(10-6)', expectation: { score: '7-6(6) 2-6 [10-6]' } },
  { score: '7-6(60', expectation: { score: '7-6(6)' } },
  { score: '7-6(60, 6-0', expectation: { score: '7-6(6) 6-0' } },
  { score: '7/5 6 /0', expectation: { score: '7-5 6-0' } },
  { score: '7/6[11/13] 6/3', expectation: { score: '7-6(11) 6-3' } },
  { score: '75 36 12 -10', expectation: { score: '7-5 3-6 [12-10]' } },
  { score: '8-7, /7-0', expectation: { score: '8-7(0)' } },
  { score: '9-5)', expectation: { score: '9-5' } },
  { score: '1, 0', expectation: { score: '1-0' } },
  {
    score: '1, 0 con',
    expectation: { score: '1-0', matchUpStatus: 'RETIRED' },
  },

  // danglingBits ...
  { score: '(6-4)(6-3) 6', expectation: { score: '6-4 6-3' } },
  { score: '(,', expectation: { score: '' } },
  { score: ')', expectation: { score: '' } },

  { score: '(2/4, 4/1, 4/1)', expectation: { score: '2-4 4-1 4-1' } },
  { score: '2/4, 4/1, 4/1', expectation: { score: '2-4 4-1 4-1' } },

  { score: '5-3, 4-1s', expectation: { score: '5-3 4-1' } },

  // handle score beginning with []
  {
    score: '[6-7, (7-7), 6-2, 10-7]',
    expectation: { score: '6-7(7) 6-2 [10-7]' },
  },
  {
    score: '6-7, (7-7), 6-2, 10-7',
    expectation: { score: '6-7(7) 6-2 [10-7]' },
  },
  { score: '[1] 7/2', expectation: { score: '7-2' } }, // leading bracketed number is seeding
  { score: '[10]', expectation: { score: '' } }, // bracketed number with no '-' is seeding

  // convert 1-0(#) to super tiebreak
  { score: '(6-3, 5-7, 1-0 12-10)', expectation: { score: '6-3 5-7 [12-10]' } },
  { score: '(2-6, 6-2, 1-0(10-6))', expectation: { score: '2-6 6-2 [10-6]' } },

  // recognition of separated tiebreak (in floatingTiebreak)
  { score: '(9-8) (7-1)', expectation: { score: '9-8(1)' } },

  { score: '(9/9)(7)', expectation: { score: '9-8(7)' } }, // set should be 9/8
  {
    score: '(7-6(8-6)) (4-6) (7-6(7-4))',
    expectation: { score: '7-6(6) 4-6 7-6(4)' },
  }, //
  { score: '(7 6)(7, 3)(6, 0)', expectation: { score: '7-6(3) 6-0' } },
  { score: '(7, 6)(8/6), (6, 3)', expectation: { score: '7-6(6) 6-3' } },
  { score: '(7, 6)(8 6)(6, 4)', expectation: { score: '7-6(6) 6-4' } }, //
  { score: '(63)(6, 4)', expectation: { score: '6-3 6-4' } },
  { score: '(6, 3)(6 4)', expectation: { score: '6-3 6-4' } },
  { score: '(7/6)(7-4), (6/1)', expectation: { score: '7-6(4) 6-1' } },
  { score: '(6, 4)(2, 6)(10/8)', expectation: { score: '6-4 2-6 [10-8]' } }, // supertiebreak
  { score: '(6, 2)(7, 6)(8/6)', expectation: { score: '6-2 7-6(6)' } }, // set tiebreak
  { score: '(8-7)2', expectation: { score: '8-7(2)' } },
  { score: '(9-8(12-10))', expectation: { score: '9-8(10)' } }, // remove enclosing parens
  { score: '(9-8(7-3))', expectation: { score: '9-8(3)' } }, // remove enclosing parens
  { score: '97(3)', expectation: { score: '9-8(3)' } }, // set score should be auto-corrected to 9-8(3)
  { score: '98(1)', expectation: { score: '9-8(1)' } },
  { score: '9/8[7/2]', expectation: { score: '9-8(2)' } },

  { score: '6-7(4), 6-0, 7-6(4)', expectation: { score: '6-7(4) 6-0 7-6(4)' } },
  {
    score: '6-7 (4), 6-0, 7-6 (4)',
    expectation: { score: '6-7(4) 6-0 7-6(4)' },
  },
  {
    score: '(6-7)(5), (6-4), (10-6)',
    expectation: { score: '6-7(5) 6-4 [10-6]' },
  },
  {
    score: '(6/7)(5), (6/4), (10/6)',
    expectation: { score: '6-7(5) 6-4 [10-6]' },
  }, //
  {
    score: '(5/7), (7/6)(4), (10/4)',
    expectation: { score: '5-7 7-6(4) [10-4]' },
  },
  { score: '3-4(5), 4-1, (10-6)', expectation: { score: '3-4(5) 4-1 [10-6]' } }, //
  { score: '(2/4) (4/0) (10/7)', expectation: { score: '2-4 4-0 [10-7]' } },
  { score: '(1/6) (6/3) (10/4)', expectation: { score: '1-6 6-3 [10-4]' } },
  { score: '(4/0) (4/0)', expectation: { score: '4-0 4-0' } },

  { score: '(9-8)(3)', expectation: { score: '9-8(3)' } }, //
  { score: '6, 4)(7, 5', expectation: { score: '6-4 7-5' } },
  { score: '96-2, 6-4)', expectation: { score: '6-2 6-4' } }, // starts with a '9' instead of '('
  { score: '(6, 4)(7, 6)([10, 8]', expectation: { score: s64768 } }, // see dev notes on superSquare
  { score: '((6, 2)(7, 6)(2))', expectation: { score: '6-2 7-6(2)' } },
  { score: ')6, 4)(6, 2)', expectation: { score: '6-4 6-2' } }, //
  { score: '(8-7(2)', expectation: { score: '8-7(2)' } }, //
  { score: '(6/4), 6/1)', expectation: { score: '6-4 6-1' } },
  { score: '2, 6)(7, 5)(6, 2)', expectation: { score: '2-6 7-5 6-2' } }, // missing opening bracket
  { score: '(4, 6)(6, 0(10, 7)', expectation: { score: '4-6 6-0 [10-7]' } }, // missing internal close paren
  { score: '(3, 6)(7, 6)(6, 4(', expectation: { score: '3-6 7-6 6-4' } },
  { score: '(1/6, 6/3, 7/6[3])', expectation: { score: '1-6 6-3 7-6(3)' } },
  { score: '((3-6) (6-3) (6-1)', expectation: { score: '3-6 6-3 6-1' } },
  { score: '(9, 2', expectation: { score: '9-2' } },
  { score: '9-1', expectation: { score: '9-1' } },
  { score: '113', expectation: { score: '[11-3]' } },
  // { score: '311', expectation: { score: '[3-11]' } },
  { score: '311', expectation: { score: '' } },
  // { score: 310, expectation: { score: '[3-10]' } },
  { score: 310, expectation: { score: '' } },
  { score: 103, expectation: { score: '[10-3]' } },
  { score: 113, expectation: { score: '[11-3]' } },
  { score: 6475, expectation: { score: '6-4 7-5' } },
  { score: '93', expectation: { score: '9-3' } },
  { score: '103', expectation: { score: '[10-3]' } },
  { score: '2675119', expectation: { score: '2-6 7-5 [11-9]' } },
  { score: '4664104', expectation: { score: '4-6 6-4 [10-4]' } },
  { score: '6 36, 1', expectation: { score: '6-3 6-1' } },
  { score: '6 26 3', expectation: { score: '6-2 6-3' } },
  { score: '6 4, 6 3', expectation: { score: '6-4 6-3' } },
  { score: '7/6(11/9), 5/7, 6/2', expectation: { score: '7-6(9) 5-7 6-2' } },
  { score: '6/0, 7/6[7]', expectation: { score: '6-0 7-6(7)' } },
  { score: '6/0, 7/6[7-3]', expectation: { score: '6-0 7-6(3)' } },
  { score: '5/4 [7-4], 5/4 [12-11]', expectation: { score: s5445411 } },
  { score: '5/4 (7-4), 5/4 (12-11)', expectation: { score: s5445411 } },
  { score: '8 30 am', expectation: { score: '' } }, // => should reject
  { score: '9-8 (7-0)', expectation: { score: '9-8(0)' } },
  { score: '9/8 [7/0]', expectation: { score: '9-8(0)' } },
  { score: '6-2/6-3.', expectation: { score: '6-2 6-3' } },
  { score: '1/6, 7/6(7, 4)', expectation: { score: '1-6 7-6(4)' } },
  { score: '2-6, 7-6(7-4), 11-9', expectation: { score: '2-6 7-6(4) [11-9]' } },

  // matchUpStatus
  {
    score: '(4, 6)(7, 6)(75)(3, 0) con',
    expectation: { score: s4676530, matchUpStatus: 'RETIRED' },
  },
  {
    score: '(4, 6)(7, 6)[75)(3, 0) con',
    expectation: { score: s4676530, matchUpStatus: 'RETIRED' },
  },
  {
    score: '(4, 6)(7, 6)[75](3, 0) con',
    expectation: { score: s4676530, matchUpStatus: 'RETIRED' },
  },
  {
    score: '4-6, 7-6(5), 2-0 concede',
    expectation: { score: '4-6 7-6(5) 2-0', matchUpStatus: 'RETIRED' },
  },
  {
    score: '2-6 7-6(4) 3-0 conceded',
    expectation: { score: '2-6 7-6(4) 3-0', matchUpStatus: 'RETIRED' },
  },
  {
    score: '4--6, 6--1, 1--0 conceded',
    expectation: { score: '4-6 6-1 1-0', matchUpStatus: 'RETIRED' },
  },
  {
    score: '6-3, 6-6(6-1) cons',
    expectation: { score: '6-3 6-6(6-1)', matchUpStatus: 'RETIRED' },
  },
  {
    score: '3-6, 6-2, 2-0conc',
    expectation: { score: '3-6 6-2 2-0', matchUpStatus: 'RETIRED' },
  },
  {
    score: '6-3, 3-0 coceed',
    expectation: { score: '6-3 3-0', matchUpStatus: 'RETIRED' },
  },
  {
    score: '(6, 2)(4, 2)rtd',
    expectation: { score: '6-2 4-2', matchUpStatus: 'RETIRED' },
  },
  {
    score: '(7, 5)(2, 1)con',
    expectation: { score: '7-5 2-1', matchUpStatus: 'RETIRED' },
  },
  {
    score: '62 32 RET X LES',
    expectation: { score: '6-2 3-2', matchUpStatus: 'RETIRED' },
  },
  {
    score: '63 O1 RET X LES',
    expectation: { score: '6-3 0-1', matchUpStatus: 'RETIRED' },
  },
  {
    score: '(5, 0)( con',
    expectation: { score: '5-0', matchUpStatus: 'RETIRED' },
  },
  {
    score: '2-4 coneced',
    expectation: { score: '2-4', matchUpStatus: 'RETIRED' },
  },
  {
    score: '6/1 conceed',
    expectation: { score: '6-1', matchUpStatus: 'RETIRED' },
  },
  {
    score: '4-2 retd',
    expectation: { score: '4-2', matchUpStatus: 'RETIRED' },
  },

  { score: '4 0, 4 o', expectation: { score: '4-0 4-0' } },
  { score: 'w/o', expectation: { matchUpStatus: 'WALKOVER' } },
  { score: 'w-o', expectation: { matchUpStatus: 'WALKOVER' } },
  { score: 'wo', expectation: { matchUpStatus: 'WALKOVER' } },
  { score: 'walkover', expectation: { matchUpStatus: 'WALKOVER' } },

  {
    score: '6/1, 6/7(3 7), 7/6(7, 4)',
    expectation: { score: '6-1 6-7(3) 7-6(4)' },
  },
  { score: '6-4, 2-6, ( 10-7 )', expectation: { score: '6-4 2-6 [10-7]' } },
  {
    score: '(2, 6)(7, 6)[7, 2](6, 3',
    expectation: { score: '2-6 7-6(2) 6-3' },
  },
  { score: '6/1)(6/3)', expectation: { score: '6-1 6-3' } },
  { score: '57 76(7) 76(49', expectation: { score: '5-7 7-6(7) 7-6(4)' } },
  { score: '3-6, 6-1, (10-6 )', expectation: { score: '3-6 6-1 [10-6]' } },
  { score: '(6, 4)(3, 6)(10, 6', expectation: { score: '6-4 3-6 [10-6]' } },
  { score: '(7, 6)(5), (6, 4)', expectation: { score: '7-6(5) 6-4' } },
  { score: '(6-3)(6-3)', expectation: { score: '6-3 6-3' } },
  { score: '(6-4)(4-6)(6-1)', expectation: { score: '6-4 4-6 6-1' } },
  { score: '(6-1) (4-6) (6-3)', expectation: { score: '6-1 4-6 6-3' } },
  { score: '(7-6)[7-3] (5-7) (6-2)', expectation: { score: '7-6(3) 5-7 6-2' } },
  { score: '(4, 6)(6, 0)(6, 0)', expectation: { score: '4-6 6-0 6-0' } },
  { score: '7-5 6-7 (6) 6-3', expectation: { score: '7-5 6-7(6) 6-3' } },
  {
    score: '6-7 (5), 7-6 (6), 10-7',
    expectation: { score: '6-7(5) 7-6(6) [10-7]' },
  },
  { score: '(6-3, 6-2)', expectation: { score: '6-3 6-2' } },
  { score: '(9 3)', expectation: { score: '9-3' } },
  { score: '(93)', expectation: { score: '9-3' } },
  { score: '(9.3)', expectation: { score: '9-3' } },
  { score: '(9,3)', expectation: { score: '9-3' } },
  { score: '(9/3)', expectation: { score: '9-3' } },
  { score: '(9, 3)', expectation: { score: '9-3' } },
  { score: '9-8 (3)', expectation: { score: '9-8(3)' } },
  { score: '67 (3)', expectation: { score: '6-7(3)' } },
  { score: '61 26 10-5', expectation: { score: '6-1 2-6 [10-5]' } },
  { score: '4662 10-8', expectation: { score: '4-6 6-2 [10-8]' } },
  { score: '41 1', expectation: { score: '4-1' } },
  { score: '76(3) 67(5) 60', expectation: { score: '7-6(3) 6-7(5) 6-0' } },
  { score: '36 63', expectation: { score: '3-6 6-3' } },
  { score: '36 63 [10-5]', expectation: { score: '3-6 6-3 [10-5]' } },
  { score: '36 63 (10-5)', expectation: { score: '3-6 6-3 [10-5]' } },
  { score: `8--5`, expectation: { score: '8-5' } },
  { score: `9--0`, expectation: { score: '9-0' } },
  { score: `6--1, 6--1`, expectation: { score: '6-1 6-1' } },
  { complete: true },
];

let iteration = 0;
let log = false;

it.each(scores.slice(start, end || undefined))(
  'can tidy scores',
  ({ score, expectation, complete }) => {
    if (complete) {
      const transformations = getTransformations();
      log && console.log({ transformations });
    } else {
      iteration += 1;

      const singleScore = end - start === 1;
      if (singleScore && log) console.log({ score });

      const {
        matchUpStatus,
        modifications,
        score: tidy,
        attributes,
        isValid,
      } = tidyScore({
        profile: { matchUpStatuses: { retired: ['rtd', 'coceed'] } }, // misspelling
        stepLog: singleScore,
        iteration,
        fullLog,
        score,
      });

      let metExpectation;
      if (expectation?.matchUpStatus) {
        if (expectations)
          expect(matchUpStatus).toEqual(expectation.matchUpStatus);
        metExpectation = true;
      }

      if (expectation?.score !== undefined) {
        if (expectations) {
          expect(tidy).toEqual(expectation.score);
        } else if (tidy !== expectation.score) {
          console.log('\r\nINCORRECT\r\n', {
            iteration,
            score,
            matchUpStatus,
            tidy,
            expectation,
          });
        }
        metExpectation = true;
      }

      if ((validPatterns && !isValid) || singleScore) {
        const transformations = getTransformations();
        console.log({ transformations });
        console.log({ isValid, score, tidy, modifications, attributes });
      }

      if (expectations && !metExpectation) {
        console.log({ score, tidy, matchUpStatus });
      }
    }
  }
);
