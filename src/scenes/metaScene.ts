import { PlayerInfo } from "../playerInfo";
import {Terrain} from "../terrain"
import { GameOverScene } from "./gameOverScene";
import {SCENE_TRANSITION_MS, TDScene} from "./tdScene";
import {TDSceneConfig} from "./tdSceneConfig"
import {SoundManager} from "../soundManager"
import { animationsConfig } from "../animationsConfig"

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: true,
    visible: true,
    key: 'metaScene',
};

export class MetaScene extends Phaser.Scene {

    public scenes: TDScene[]
    public activeScene: TDScene
    public soundManager: SoundManager;

    enemiesSlain: integer = 0;

    constructor() {
        super(sceneConfig);
        this.scenes = [];
        this.soundManager = new SoundManager(this);
    }

    public create() {
        this.createAnimations()

        this.activeScene = this.addScene();
        this.scenes[0].scene.setVisible(true);
        this.scene.start("hudScene");

        this.soundManager.addSounds();
        console.log(`Current game version: ${this.cache.text.get("gameVersion")}`);
    }

  // Creates new Scene, enables it, and sets it invisible
    public addScene(parentSceneKey?: string): TDScene {
        let parentScene = this.getSceneByKey(parentSceneKey)
        let sceneLevel = (parentScene?.sceneLevel ?? -1) + 1;

        let sceneIndex = this.scenes.length;
        const sceneKey = `tdScene${sceneIndex}`

        let newScene = new TDScene(
            new TDSceneConfig(new Terrain(10, 8), sceneLevel, parentSceneKey, sceneKey),
            this,
        );

        this.scene.add(
            sceneKey,
            newScene,
            true
        );
        this.scenes.push(newScene)
        newScene.scene.setVisible(false);
        if (this.activeScene) this.scene.bringToTop(this.activeScene.scene.key);
        this.scene.bringToTop('hudScene');

        return newScene;
    }

    public getSceneByKey(key?: string): TDScene | undefined {
        if (key) {
            return this.scene.get(key) as TDScene
        }
    }


    // makes current scene invisible, makes new scene visible; doesn't change activness
    public switchToScene(newSceneKey: string, goingInside: boolean, i = 0, j = 0) {
        this.activeScene?.setIsForeground(false, goingInside, i, j);
        let newScene = this.getSceneByKey(newSceneKey)

        console.log(
            `Switching from ${this.activeScene.scene.key} (parent ${this.activeScene.sceneParentKey}) to`
            + ` ${newScene.scene.key} (parent ${newScene.sceneParentKey})`
        )

        newScene.time.addEvent({
            delay: SCENE_TRANSITION_MS,
            loop: false,
            callback: () => {
                this.activeScene?.scene.setVisible(false)
                newScene.scene.setVisible(true)
                this.activeScene = newScene
                newScene.setIsForeground(true, goingInside, i, j);
                this.scene.bringToTop(newSceneKey);
                this.scene.bringToTop('hudScene');
            }
        })

        // 1.05946309436 ~ 2^(1/12), i.e. one semitone
        this.sound.setRate(1 / (Math.pow(1.05946309436, newScene.sceneLevel)))
    }

    public isGameOver = false;
    public gameOver() {
        if (!this.isGameOver){
            this.sound.setRate(1 / (Math.pow(1.05946309436, 15)))

            this.isGameOver = true;
            let gameOverScene = this.scene.add("gameOverScene", new GameOverScene(this))
            this.scene.start(gameOverScene);
            this.activeScene.scene.pause()
            this.scene.pause()
        }
    }


    public preload() {
        // load the game assets
        this.load.setBaseURL('assets/')

        this.soundManager.loadSounds();

        this.load.spritesheet('weakEnemy', 'enemy.png', {frameWidth: 48, frameHeight: 48});
        this.load.spritesheet('fastEnemy', 'enemy_fast.png', {frameWidth: 48, frameHeight: 48});
        this.load.spritesheet('armouredEnemy', 'enemy_armored.png', {frameWidth: 48, frameHeight: 48});
        this.load.spritesheet('splitterBigEnemy', 'enemy_split_big.png', {frameWidth: 48, frameHeight: 48});
        this.load.spritesheet('splitterSmallEnemy', 'enemy_split_small.png', {frameWidth: 48, frameHeight: 48});
        this.load.spritesheet('fatEnemy', 'enemy_chonk.png', {frameWidth: 56, frameHeight: 56});
        this.load.spritesheet('splitterFatEnemy', 'enemy_split_chonk.png', {frameWidth: 56, frameHeight: 56});

        this.load.image('bullet', 'bullet.png');
        this.load.spritesheet('tileset',
            'tileset.png',
            {frameWidth: 64, frameHeight: 64}
        );
        this.load.spritesheet('towertops',
            'towertop.png',
            {frameWidth: 64, frameHeight: 64}
        )
        this.load.spritesheet('towermids',
            'towermid.png',
            {frameWidth: 64, frameHeight: 64}
        )
        this.load.spritesheet('towerbases',
            'towerbase.png',
            {frameWidth: 64, frameHeight: 64}
        )
        this.load.spritesheet('buttonIcons',
            'button_icons.png',
            {frameWidth: 64, frameHeight: 64}
        )
        this.load.image('particle_red', 'particle_red.png');

        this.load.spritesheet('portalFrom', 'portal_from.png', {frameWidth: 40, frameHeight: 40});
        this.load.spritesheet('portalTo', 'portal_to.png', {frameWidth: 40, frameHeight: 40});

        this.load.text("gameVersion", "./version.txt");
    }

    createAnimations() {
        for (let cfg of animationsConfig) {
            this.anims.create({
                key: cfg.key,
                frames: this.anims.generateFrameNumbers(cfg.spriteSheet, cfg.frames),
                frameRate: cfg.frameRate,
                repeat: -1
            });
        }
    }

    getActiveScene() {
        return this.activeScene;
    }

    getParentScenesToRoot() {
        let parentScenes: TDScene[] = []
        let scene = this.getActiveScene();

        while (scene?.sceneParentKey) {
            let parent = this.getSceneByKey(scene.sceneParentKey)
            parentScenes.push(parent);
            scene = parent;
        }

        return parentScenes;
    }

    getRootTDScene() {
        let scene = this.getActiveScene();

        while (scene?.sceneParentKey) {
            scene = this.getSceneByKey(scene.sceneParentKey)
        }

        return scene
    }
}