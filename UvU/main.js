phina.globalize();

var SCREEN_WIDTH = 680;              // スクリーン幅
var SCREEN_HEIGHT = 960;              // スクリーン高さ
var SCREEN_CENTER_X = SCREEN_WIDTH / 2;   // スクリーン幅の半分
var SCREEN_CENTER_Y = SCREEN_HEIGHT / 2;  // スクリーン高さの半分
var FONT_FAMILY = "'Press Start 2P','Meiryo',sans-serif";
var ASSETS = {
    image: {
        "player": "./resource/angus_128.png",

        "utena1": "./resource/utena1.png",
        "utena2": "./resource/utena2.png",
        "utena3": "./resource/utena3.png",
        "utena4": "./resource/utena4.png",
        "utena5": "./resource/utena5.png",
        "utena6": "./resource/utena6.png",
        "ika": "./resource/ika.png",

        "bg_gra": "./resource/bg_gra.png",
        "bg_sky": "./resource/bg_sky.png",
        "bg_floor": "./resource/bg_floor.png",
    },
    sound: {
        "fallSE": "./resource/fall.mp3",
    }
};

var bgFloorX = 450;
var bgSkyX = 450;
var player = null;
var kasuriBonus = 0;
let group0 = null;  // BG
let group1 = null;  // Player / Enemy
let group2 = null;  // SCORE

// 共有ボタン用
let postText = null;
const postURL = "https://iwasaku.github.io/test/UvU/";
const postTags = "#ネムレス #NEMLESSS";

phina.main(function () {
    var app = GameApp({
        startLabel: 'logo',
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        assets: ASSETS,
        fps: 30,
        backgroundColor: 'black',

        // シーンのリストを引数で渡す
        scenes: [
            {
                className: 'LogoScene',
                label: 'logo',
                nextLabel: 'title',
            },

            {
                className: 'TitleScene',
                label: 'title',
                nextLabel: 'game',
            },
            {
                className: 'GameScene',
                label: 'game',
                nextLabel: 'game',
            },
        ]
    });

    // iOSなどでユーザー操作がないと音がならない仕様対策
    // 起動後初めて画面をタッチした時に『無音』を鳴らす
    app.domElement.addEventListener('touchend', function dummy() {
        var s = phina.asset.Sound();
        s.loadFromBuffer();
        s.play().stop();
        app.domElement.removeEventListener('touchend', dummy);
    });

    // fps表示
    //app.enableStats();

    // 実行
    app.run();
});

/*
* ローディング画面をオーバーライド
*/
phina.define('LoadingScene', {
    superClass: 'DisplayScene',

    init: function (options) {
        this.superInit(options);
        // 背景色
        var self = this;
        var loader = phina.asset.AssetLoader();

        // 明滅するラベル
        let label = phina.display.Label({
            text: "",
            fontSize: 64,
            fill: 'white',
        }).addChildTo(this).setPosition(SCREEN_CENTER_X, SCREEN_CENTER_Y);

        // ロードが進行したときの処理
        loader.onprogress = function (e) {
            // 進捗具合を％で表示する
            label.text = "{0}%".format((e.progress * 100).toFixed(0));
        };

        // ローダーによるロード完了ハンドラ
        loader.onload = function () {
            // Appコアにロード完了を伝える（==次のSceneへ移行）
            self.flare('loaded');
        };

        // ロード開始
        loader.load(options.assets);
    },
});

/*
 * ロゴ
 */
phina.define("LogoScene", {
    superClass: 'DisplayScene',

    init: function (option) {
        this.superInit(option);
        this.localTimer = 0;
        this.font1 = false;
        this.font2 = false;
    },

    update: function (app) {
        // フォントロード完了待ち
        var self = this;
        document.fonts.load('10pt "Press Start 2P"').then(function () {
            self.font1 = true;
        });
        document.fonts.load('10pt "icomoon"').then(function () {
            self.font2 = true;
        });
        if (this.font1 && this.font2) {
            self.exit();
        }
    }
});

/*
 * タイトル
 */
