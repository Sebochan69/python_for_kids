import changeAScoreLesson from '../../lessons/change-a-score.lesson.json';
import chooseAGameLesson from '../../lessons/choose-a-game.lesson.json';
import functionMachineLesson from '../../lessons/function-machine.lesson.json';
import rememberANameLesson from '../../lessons/remember-a-name.lesson.json';
import repeatACheerLesson from '../../lessons/repeat-a-cheer.lesson.json';
import sayHelloLesson from '../../lessons/say-hello.lesson.json';
import type { Lesson } from './types';

export const LESSONS = [
  sayHelloLesson,
  rememberANameLesson,
  changeAScoreLesson,
  repeatACheerLesson,
  chooseAGameLesson,
  functionMachineLesson,
] as Lesson[];
