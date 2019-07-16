/* eslint-disable */
/* tslint:disable */
import { FULL_DASHBOARD } from '../configs/';
import Sound from 'react-native-sound';

const soundBasePath =  FULL_DASHBOARD + '/public/sounds';

export default class NotificationAdapter {

    public static getInstance (): NotificationAdapter {
        return NotificationAdapter.instance;
    }

    protected static instance: NotificationAdapter = new NotificationAdapter();

    public canPlay = false;

    private sounds: any = {};

    public constructor () {
        if (NotificationAdapter.instance) {
            throw new Error('Instantiation failed: '+
                'use NotificationAdapter.getInstance() instead of new.');
        } else {
            const sound = new Sound((soundBasePath), 'audio/mp3', (message) => {
            if (message) {
                this.canPlay = true;
            }
                sound.play()
            });
            return;
        }
    }

    public addSound(soundName: string, soundPath: string, loop: boolean = false): void{
        if (!this.canPlay) {
            return;
        }
        const sound = new Sound((soundBasePath), (soundPath), (message) => {
            if (message) {
                this.canPlay = true;
            }
            sound.play()
        });
        sound.setVolume(4);
        sound.isLoaded();
        sound.setNumberOfLoops(0);
        this.sounds[soundName] = sound;

    }

    public play(soundName: any) {
        if (this.canPlay && this.sounds[soundName]) {
            console.log('ttt sound play', this.canPlay && this.sounds[soundName], soundName);
            const promise = this.sounds[soundName].play();
            if (promise !== undefined) {
                promise.catch((error: any) => {
                    // catch
                }).then(() => {
                    // then
                });
            }
        }
    }
    public stop(soundName: string): void {
        try {
            if (this.canPlay && this.sounds[soundName]) {
                this.sounds[soundName].pause();
                this.sounds[soundName].currentTime = 0;
            }
        } catch(error) {
            // do nothing :D
        }
    }

}
