import {NativeModules} from 'react-native';

const ActivityModule = (
  NativeModules.ActivityModule
    ? NativeModules.ActivityModule
    : new Proxy(
        {},
        {
          get() {
            if (process?.env?.JEST_WORKER_ID === undefined) {
              throw new Error('error while linking activity module');
            }
          },
        },
      )
) as ActivityModuleInterface;

interface ActivityModuleInterface {
  restart(): Promise<void>;
  finish(): Promise<void>;
  finishAndRemoveTask(): Promise<void>;
  getActivityName(): Promise<string>;
}

export const restart = ActivityModule.restart;
export const finish = ActivityModule.finish;
export const finishAndRemoveTask = ActivityModule.finishAndRemoveTask;
export const getActivityName = ActivityModule.getActivityName;

export default ActivityModule;
