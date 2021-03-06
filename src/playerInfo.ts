import { PLAYER_HEALTH_REGEN } from "./config";

export class PlayerInfo {
    static money: number = 10;
    static hp: number = 10;
    static timeScale: number = 1;
    static isPaused: boolean = false;
    
    static RNG = new Phaser.Math.RandomDataGenerator();
    static LevelRNG = new Phaser.Math.RandomDataGenerator();
    static levelGeneratingSeed = "";

    static regenProgress: number = 0;

    public static init()
    {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const levelSeedFromQuery = urlParams.get('levelSeed')

        let levelSeed = levelSeedFromQuery
            ? levelSeedFromQuery
            : PlayerInfo.RNG.integer().toString()

        PlayerInfo.levelGeneratingSeed = levelSeed;
        PlayerInfo.LevelRNG = new Phaser.Math.RandomDataGenerator([levelSeed]);

        console.log(`Seed for level generation: ${levelSeed}`)
    }

    public static waveHealthRegen() {
        PlayerInfo.regenProgress += PLAYER_HEALTH_REGEN;
        let restored = Math.floor(PlayerInfo.regenProgress);
        PlayerInfo.hp += restored;
        PlayerInfo.regenProgress -= restored;
    }
}