phina.define("TitleScene", {
    superClass: 'DisplayScene',

    init: function (option) {
        this.superInit(option);

        titleLabel = Label({
            text: " U.v.U.",
            fontSize: 64,
            fontFamily: FONT_FAMILY,
            align: "center",
            fill: "#fff",
            x: SCREEN_CENTER_X,
            y: 320,
        }).addChildTo(this);

        startButton = Button({
            text: "START",
            fontSize: 32,
            fontFamily: FONT_FAMILY,
            fill: "#444",
            x: SCREEN_CENTER_X,
            y: 650,
        }).addChildTo(this)

        this.localTimer = 0;

        var self = this;
        startButton.onpush = function () {
            self.exit();
        };
    },

    update: function (app) {
    }
});

/*
 * ゲーム
 */
phina.define("GameScene", {
    superClass: 'DisplayScene',

    init: function (option) {
        this.superInit(option);

        group0 = DisplayElement().addChildTo(this);
        group1 = DisplayElement().addChildTo(this);
        group2 = DisplayElement().addChildTo(this);

        this.bgGradation = phina.display.Sprite("bg_gra").addChildTo(group0);
        this.bgGradation.setPosition(SCREEN_CENTER_X, SCREEN_CENTER_Y);

        this.bgFloor0 = phina.display.Sprite("bg_floor").addChildTo(group0);
        this.bgFloor0.setPosition(bgFloorX, 900);
        this.bgFloor1 = phina.display.Sprite("bg_floor").addChildTo(group0);
        this.bgFloor1.setPosition(bgFloorX + 900, 900);

        this.bgSky0 = phina.display.Sprite("bg_sky").addChildTo(group0);
        this.bgSky0.setPosition(bgSkyX, 300);
        this.bgSky1 = phina.display.Sprite("bg_sky").addChildTo(group0);
        this.bgSky1.setPosition(bgSkyX + 900, 300);

        player = new Player().addChildTo(group1);

        nowScoreLabel = Label({
            text: "0",
            fontSize: 32,
            fontFamily: FONT_FAMILY,
            align: "center",
            fill: "#fff",
            shadow: "#000",
            shadowBlur: 10,
            x: SCREEN_CENTER_X,
            y: SCREEN_HEIGHT - 24,
        }).addChildTo(group2);

        introLabel = Label({
            text: "TAP TO START",
            fontSize: 32,
            fontFamily: FONT_FAMILY,
            align: "center",
            fill: "#fff",
            shadow: "#000",
            shadowBlur: 10,
            x: SCREEN_CENTER_X,
            y: SCREEN_CENTER_Y + 80,
        }).addChildTo(group2);

        screenButton = Button({
            text: "",
            fontSize: 32,
            fontFamily: FONT_FAMILY,
            fill: "#444",
            x: SCREEN_CENTER_X,
            y: SCREEN_CENTER_Y,
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
        }).addChildTo(group2)
        screenButton.alpha = 0.0;
        screenButton.onpointstart = function () {
            if (player.isDead) {
                return;
            }
            if (!player.isStart) {
                introLabel.remove();
            }
            player.vec.y = -20;
            player.isStart = true;
        };

        this.buttonAlpha = 0.0;

        this.score = 0;
        this.frame = 0;
        this.enemyCount = 0;
        this.ikaFrame = 0;
        this.ikaCount = 0;

        kasuriBonus = 0;

        this.stopBGM = false;
    },

    update: function (app) {
        if (!player.isDead) {

            // 床スクロール
            bgFloorX -= 3;
            if (bgFloorX < -450) bgFloorX = 450;

            this.bgFloor0.setPosition(bgFloorX, 900);
            this.bgFloor1.setPosition(bgFloorX + 900, 900);

            // 背景スクロール
            bgSkyX -= 1;
            if (bgSkyX < -450) bgSkyX = 450;

            this.bgSky0.setPosition(bgSkyX, 300);
            this.bgSky1.setPosition(bgSkyX + 900, 300);

            if (player.isStart) {
                this.score++;
                this.frame++;
                this.tmpSec = Math.floor(this.frame / app.fps);
                if (this.tmpSec > 170) this.frame = 0; // 170で１周する

                if (this.frame % 60 == 0) {
                    this.enemyNum = -1;
                    // 敵発生数の決定
                    if (this.tmpSec < 60) {
                        this.enemyNum = 1;
                    } else if (this.tmpSec < 120) {
                        if (phina.util.Random.randint(1, 2) <= 1) this.enemyNum = 2;
                        else this.enemyNum = 1;
                    } else {
                        if (phina.util.Random.randint(1, 10) <= 1) this.enemyNum = 3;
                        else if (phina.util.Random.randint(1, 3) <= 2) this.enemyNum = 2;
                        else this.enemyNum = 1;
                    }

                    (this.enemyNum).times(function () {
                        // 敵種別の決定
                        this.enemyKind = -1;
                        if (this.tmpSec < 10) this.enemyKind = 0;
                        else if (this.tmpSec < 20) this.enemyKind = 1;
                        else if (this.tmpSec < 30) this.enemyKind = 2;
                        else if (this.tmpSec < 40) this.enemyKind = 3;
                        else if (this.tmpSec < 50) this.enemyKind = 4;
                        else if (this.tmpSec < 60) this.enemyKind = 5;
                        else if (this.tmpSec < 70) this.enemyKind = 0;
                        else if (this.tmpSec < 80) this.enemyKind = 1;
                        else if (this.tmpSec < 90) this.enemyKind = 2;
                        else if (this.tmpSec < 100) this.enemyKind = 3;
                        else if (this.tmpSec < 110) this.enemyKind = 4;
                        else if (this.tmpSec < 120) this.enemyKind = 5;
                        else if (this.tmpSec < 130) this.enemyKind = phina.util.Random.randint(0, 1);
                        else if (this.tmpSec < 140) this.enemyKind = phina.util.Random.randint(0, 2);
                        else if (this.tmpSec < 150) this.enemyKind = phina.util.Random.randint(0, 3);
                        else if (this.tmpSec < 160) this.enemyKind = phina.util.Random.randint(0, 4);
                        else this.enemyKind = phina.util.Random.randint(0, 5);

                        var enemy = Enemy(this.enemyKind).addChildTo(group1);

                        // スタート位置
                        enemy.x = SCREEN_WIDTH + 64;
                        if (this.enemyCount % 3 == 0) enemy.y = phina.util.Random.randint(0 + 64, player.y);
                        else enemy.y = phina.util.Random.randint(0 + 64, SCREEN_HEIGHT - 120 - 64);
                        enemy.yOfs = enemy.y;
                    }, this);
                    this.enemyCount++;
                }

                // イカ発生フレームの加減算
                if (player.y < 128) this.ikaFrame += 2;
                else if (player.y < 256) this.ikaFrame += 1;
                else if (player.y < 384) this.ikaFrame += 0;
                else if (player.y < 512) this.ikaFrame -= 1;

                if (this.ikaFrame < 0) this.ikaFrame = 0;

                if (this.ikaFrame > 180) {
                    var enemy = Enemy(6).addChildTo(group1);
                    enemy.x = SCREEN_WIDTH + 64;
                    enemy.y = phina.util.Random.randint(0 + 64, player.y);
                    enemy.yOfs = enemy.y;

                    this.ikaFrame = 0;
                }
            }
            nowScoreLabel.text = Math.floor(this.score / app.fps) + kasuriBonus;
        } else {
            if (!this.stopBGM) {
                SoundManager.play("fallSE");
                this.stopBGM = true;

                resultScoreLabel = Label({
                    text: nowScoreLabel.text,
                    fontSize: 64,
                    fontFamily: FONT_FAMILY,
                    align: "center",
                    fill: "#fff",
                    shadow: "#000",
                    shadowBlur: 10,
                    x: SCREEN_CENTER_X,
                    y: 320,
                }).addChildTo(group2);

                xButton = Button({
                    text: String.fromCharCode(0xe902),
                    fontFamily: "icomoon",
                    fontSize: 32,
                    fill: "#7575EF",
                    x: SCREEN_CENTER_X - 160 - 76,
                    y: 650,
                    width: 60,
                    height: 60,
                }).addChildTo(group2);
                xButton.alpha = 0.0;
                xButton.sleep();
                threadsButton = Button({
                    text: String.fromCharCode(0xe901),
                    fontFamily: "icomoon",
                    fontSize: 32,
                    fill: "#7575EF",
                    x: SCREEN_CENTER_X - 160,
                    y: 650,
                    width: 60,
                    height: 60,
                }).addChildTo(group2);
                threadsButton.alpha = 0.0;
                threadsButton.sleep();
                bskyButton = Button({
                    text: String.fromCharCode(0xe900),
                    fontFamily: "icomoon",
                    fontSize: 32,
                    fill: "#7575EF",  // ボタン色
                    x: SCREEN_CENTER_X - 160 + 76,
                    y: 650,
                    width: 60,
                    height: 60,
                }).addChildTo(group2);
                bskyButton.alpha = 0.0;
                bskyButton.sleep();

                postText = "U.v.U.\nスコア: " + resultScoreLabel.text;
                xButton.onclick = function () {
                    // https://developer.x.com/en/docs/twitter-for-websites/tweet-button/guides/web-intent
                    let shareURL = "https://x.com/intent/tweet?text=" + encodeURIComponent(postText + "\n" + postTags + "\n") + "&url=" + encodeURIComponent(postURL);
                    window.open(shareURL);
                };
                threadsButton.onclick = function () {
                    // https://developers.facebook.com/docs/threads/threads-web-intents/
                    // web intentでのハッシュタグの扱いが環境（ブラウザ、iOS、Android）によって違いすぎるので『#』を削って通常の文字列にしておく
                    let shareURL = "https://www.threads.net/intent/post?text=" + encodeURIComponent(postText + "\n\n" + postTags.replace(/#/g, "")) + "&url=" + encodeURIComponent(postURL);
                    window.open(shareURL);
                };
                bskyButton.onclick = function () {
                    // https://docs.bsky.app/docs/advanced-guides/intent-links
                    let shareURL = "https://bsky.app/intent/compose?text=" + encodeURIComponent(postText + "\n" + postTags + "\n" + postURL);
                    window.open(shareURL);
                };

                restartButton = Button({
                    text: "RESTART",
                    fontFamily: FONT_FAMILY,
                    fontSize: 32,
                    fill: "#B2B2B2",
                    x: SCREEN_CENTER_X + 160,
                    y: 650,
                    width: 240,
                    height: 60,
                }).addChildTo(group2);
                let self = this;
                restartButton.onpush = function () {
                    self.exit();
                };
                restartButton.alpha = 0.0;
                restartButton.sleep();

                nowScoreLabel.remove();
            }
            this.buttonAlpha += 0.05;
            if (this.buttonAlpha > 1.0) {
                this.buttonAlpha = 1.0;
            }
            xButton.alpha = this.buttonAlpha;
            bskyButton.alpha = this.buttonAlpha;
            threadsButton.alpha = this.buttonAlpha;
            restartButton.alpha = this.buttonAlpha;
            if (this.buttonAlpha > 0.7) {
                xButton.wakeUp();
                bskyButton.wakeUp();
                threadsButton.wakeUp();
                restartButton.wakeUp();
            }
        }
    }
});

/*
 * Player
 */
phina.define("Player", {
    superClass: "Sprite",

    init: function (option) {
        this.superInit("player", 128, 128);
        this.direct = '';
        this.vec = phina.geom.Vector2(0, 0);
        this.zRot = 0;
        this.setPosition(200, SCREEN_CENTER_Y).setScale(1, 1);
        this.setInteractive(false);
        this.setBoundingType("circle");
        this.radius = 48;

        this.isStart = false;
        this.isDead = false;
    },


    update: function (app) {
        if (!this.isStart) {
            return;
        }
        this.position.add(this.vec);
        if (this.y > SCREEN_HEIGHT - 120) {
            this.isDead = true;
            this.y = SCREEN_HEIGHT - 120;
            return;
        }

        if (this.y < 32) {
            this.y = 32;
        }

        if (this.vec.y < 0) {
            this.zRot = -16;
        }
        if (this.vec.y > 0) {
            this.zRot += 2;
            if (this.zRot > 35) {
                this.zRot = 35;
            }
        }
        this.rotation = this.zRot;

        this.vec.y += 2;
        if (this.vec.y >= 30) {
            this.vec.y = 30;
        }

    },
});

/*
 * Enemey
 */
phina.define("Enemy", {
    superClass: "Sprite",

    init: function (kind) {
        this.spriteName = "";
        switch (kind) {
            case 0:
                this.spriteName = "utena5";
                this.superInit(this.spriteName, 128, 128);
                break;
            case 1:
                this.spriteName = "utena1";
                this.superInit(this.spriteName, 128, 128);
                break;
            case 2:
                this.spriteName = "utena2";
                this.superInit(this.spriteName, 128, 128);
                break;
            case 3:
                this.spriteName = "utena4";
                this.superInit(this.spriteName, 128, 128);
                break;
            case 4:
                this.spriteName = "utena6";
                this.superInit(this.spriteName, 128, 128);
                break;
            case 5:
                this.spriteName = "utena3";
                this.superInit(this.spriteName, 128, 128);
                break;
            case 6:
                this.spriteName = "ika";
                this.superInit(this.spriteName, 128, 64);
                break;
        }
        this.direct = '';
        this.setInteractive(false);
        this.setBoundingType("circle");
        this.radius = 48;

        this.speedOfs = phina.util.Random.randint(4, 10);
        this.sinOfs = Math.random() * 20;
        this.kind = kind;
        this.vec = phina.geom.Vector2(0, 0);
        this.position.set(0, 0);
        this.yOfs = 0;
        if (phina.util.Random.randint(0, 1) == 0) {
            this.yDir = 1;
        } else {
            this.yDir = -1;
        }
        this.counter = 0;
        this.kasuri = 0;
    },

    update: function (app) {
        if (player.isDead) {
            return;
        }
        switch (this.kind) {
            case 0:
                this.vec.x = -this.speedOfs;
                this.position.add(this.vec);
                break;
            case 1:
                this.vec.x = -this.speedOfs;
                this.position.add(this.vec);
                this.y = (50.0 + this.sinOfs) * Math.sin(this.x / 100.0) + this.yOfs;
                break;
            case 2:
                this.vec.x = -this.speedOfs + ((++this.counter % 19) - 9);
                this.position.add(this.vec);
                break;
            case 3:
                this.vec.x = -this.speedOfs;
                this.vec.y = -this.speedOfs * this.yDir;
                this.position.add(this.vec);
                break;
            case 4:
                this.vec.x = -this.speedOfs;
                this.position.add(this.vec);
                if (++this.counter > 40) this.counter = 0;
                {
                    var tmpX = (this.counter - 20) / 20.0;
                    var tmpY = -this.yDir * (tmpX * tmpX) + this.yDir;
                    if (this.yDir == -1) this.y = SCREEN_HEIGHT - 128;
                    else this.y = 64;
                    this.y += tmpY * (100 + this.sinOfs * 20.0);
                }
                break;
            case 5:
                this.vec.x = -this.speedOfs;
                this.counter -= this.speedOfs;
                this.position.add(this.vec);
                this.x += (this.sinOfs / 4.0 + 5.0) * Math.cos((this.counter + 3.14 / 2) / 50.0);
                this.y += (this.sinOfs / 4.0 + 5.0) * Math.sin(this.counter / 50.0);
                break;
            case 6:
                if (this.x > SCREEN_WIDTH - 64) this.vec.x = -2;
                else if (this.x > 240) this.vec.x = -20;
                else this.vec.x = -40;

                this.position.add(this.vec);
                break;
        }

        // 画面上下判定
        if (this.y > SCREEN_HEIGHT - 120) {
            this.y = SCREEN_HEIGHT - 120;
            this.yDir = 1;
        } else if (this.y < 32) {
            this.y = 32;
            this.yDir = -1;
        }

        // 画面左端から出た?
        if (this.x < -64) this.remove();

        // 自機との衝突判定
        if (this.hitTestElement(player)) {
            player.isDead = true;
            this.remove(); // 削除
        } else {
            // 自機と衝突してなければかすりボーナス判定
            var dx = this.x - player.x;
            var dy = this.y - player.y;
            var dist = Math.sqrt((dx * dx) + (dy * dy));
            switch (this.kasuri) {
                case 0:
                    if (dist <= 124) {
                        this.kasuri = 1;
                    }
                    break;
                case 1:
                    if (dist > 124) {
                        this.kasuri = 2;
                        kasuriBonus += 10;
                    }
                    break;
                case 2:
                    break;
            }
        }
    },
});
