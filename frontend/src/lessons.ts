import addNumbersLesson from '../../lessons/add-numbers.lesson.json';
import changeAScoreLesson from '../../lessons/change-a-score.lesson.json';
import checkpointFirstWordsLesson from '../../lessons/checkpoint-first-words.lesson.json';
import checkpointMiniPartyLesson from '../../lessons/checkpoint-mini-party.lesson.json';
import checkpointNumberAdventureLesson from '../../lessons/checkpoint-number-adventure.lesson.json';
import chooseAGameLesson from '../../lessons/choose-a-game.lesson.json';
import compareScoresLesson from '../../lessons/compare-scores.lesson.json';
import functionMachineLesson from '../../lessons/function-machine.lesson.json';
import joinWordsLesson from '../../lessons/join-words.lesson.json';
import listOfFriendsLesson from '../../lessons/list-of-friends.lesson.json';
import rememberANameLesson from '../../lessons/remember-a-name.lesson.json';
import repeatACheerLesson from '../../lessons/repeat-a-cheer.lesson.json';
import sayHelloLesson from '../../lessons/say-hello.lesson.json';
import wordsAndNumbersLesson from '../../lessons/words-and-numbers.lesson.json';
import type { Lesson } from './types';

export const LESSONS = [
  sayHelloLesson,
  rememberANameLesson,
  wordsAndNumbersLesson,
  addNumbersLesson,
  joinWordsLesson,
  changeAScoreLesson,
  compareScoresLesson,
  chooseAGameLesson,
  repeatACheerLesson,
  listOfFriendsLesson,
  functionMachineLesson,
  checkpointFirstWordsLesson,
  checkpointNumberAdventureLesson,
  checkpointMiniPartyLesson,
] as Lesson[];
